import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bus,
  DollarSign,
  Gauge,
  MapPin,
  Minus,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Wrench
} from 'lucide-react';
import type { Property, Review, AspectSentiment } from '../lib/database.types';
import { getReviewsByProperty, getAspectSentimentsByReview } from '../lib/queries';

interface SentimentAnalysisProps {
  property: Property;
}

interface ReviewWithAspects extends Review {
  aspects?: AspectSentiment[];
}

type AspectName = AspectSentiment['aspect'];

interface AspectStats {
  positive: number;
  negative: number;
  neutral: number;
  totalScore: number;
  scoreCount: number;
  keyPhrases: string[];
}

const initialAspectStats = (): Record<AspectName, AspectStats> => ({
  Location: { positive: 0, negative: 0, neutral: 0, totalScore: 0, scoreCount: 0, keyPhrases: [] },
  Transport: { positive: 0, negative: 0, neutral: 0, totalScore: 0, scoreCount: 0, keyPhrases: [] },
  Utilities: { positive: 0, negative: 0, neutral: 0, totalScore: 0, scoreCount: 0, keyPhrases: [] },
  Price: { positive: 0, negative: 0, neutral: 0, totalScore: 0, scoreCount: 0, keyPhrases: [] }
});

const aspectIcons = {
  Location: MapPin,
  Transport: Bus,
  Utilities: Wrench,
  Price: DollarSign
};

export function SentimentAnalysis({ property }: SentimentAnalysisProps) {
  const [reviews, setReviews] = useState<ReviewWithAspects[]>([]);
  const [loading, setLoading] = useState(true);
  const [aspectStats, setAspectStats] = useState<Record<AspectName, AspectStats>>(initialAspectStats);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const reviewsData = await getReviewsByProperty(property.id);
      const reviewsWithAspects = await Promise.all(
        reviewsData.map(async (review) => {
          const aspects = await getAspectSentimentsByReview(review.id);
          return { ...review, aspects };
        })
      );

      setReviews(reviewsWithAspects);
      calculateAspectStats(reviewsWithAspects);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [property.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  function calculateAspectStats(reviewsWithAspects: ReviewWithAspects[]) {
    const stats = initialAspectStats();

    reviewsWithAspects.forEach((review) => {
      review.aspects?.forEach((aspect) => {
        if (aspect.sentiment === 'Positive') stats[aspect.aspect].positive += 1;
        else if (aspect.sentiment === 'Negative') stats[aspect.aspect].negative += 1;
        else stats[aspect.aspect].neutral += 1;

        stats[aspect.aspect].totalScore += aspect.score;
        stats[aspect.aspect].scoreCount += 1;
        stats[aspect.aspect].keyPhrases.push(...aspect.key_phrases);
      });
    });

    setAspectStats(stats);
  }

  const sentimentSummary = useMemo(() => {
    const positive = reviews.filter((review) => review.sentiment === 'Positive').length;
    const neutral = reviews.filter((review) => review.sentiment === 'Neutral').length;
    const negative = reviews.filter((review) => review.sentiment === 'Negative').length;
    const avgRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

    return {
      total: reviews.length,
      positive,
      neutral,
      negative,
      avgRating,
      avgSentimentScore:
        reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.sentiment_score, 0) / reviews.length : 0
    };
  }, [reviews]);

  const topSignals = useMemo(() => {
    return (Object.entries(aspectStats) as [AspectName, AspectStats][])
      .map(([aspect, stats]) => {
        const totalMentions = stats.positive + stats.negative + stats.neutral;
        const favorability = totalMentions > 0 ? stats.positive / totalMentions : 0;
        const avgScore = stats.scoreCount > 0 ? stats.totalScore / stats.scoreCount : 0;

        const keywordFrequency = stats.keyPhrases.reduce<Record<string, number>>((acc, phrase) => {
          const key = phrase.toLowerCase();
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});

        const topKeywords = Object.entries(keywordFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([word]) => word);

        return {
          aspect,
          totalMentions,
          favorability,
          avgScore,
          topKeywords,
          positive: stats.positive,
          negative: stats.negative,
          neutral: stats.neutral
        };
      })
      .sort((a, b) => b.favorability - a.favorability);
  }, [aspectStats]);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading sentiment analytics...</div>;
  }

  const concernAreas = topSignals.filter((item) => item.negative > item.positive);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Reviews" value={String(sentimentSummary.total)} icon={<Gauge className="w-4 h-4 text-cyan-300" />} />
        <MetricCard
          label="Average Rating"
          value={`${sentimentSummary.avgRating.toFixed(1)} / 5`}
          icon={<Star className="w-4 h-4 text-amber-300" />}
        />
        <MetricCard
          label="Positive Reviews"
          value={`${sentimentSummary.positive}`}
          description={`${((sentimentSummary.positive / Math.max(sentimentSummary.total, 1)) * 100).toFixed(0)}% of total`}
          icon={<ThumbsUp className="w-4 h-4 text-emerald-300" />}
        />
        <MetricCard
          label="Negative Reviews"
          value={`${sentimentSummary.negative}`}
          description={`${((sentimentSummary.negative / Math.max(sentimentSummary.total, 1)) * 100).toFixed(0)}% of total`}
          icon={<ThumbsDown className="w-4 h-4 text-rose-300" />}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Aspect intelligence from reviews</h3>
        <div className="space-y-4">
          {topSignals.map((signal) => {
            const Icon = aspectIcons[signal.aspect];
            const favorability = signal.totalMentions > 0 ? signal.favorability * 100 : 0;

            return (
              <div key={signal.aspect} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-900">{signal.aspect}</h4>
                    <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{signal.totalMentions} mentions</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Avg aspect score: <span className="font-semibold text-slate-900">{signal.avgScore.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Favorability</span>
                    <span className="font-semibold text-slate-900">{favorability.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${favorability}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Pill tone="positive">{signal.positive} Positive</Pill>
                  <Pill tone="neutral">{signal.neutral} Neutral</Pill>
                  <Pill tone="negative">{signal.negative} Negative</Pill>
                  {signal.topKeywords.length > 0 && <Pill tone="keyword">Keywords: {signal.topKeywords.join(', ')}</Pill>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Strategic highlights</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
              Overall sentiment score from reviews is <strong>{(sentimentSummary.avgSentimentScore * 100).toFixed(0)}%</strong>, indicating buyer confidence.
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 mt-0.5" />
              Best-performing aspect: <strong>{topSignals[0]?.aspect ?? 'N/A'}</strong> based on positive-to-total mention ratio.
            </li>
            <li className="flex items-start gap-2">
              <Minus className="w-4 h-4 text-amber-600 mt-0.5" />
              Neutral mentions are high in some aspects; clearer communication on project updates can convert undecided sentiment.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Priority actions</h3>
          {concernAreas.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {concernAreas.map((area) => (
                <li key={area.aspect} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
                  <span>
                    <strong>{area.aspect}:</strong> Negative mentions ({area.negative}) exceed positives ({area.positive}). Consider an intervention plan for this aspect.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700">No critical negative-heavy aspects detected. Continue monitoring monthly to preserve positive sentiment momentum.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Review feed</h3>

        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between mb-3 gap-4">
              <div>
                <h4 className="font-semibold text-slate-900">{review.user_name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <ReviewSentimentBadge sentiment={review.sentiment} />
            </div>

            <p className="text-slate-700 mb-4">{review.review_text}</p>

            {review.aspects && review.aspects.length > 0 && (
              <div className="border-t border-slate-200 pt-4 flex flex-wrap gap-2">
                {review.aspects.map((aspect) => {
                  const Icon = aspectIcons[aspect.aspect];
                  return (
                    <div key={aspect.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="font-medium">{aspect.aspect}</span>
                        <span className="text-xs text-slate-500">({aspect.sentiment})</span>
                      </div>
                      {aspect.key_phrases.length > 0 && <p className="text-xs text-slate-600 mt-1">{aspect.key_phrases.join(', ')}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon
}: {
  label: string;
  value: string;
  description?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-slate-600">{label}</p>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone: 'positive' | 'neutral' | 'negative' | 'keyword' }) {
  const toneStyles = {
    positive: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    neutral: 'border-amber-200 bg-amber-50 text-amber-700',
    negative: 'border-rose-200 bg-rose-50 text-rose-700',
    keyword: 'border-indigo-200 bg-indigo-50 text-indigo-700'
  };

  return <span className={`rounded-full border px-2 py-1 ${toneStyles[tone]}`}>{children}</span>;
}

function ReviewSentimentBadge({ sentiment }: { sentiment: Review['sentiment'] }) {
  if (sentiment === 'Positive') {
    return <div className="text-xs font-semibold rounded-full px-3 py-1 border border-emerald-200 text-emerald-700 bg-emerald-50">Positive</div>;
  }

  if (sentiment === 'Negative') {
    return <div className="text-xs font-semibold rounded-full px-3 py-1 border border-rose-200 text-rose-700 bg-rose-50">Negative</div>;
  }

  return <div className="text-xs font-semibold rounded-full px-3 py-1 border border-amber-200 text-amber-700 bg-amber-50">Neutral</div>;
}
