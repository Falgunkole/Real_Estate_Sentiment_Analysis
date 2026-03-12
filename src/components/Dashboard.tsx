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
      const [sentimentData, properties] = await Promise.all([
        getSentimentStats(),
        getProperties()
      ]);

      const avgSentiment = properties.reduce((sum, p) => sum + p.overall_sentiment_score, 0) / properties.length;

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
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const positivePercent = stats.totalReviews > 0 ? (stats.positiveReviews / stats.totalReviews) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Properties</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Positive Sentiment</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{positivePercent.toFixed(0)}%</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${positivePercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Avg Sentiment Score</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{(stats.avgSentiment * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          <span className="text-green-600 font-medium">{stats.positiveReviews} positive</span>
          {' | '}
          <span className="text-yellow-600 font-medium">{stats.neutralReviews} neutral</span>
          {' | '}
          <span className="text-red-600 font-medium">{stats.negativeReviews} negative</span>
        </div>
      </div>
    </div>
  );
}
