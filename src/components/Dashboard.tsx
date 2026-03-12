import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MessageSquare, Home } from 'lucide-react';
import { getSentimentStats, getProperties } from '../lib/queries';

interface DashboardStats {
  totalProperties: number;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  neutralReviews: number;
  avgSentiment: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalReviews: 0,
    positiveReviews: 0,
    negativeReviews: 0,
    neutralReviews: 0,
    avgSentiment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const [sentimentData, properties] = await Promise.all([getSentimentStats(), getProperties()]);
      const avgSentiment =
        properties.length > 0
          ? properties.reduce((sum, property) => sum + property.overall_sentiment_score, 0) / properties.length
          : 0;

      setStats({
        totalProperties: properties.length,
        totalReviews: sentimentData.total,
        positiveReviews: sentimentData.positive,
        negativeReviews: sentimentData.negative,
        neutralReviews: sentimentData.neutral,
        avgSentiment
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-stone-600">Loading dashboard...</div>;
  }

  const positivePercent = stats.totalReviews > 0 ? (stats.positiveReviews / stats.totalReviews) * 100 : 0;

  const cards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: Home,
      tone: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: MessageSquare,
      tone: 'text-indigo-700 bg-indigo-50 border-indigo-200'
    },
    {
      label: 'Positive Sentiment',
      value: `${positivePercent.toFixed(0)}%`,
      icon: TrendingUp,
      tone: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      label: 'Avg Sentiment',
      value: `${(stats.avgSentiment * 100).toFixed(0)}%`,
      icon: BarChart3,
      tone: 'text-orange-700 bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-600 text-sm">{card.label}</p>
                <p className="text-3xl font-semibold mt-1 text-stone-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            {card.label === 'Positive Sentiment' && (
              <div className="mt-4">
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${positivePercent}%` }} />
                </div>
              </div>
            )}
            {card.label === 'Avg Sentiment' && (
              <p className="text-xs mt-4 text-stone-500">
                <span className="text-emerald-700">{stats.positiveReviews} positive</span> ·{' '}
                <span className="text-yellow-700">{stats.neutralReviews} neutral</span> ·{' '}
                <span className="text-red-700">{stats.negativeReviews} negative</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
