import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Building2,
  Download,
  FileText,
  Home,
  LayoutGrid,
  Menu,
  MessageSquare,
  Search,
  Smile,
  Tag,
  Sparkles
} from 'lucide-react';
import { PropertyModal } from './components/PropertyModal';
import { getProperties, getReviewsByProperty } from './lib/queries';
import type { Property, Review } from './lib/database.types';

type PageKey = 'dashboard' | 'listings';

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
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

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
      (insight) => 
        insight.property.name.toLowerCase().includes(term) || 
        insight.property.location.toLowerCase().includes(term)
    );
  }, [propertyInsights, searchTerm]);

  const dashboardStats = useMemo(() => {
    const allReviews = propertyInsights.flatMap((insight) => insight.reviews);
    const uniqueReviewers = new Set(allReviews.map((review) => review.user_name.toLowerCase())).size;

    const sentimentBuckets = {
      Positive: propertyInsights.filter((item) => item.property.overall_sentiment_score >= 0.7).length,
      Neutral: propertyInsights.filter((item) => item.property.overall_sentiment_score >= 0.4 && item.property.overall_sentiment_score < 0.7).length,
      Negative: propertyInsights.filter((item) => item.property.overall_sentiment_score < 0.4).length
    };

    const bhkBuckets = { '1 BHK': 0, '2 BHK': 0, '3 BHK': 0, '4+ BHK': 0 };
    properties.forEach((property) => {
      if (property.area_sqft < 900) bhkBuckets['1 BHK'] += 1;
      else if (property.area_sqft < 1400) bhkBuckets['2 BHK'] += 1;
      else if (property.area_sqft < 2100) bhkBuckets['3 BHK'] += 1;
      else bhkBuckets['4+ BHK'] += 1;
    });

    return {
      totalListings: properties.length,
      uniqueReviewers,
      aspectCount: aspectNames.length,
      reviewCount: allReviews.length,
      sentimentBuckets,
      bhkBuckets,
      total: properties.length
    };
  }, [properties, propertyInsights]);

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Real Estate Sentiment Intelligence</h1>
                <p className="text-slate-400 text-xs sm:text-sm">Professional, aspect-driven analytics</p>
              </div>
            </div>
            <div className="hidden sm:flex px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-sm items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Review Insights
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-3">Executive Dashboard</p>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-white max-w-4xl">
            Analyze property sentiment by key aspects like location, transport, and pricing to guide portfolio decisions.
          </h2>
        </section>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="text-slate-400 mt-4">Loading market intelligence...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard icon={<LayoutGrid className="w-5 h-5 text-blue-400" />} title="Total Listings" value={dashboardStats.totalListings} subtitle="Active properties" />
              <StatCard icon={<MessageSquare className="w-5 h-5 text-emerald-400" />} title="Reviewers" value={dashboardStats.uniqueReviewers} subtitle={`${dashboardStats.reviewCount} total reviews`} />
              <StatCard icon={<Tag className="w-5 h-5 text-violet-400" />} title="Aspects Tracked" value={dashboardStats.aspectCount} subtitle="Location, Price, etc." />
              <StatCard icon={<Smile className="w-5 h-5 text-amber-400" />} title="Avg Score" value={`${averageReviewScore(propertyInsights)}%`} subtitle="Global average" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-xl font-semibold mb-6">Inventory Distribution</h3>
                <TypeDistributionChart buckets={dashboardStats.bhkBuckets} total={dashboardStats.total} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-xl font-semibold mb-6">Sentiment Analysis</h3>
                <SentimentBarChart buckets={dashboardStats.sentimentBuckets} total={dashboardStats.total} />
              </div>
            </div>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold">Property Profiles</h3>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search properties..."
                    className="w-full bg-slate-950 rounded-lg border border-slate-800 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-4 font-medium">Property</th>
                      <th className="pb-4 font-medium">Location</th>
                      <th className="pb-4 font-medium">Sentiment</th>
                      <th className="pb-4 font-medium">Score</th>
                      <th className="pb-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredInsights.map((row) => (
                      <tr key={row.property.id} className="group hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 font-medium text-white">{row.property.name}</td>
                        <td className="py-4 text-slate-400">{row.property.location}</td>
                        <td className="py-4"><SentimentBadge label={row.sentimentLabel} /></td>
                        <td className="py-4 text-slate-300">{Math.round(row.avgReviewScore * 100)}%</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setSelectedProperty(row.property)}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View Details
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

// --- Sub-components ---

function StatCard({ icon, title, value, subtitle }: { icon: ReactNode; title: string; value: string | number; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function TypeDistributionChart({ buckets, total }: { buckets: Record<string, number>; total: number }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const entries = Object.entries(buckets);

  const conicStops = entries.reduce((acc, [, value], index) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    const start = acc.running;
    const end = start + percent;
    acc.running = end;
    acc.stops.push(`${colors[index]} ${start}% ${end}%`);
    return acc;
  }, { running: 0, stops: [] as string[] }).stops.join(', ');

  return (
    <div className="flex items-center gap-8">
      <div className="w-32 h-32 rounded-full ring-8 ring-slate-800/50 shadow-inner" style={{ background: `conic-gradient(${conicStops || '#1e293b 0% 100%'})` }} />
      <div className="flex-1 space-y-2">
        {entries.map(([label, value], index) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index] }} />
              {label}
            </div>
            <span className="text-white font-mono">{Math.round((value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SentimentBarChart({ buckets, total }: { buckets: Record<'Positive' | 'Neutral' | 'Negative', number>; total: number }) {
  const colorMap = { Positive: 'bg-emerald-500', Neutral: 'bg-blue-500', Negative: 'bg-rose-500' };
  return (
    <div className="space-y-4">
      {Object.entries(buckets).map(([label, value]) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1.5 text-slate-400">
              <span>{label}</span>
              <span className="text-white">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${colorMap[label as keyof typeof colorMap]} transition-all duration-500`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SentimentBadge({ label }: { label: PropertyInsight['sentimentLabel'] }) {
  const styles = {
    'Very Positive': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Positive: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };
  return <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${styles[label]}`}>{label}</span>;
}

function averageReviewScore(insights: PropertyInsight[]) {
  const reviewScores = insights.flatMap((insight) => insight.reviews.map((review) => review.sentiment_score));
  if (reviewScores.length === 0) return 0;
  return Math.round((reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length) * 100);
}

export default App;