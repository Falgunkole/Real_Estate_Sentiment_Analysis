import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Building2,
  BarChart3,
  Database,
  FileSpreadsheet,
  LayoutGrid,
  MapPin,
  Search,
  ShieldCheck,
  Smile,
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
    const uniqueLocations = new Set(properties.map((property) => property.location)).size;

    return {
      totalListings: properties.length,
      uniqueLocations,
      aspectCount: aspectNames.length,
      reviewCount: allReviews.length,
      globalSentiment: averageReviewScore(propertyInsights),
      topProperty: [...propertyInsights].sort((a, b) => b.property.overall_sentiment_score - a.property.overall_sentiment_score)[0]
    };
  }, [properties, propertyInsights]);

  const topProperties = useMemo(
    () => [...propertyInsights].sort((a, b) => b.property.overall_sentiment_score - a.property.overall_sentiment_score).slice(0, 3),
    [propertyInsights]
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-cyan-700 selection:text-white font-sans">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
        <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-700 text-slate-100 shadow-md shadow-cyan-900/40 transition-transform duration-300 hover:scale-105">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                Sentiment<span className="text-cyan-400">Intel</span>
              </h1>
              <p className="mt-1 text-sm text-slate-300">Real Estate Sentiment File Dashboard</p>
            </div>
          </div>
          <div className="hidden cursor-default items-center gap-2 rounded-lg border border-cyan-700/60 bg-cyan-900/30 px-4 py-2 text-sm text-cyan-100 sm:flex">
            File-based sentiment dataset loaded
            <span className="relative ml-2 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-6 py-10 lg:px-12">
        {loading ? (
          <div className="flex animate-fade-in flex-col items-center justify-center py-32">
            <div className="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
            <p className="text-lg text-slate-300">Loading sentiment files...</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <StatCard icon={<LayoutGrid className="h-6 w-6 text-cyan-300" />} title="Total Properties" value={dashboardStats.totalListings} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <StatCard
                  icon={<Database className="h-6 w-6 text-emerald-300" />}
                  title="Records in File"
                  value={dashboardStats.reviewCount}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <StatCard icon={<Tag className="h-6 w-6 text-violet-300" />} title="Aspects Tracked" value={dashboardStats.aspectCount} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <StatCard icon={<MapPin className="h-6 w-6 text-amber-300" />} title="Locations Covered" value={dashboardStats.uniqueLocations} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <StatCard icon={<Smile className="h-6 w-6 text-sky-300" />} title="Global Sentiment" value={`${dashboardStats.globalSentiment}%`} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div
                className="animate-slide-up rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl shadow-slate-950/40"
                style={{ animationDelay: '0.6s' }}
              >
                <h3 className="mb-8 flex items-center gap-2 text-xl font-bold text-slate-100">
                  <TrendingUp className="h-5 w-5 text-cyan-300" />
                  Property Sentiment Leaderboard
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {topProperties.map((insight, idx) => (
                    <button
                      key={insight.property.id}
                      type="button"
                      onClick={() => setSelectedProperty(insight.property)}
                      className="group relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-950/40"
                    >
                      <div className="absolute right-4 top-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Rank</div>
                      <div className="mb-4 text-3xl font-black text-slate-500">#{idx + 1}</div>
                      <h4 className="mb-1 text-base font-bold text-slate-100">{insight.property.name}</h4>
                      <p className="mb-4 text-sm text-slate-300">{insight.property.location}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-cyan-300">{Math.round(insight.property.overall_sentiment_score * 100)}%</span>
                        <span className="text-xs uppercase tracking-wide text-slate-300">Confidence</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.7s' }}>
                <article className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-100">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-300" />
                    Sentiment Input Source
                  </h3>
                  <p className="text-sm leading-6 text-slate-300">
                    This dashboard is based on uploaded sentiment data files and precomputed aspect scores for each property.
                    It is not using live review extraction.
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-100">
                    <BarChart3 className="h-5 w-5 text-amber-300" />
                    Snapshot Highlights
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>
                      Highest confidence property:{' '}
                      <span className="font-semibold text-slate-100">{dashboardStats.topProperty?.property.name ?? 'N/A'}</span>
                    </li>
                    <li>
                      Data records currently analyzed:{' '}
                      <span className="font-semibold text-slate-100">{dashboardStats.reviewCount}</span>
                    </li>
                    <li>
                      Average portfolio sentiment:{' '}
                      <span className="font-semibold text-slate-100">{dashboardStats.globalSentiment}%</span>
                    </li>
                  </ul>
                </article>

                <article className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-slate-950/40">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-100">
                    <ShieldCheck className="h-5 w-5 text-violet-300" />
                    Recommendation
                  </h3>
                  <p className="text-sm leading-6 text-slate-300">
                    Upload updated sentiment files periodically to keep insights current and comparable across all properties.
                  </p>
                </article>
              </div>
            </div>

            <section className="animate-slide-up rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl shadow-slate-950/40" style={{ animationDelay: '0.8s' }}>
              <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">Property Intelligence Directory</h3>
                  <p className="mt-1 text-slate-300">Detailed breakdown of all properties from the sentiment data file.</p>
                </div>
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or location..."
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-900"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="bg-slate-800 text-xs uppercase tracking-wider text-slate-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Property</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Sentiment Status</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                      <th className="px-6 py-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-900">
                    {filteredInsights.map((row) => (
                      <tr key={row.property.id} className="group transition-colors hover:bg-slate-800">
                        <td className="px-6 py-5 font-bold text-slate-100">{row.property.name}</td>
                        <td className="px-6 py-5 text-slate-300">{row.property.location}</td>
                        <td className="px-6 py-5">
                          <SentimentBadge label={row.sentimentLabel} />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-200">{Math.round(row.avgReviewScore * 100)}%</span>
                            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-700 sm:block">
                              <div className="h-full bg-cyan-400" style={{ width: `${Math.round(row.avgReviewScore * 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(row.property)}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-800 px-4 py-2 text-xs font-medium uppercase tracking-wider text-cyan-100 transition-all hover:bg-cyan-600 hover:text-white"
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
          </div>
        )}
      </main>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: ReactNode; title: string; value: string | number }) {
  return (
    <div className="group rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-cyan-950/30">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 transition-all duration-300 group-hover:border-cyan-500 group-hover:bg-slate-700">
          {icon}
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-300">{title}</p>
          <p className="text-3xl font-black tracking-tight text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ label }: { label: PropertyInsight['sentimentLabel'] }) {
  const styles = {
    'Very Positive': 'border-emerald-500/40 bg-emerald-900/40 text-emerald-200',
    Positive: 'border-cyan-500/40 bg-cyan-900/40 text-cyan-200',
    Neutral: 'border-slate-500 bg-slate-800 text-slate-200',
    Negative: 'border-rose-500/40 bg-rose-900/40 text-rose-200'
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${styles[label]}`}>{label}</span>;
}

function averageReviewScore(insights: PropertyInsight[]) {
  const reviewScores = insights.flatMap((insight) => insight.reviews.map((review) => review.sentiment_score));
  if (reviewScores.length === 0) return 0;
  return Math.round((reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length) * 100);
}

export default App;
