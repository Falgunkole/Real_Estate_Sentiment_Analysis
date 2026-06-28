import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  AlertTriangle,
  Bus,
  BadgeDollarSign,
  Gauge,
  MapPin,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Wrench
} from 'lucide-react';
import type { Property, Review, AspectSentiment } from '../lib/database.types';
import {
  getReviewsByProperty,
  getAspectSentimentsByReview,
  getPropertyAspectSummaries,
  type PropertyAspectSummary
} from '../lib/queries';
import { type AspectSentimentLabel } from '../lib/sentiment';

interface SentimentAnalysisProps {
  property: Property;
}

interface ReviewWithAspects extends Review {
  aspects?: AspectSentiment[];
}

const aspectIcons = {
  Location: MapPin,
  Transport: Bus,
  Utilities: Wrench,
  Price: BadgeDollarSign
};

export function SentimentAnalysis({ property }: SentimentAnalysisProps) {
  const [reviews, setReviews] = useState<ReviewWithAspects[]>([]);
  const [aspectSummaries, setAspectSummaries] = useState<PropertyAspectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsData, summaries] = await Promise.all([
        getReviewsByProperty(property.id),
        getPropertyAspectSummaries(property.id)
      ]);

      const reviewsWithAspects = await Promise.all(
        reviewsData.map(async (review) => {
          const aspects = await getAspectSentimentsByReview(review.id);
          return { ...review, aspects };
        })
      );

      setReviews(reviewsWithAspects);
      setAspectSummaries(summaries);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [property.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const sentimentSummary = useMemo(() => {
    const positive = reviews.filter((r) => r.sentiment === 'Positive').length;
    const neutral = reviews.filter((r) => r.sentiment === 'Neutral').length;
    const negative = reviews.filter((r) => r.sentiment === 'Negative').length;
    return {
      total: reviews.length,
      positive,
      neutral,
      negative,
      avgSentimentScore: reviews.length ? reviews.reduce((s, r) => s + r.sentiment_score, 0) / reviews.length : 0
    };
  }, [reviews]);

  const sortedSummaries = useMemo(() => [...aspectSummaries].sort((a, b) => b.score - a.score), [aspectSummaries]);
  const bestAspect = sortedSummaries[0];
  const concernAreas = aspectSummaries.filter((s) => s.verdict_label === 'Negative');

  if (loading) {
    return (
      <div className="space-y-3 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-shimmer" />
        ))}
        <p className="text-center text-sm text-[var(--muted)]">Loading timeline reviews…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Timeline reviews" value={String(sentimentSummary.total)} icon={<Gauge className="h-4 w-4 text-cyan-400" />} />
        <MetricCard label="Positive" value={String(sentimentSummary.positive)} icon={<ThumbsUp className="h-4 w-4 text-emerald-400" />} />
        <MetricCard label="Neutral" value={String(sentimentSummary.neutral)} icon={<TrendingUp className="h-4 w-4 text-amber-400" />} />
        <MetricCard label="Negative" value={String(sentimentSummary.negative)} icon={<ThumbsDown className="h-4 w-4 text-rose-400" />} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
        <h3 className="text-lg font-semibold">Four aspect verdicts (from your dataset)</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">One ML verdict per aspect — all aspects use Positive / Negative / Neutral.</p>
        <div className="mt-4 space-y-3">
          {sortedSummaries.map((summary, i) => {
            const Icon = aspectIcons[summary.aspect as keyof typeof aspectIcons];
            const pct = Math.round(summary.score * 100);
            return (
              <div
                key={summary.aspect}
                className="rounded-xl border border-[var(--border)] p-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-amber-400" />}
                    <span className="font-semibold">{summary.aspect}</span>
                    <span className="text-xs text-[var(--muted)]">{summary.review_count} reviews in timeline</span>
                  </div>
                  <VerdictBadge label={summary.verdict_label} />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                    style={{ width: `${pct}%`, animation: 'bar-grow 0.8s ease-out both' }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Raw: {summary.final_verdict} · Confidence {(summary.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightBox title="Highlights" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
          <li>
            Review sentiment avg: <strong>{(sentimentSummary.avgSentimentScore * 100).toFixed(0)}%</strong>
          </li>
          <li>
            Strongest aspect: <strong>{bestAspect?.aspect}</strong> ({bestAspect?.verdict_label})
          </li>
        </InsightBox>
        <InsightBox title="Actions" icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}>
          {concernAreas.length ? (
            concernAreas.map((a) => (
              <li key={a.aspect}>
                <strong>{a.aspect}</strong>: {a.verdict_label}
              </li>
            ))
          ) : (
            <li>No critical negative aspects for this listing.</li>
          )}
        </InsightBox>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Review timeline</h3>
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {reviews.map((review, i) => (
            <article
              key={review.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{review.user_name}</span>
                <ReviewSentimentBadge sentiment={review.sentiment} />
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">{review.review_text}</p>
              {review.aspects && review.aspects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-3">
                  {review.aspects.map((a) => {
                    const Icon = aspectIcons[a.aspect as keyof typeof aspectIcons];
                    return (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {a.aspect}: {a.sentiment}
                      </span>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="flex items-center justify-between text-[var(--muted)]">
        <span className="text-xs">{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function InsightBox({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <h4 className="mb-2 flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </h4>
      <ul className="space-y-1.5 text-sm text-[var(--muted)]">{children}</ul>
    </div>
  );
}

function VerdictBadge({ label }: { label: AspectSentimentLabel }) {
  const s =
    label === 'Positive'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : label === 'Negative'
        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
        : 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s}`}>{label}</span>;
}

function ReviewSentimentBadge({ sentiment }: { sentiment: Review['sentiment'] }) {
  const s =
    sentiment === 'Positive'
      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
      : sentiment === 'Negative'
        ? 'text-rose-300 border-rose-500/30 bg-rose-500/10'
        : 'text-amber-300 border-amber-500/30 bg-amber-500/10';
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${s}`}>{sentiment}</span>;
}
