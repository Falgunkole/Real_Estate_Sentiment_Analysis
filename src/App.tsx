import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  LayoutGrid,
  MessageSquare,
  Search,
  Smile,
  Star,
  Tag,
  TrendingUp
} from 'lucide-react';
import { PropertyModal } from './components/PropertyModal';
import type { Property, Review } from './lib/database.types';
import { getProperties, getReviewsByProperty } from './lib/queries';

interface PropertyInsight {
  property: Property;
  reviews: Review[];
  avgReviewScore: number;
  sentimentLabel: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative';
}

const aspectNames = ['Location', 'Transport', 'Utilities', 'Price'];

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyInsights, setPropertyInsights] = useState<PropertyInsight[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProperty]);

  async function loadData() {
    try {
      setLoading(true);
      const propertiesData = await getProperties();
      setProperties(propertiesData);

      const insightRows = await Promise.all(
        propertiesData.map(async (property) => {
          const reviews = await getReviewsByProperty(property.id);
          const avgReviewScore =
            reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.sentiment_score, 0) / reviews.length : 0;

          const sentimentLabel: PropertyInsight['sentimentLabel'] =
            property.overall_sentiment_score >= 0.8
              ? 'Very Positive'
              : property.overall_sentiment_score >= 0.6
                ? 'Positive'
                : property.overall_sentiment_score >= 0.4
                  ? 'Neutral'
                  : 'Negative';

          return {
            property,
            reviews,
            avgReviewScore,
            sentimentLabel
          };
        })
      );

      setPropertyInsights(insightRows);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredInsights = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return propertyInsights;
    return propertyInsights.filter(
      (insight) => insight.property.name.toLowerCase().includes(term) || insight.property.location.toLowerCase().includes(term)
    );
  }, [propertyInsights, searchTerm]);

  const dashboardStats = useMemo(() => {
    const allReviews = propertyInsights.flatMap((insight) => insight.reviews);
    const uniqueReviewers = new Set(allReviews.map((review) => review.user_name.toLowerCase())).size;

    return {
      totalListings: properties.length,
      uniqueReviewers,
      aspectCount: aspectNames.length,
      reviewCount: allReviews.length
    };
  }, [properties, propertyInsights]);

  const topProperties = useMemo(
    () => [...propertyInsights].sort((a, b) => b.property.overall_sentiment_score - a.property.overall_sentiment_score).slice(0, 3),
    [propertyInsights]
  );

  const latestReviews = useMemo(() => {
    const allReviews = propertyInsights.flatMap((insight) => insight.reviews.map((r) => ({ ...r, propertyName: insight.property.name })));
    return allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);
  }, [propertyInsights]);

  const sentimentMix = useMemo(() => {
    const distribution = {
      'Very Positive': 0,
      Positive: 0,
      Neutral: 0,
      Negative: 0
    } satisfies Record<PropertyInsight['sentimentLabel'], number>;

    propertyInsights.forEach((insight) => {
      distribution[insight.sentimentLabel] += 1;
    });

    return distribution;
  }, [propertyInsights]);

  return (
    <div className="min-h-screen w-full bg-stone-100 text-stone-700 selection:bg-amber-200 selection:text-stone-900 font-sans">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-stone-100/95 backdrop-blur-lg animate-fade-in">
        <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-700/20 transition-transform duration-300 hover:scale-105">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                Sentiment<span className="text-amber-700">Intel</span>
              </h1>
              <p className="mt-1 text-sm text-stone-500">Real Estate Portfolio Sentiment Operations</p>
            </div>
          </div>
          <div className="hidden cursor-default items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 sm:flex">
            Live Insights Active
            <span className="relative ml-2 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
        {loading ? (
          <div className="flex animate-fade-in flex-col items-center justify-center py-32">
            <div className="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-300 border-t-amber-700" />
            <p className="text-lg text-stone-500">Aggregating market sentiment...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-8 shadow-sm" style={{ animationDelay: '0.7s' }}>
              <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-stone-900">Property Intelligence Directory</h3>
                  <p className="mt-1 text-stone-500">Detailed breakdown of all tracked properties.</p>
                </div>
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or location..."
                    className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-12 pr-4 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="bg-stone-100 text-xs uppercase tracking-wider text-stone-600">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Property</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Sentiment Status</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                      <th className="px-6 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {filteredInsights.map((row) => (
                      <tr key={row.property.id} className="group transition-colors hover:bg-stone-50">
                        <td className="px-6 py-5 font-bold text-stone-900">{row.property.name}</td>
                        <td className="px-6 py-5 text-stone-500">{row.property.location}</td>
                        <td className="px-6 py-5">
                          <SentimentBadge label={row.sentimentLabel} />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-stone-700">{Math.round(row.avgReviewScore * 100)}%</span>
                            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-stone-200 sm:block">
                              <div className="h-full bg-amber-600" style={{ width: `${Math.round(row.avgReviewScore * 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(row.property)}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-4 py-2 text-xs font-medium uppercase tracking-wider text-amber-800 transition-all hover:bg-amber-600 hover:text-white"
                          >
                            Analyze
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <StatCard icon={<LayoutGrid className="h-6 w-6 text-amber-700" />} title="Total Properties" value={dashboardStats.totalListings} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <StatCard
                  icon={<MessageSquare className="h-6 w-6 text-emerald-700" />}
                  title="Total Reviews Analyzed"
                  value={dashboardStats.reviewCount}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <StatCard icon={<Tag className="h-6 w-6 text-rose-700" />} title="Aspects Tracked" value={dashboardStats.aspectCount} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <StatCard icon={<Smile className="h-6 w-6 text-indigo-700" />} title="Global Sentiment" value={`${averageReviewScore(propertyInsights)}%`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div
                className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-8 shadow-sm xl:col-span-2"
                style={{ animationDelay: '0.5s' }}
              >
                <h3 className="mb-8 flex items-center gap-2 text-xl font-bold text-stone-900">
                  <TrendingUp className="h-5 w-5 text-amber-700" />
                  Property Sentiment Leaderboard
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {topProperties.map((insight, idx) => (
                    <button
                      key={insight.property.id}
                      type="button"
                      onClick={() => setSelectedProperty(insight.property)}
                      className="group relative min-h-48 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-100/80"
                    >
                      <div className="absolute right-4 top-3 text-xs font-semibold uppercase tracking-wider text-stone-400">Rank</div>
                      <div className="mb-4 text-3xl font-black text-stone-200">#{idx + 1}</div>
                      <h4 className="mb-1 text-base font-bold text-stone-900">{insight.property.name}</h4>
                      <p className="mb-4 text-sm text-stone-500">{insight.property.location}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-amber-700">{Math.round(insight.property.overall_sentiment_score * 100)}%</span>
                        <span className="text-xs uppercase tracking-wide text-stone-500">Confidence</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <section className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-8 shadow-sm" style={{ animationDelay: '0.55s' }}>
                <h3 className="mb-4 text-xl font-bold text-stone-900">Overall Sentiment Mix</h3>
                <SentimentMixChart sentimentMix={sentimentMix} />
              </section>

              <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-8 shadow-sm xl:col-span-3" style={{ animationDelay: '0.6s' }}>
                <h3 className="mb-6 text-xl font-bold text-stone-900">Live Review Feed</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {latestReviews.map((review, i) => (
                    <article key={i} className="rounded-lg border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-amber-300">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-semibold text-stone-800">{review.propertyName}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: review.rating }).map((_, idx) => (
                            <Star key={idx} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm text-stone-500">“{review.review_text}”</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: ReactNode; title: string; value: string | number }) {
  return (
    <div className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 transition-all duration-300 group-hover:border-amber-300 group-hover:bg-amber-50">
          {icon}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-stone-500">{title}</p>
          <p className="text-3xl font-black tracking-tight text-stone-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ label }: { label: PropertyInsight['sentimentLabel'] }) {
  const styles = {
    'Very Positive': 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Positive: 'border-amber-200 bg-amber-50 text-amber-800',
    Neutral: 'border-stone-300 bg-stone-100 text-stone-700',
    Negative: 'border-rose-200 bg-rose-50 text-rose-700'
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${styles[label]}`}>{label}</span>;
}

function averageReviewScore(insights: PropertyInsight[]) {
  const reviewScores = insights.flatMap((insight) => insight.reviews.map((review) => review.sentiment_score));
  if (reviewScores.length === 0) return 0;
  return Math.round((reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length) * 100);
}

function SentimentMixChart({ sentimentMix }: { sentimentMix: Record<PropertyInsight['sentimentLabel'], number> }) {
  const total = Object.values(sentimentMix).reduce((sum, value) => sum + value, 0);
  const segments = [
    { label: 'Very Positive', count: sentimentMix['Very Positive'], color: '#16a34a' },
    { label: 'Positive', count: sentimentMix.Positive, color: '#d97706' },
    { label: 'Neutral', count: sentimentMix.Neutral, color: '#64748b' },
    { label: 'Negative', count: sentimentMix.Negative, color: '#e11d48' }
  ];

  let start = 0;
  const gradientStops = segments
    .map((segment) => {
      const portion = total > 0 ? (segment.count / total) * 360 : 0;
      const stop = `${segment.color} ${start}deg ${start + portion}deg`;
      start += portion;
      return stop;
    })
    .join(', ');

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradientStops || '#e2e8f0 0deg 360deg'})` }}>
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-black text-stone-900">{total}</span>
          <span className="text-xs uppercase tracking-widest text-stone-500">Properties</span>
        </div>
      </div>
      <div className="space-y-3">
        {segments.map((segment) => {
          const percent = total > 0 ? Math.round((segment.count / total) * 100) : 0;
          return (
            <div key={segment.label} className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="text-sm font-medium text-stone-700">{segment.label}</span>
              </div>
              <span className="text-sm font-bold text-stone-900">{segment.count} ({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
