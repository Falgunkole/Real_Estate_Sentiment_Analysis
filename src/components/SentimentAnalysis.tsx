import { useState, useEffect, useCallback } from 'react';
import { MapPin, Bus, Wrench, DollarSign, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Property, Review, AspectSentiment } from '../lib/database.types';
import { getReviewsByProperty, getAspectSentimentsByReview } from '../lib/queries';

interface SentimentAnalysisProps {
  property: Property;
}

interface ReviewWithAspects extends Review {
  aspects?: AspectSentiment[];
}

export function SentimentAnalysis({ property }: SentimentAnalysisProps) {
  const [reviews, setReviews] = useState<ReviewWithAspects[]>([]);
  const [loading, setLoading] = useState(true);
  const [aspectStats, setAspectStats] = useState<Record<string, { positive: number; negative: number; neutral: number }>>({});

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
    const stats: Record<string, { positive: number; negative: number; neutral: number }> = {
      Location: { positive: 0, negative: 0, neutral: 0 },
      Transport: { positive: 0, negative: 0, neutral: 0 },
      Utilities: { positive: 0, negative: 0, neutral: 0 },
      Price: { positive: 0, negative: 0, neutral: 0 }
    };

    reviewsWithAspects.forEach((review) => {
      review.aspects?.forEach((aspect) => {
        if (aspect.sentiment === 'Positive') stats[aspect.aspect].positive += 1;
        else if (aspect.sentiment === 'Negative') stats[aspect.aspect].negative += 1;
        else stats[aspect.aspect].neutral += 1;
      });
    });

    setAspectStats(stats);
  }

  const aspectIcons = {
    Location: MapPin,
    Transport: Bus,
    Utilities: Wrench,
    Price: DollarSign
  };

  const sentimentIcon = (sentiment: string) => {
    if (sentiment === 'Positive') return <TrendingUp className="w-4 h-4 text-emerald-700" />;
    if (sentiment === 'Negative') return <TrendingDown className="w-4 h-4 text-red-700" />;
    return <Minus className="w-4 h-4 text-yellow-700" />;
  };

  const sentimentColor = (sentiment: string) => {
    if (sentiment === 'Positive') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    if (sentiment === 'Negative') return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  if (loading) {
    return <div className="text-center py-8 text-stone-600">Loading sentiment analysis...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(aspectStats).map(([aspect, stats]) => {
          const Icon = aspectIcons[aspect as keyof typeof aspectIcons];
          const total = stats.positive + stats.negative + stats.neutral;
          const positivePercent = total > 0 ? (stats.positive / total) * 100 : 0;

          return (
            <div key={aspect} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-amber-700" />
                <h3 className="font-semibold text-stone-900">{aspect}</h3>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1 text-stone-600">
                  <span>Positive signal</span>
                  <span className="font-semibold text-stone-900">{positivePercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${positivePercent}%` }} />
                </div>
              </div>

              <div className="flex justify-between text-xs text-stone-500">
                <span className="text-emerald-700">{stats.positive} +</span>
                <span className="text-yellow-700">{stats.neutral} ~</span>
                <span className="text-red-700">{stats.negative} -</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-stone-900">Reviews & Aspect Analysis</h3>

        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <h4 className="font-semibold text-stone-900">{review.user_name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${sentimentColor(review.sentiment)} flex items-center gap-1`}>
                {sentimentIcon(review.sentiment)}
                {review.sentiment}
              </div>
            </div>

            <p className="text-stone-600 mb-4">{review.review_text}</p>

            {review.aspects && review.aspects.length > 0 && (
              <div className="border-t border-stone-200 pt-4">
                <h5 className="text-sm font-semibold text-stone-700 mb-2">Aspect Sentiments</h5>
                <div className="flex flex-wrap gap-2">
                  {review.aspects.map((aspect) => {
                    const Icon = aspectIcons[aspect.aspect];
                    return (
                      <div key={aspect.id} className={`px-3 py-2 rounded-lg border ${sentimentColor(aspect.sentiment)}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{aspect.aspect}</span>
                          {sentimentIcon(aspect.sentiment)}
                        </div>
                        {aspect.key_phrases.length > 0 && (
                          <div className="text-xs mt-1">
                            <span className="font-semibold">Keywords: </span>
                            <span>{aspect.key_phrases.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
