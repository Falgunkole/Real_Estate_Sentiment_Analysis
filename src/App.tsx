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
  Tag
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
      (insight) => insight.property.name.toLowerCase().includes(term) || insight.property.location.toLowerCase().includes(term)
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

    const total = properties.length;
    const bhkBuckets = {
      '1 BHK': 0,
      '2 BHK': 0,
      '3 BHK': 0,
      '4+ BHK': 0
    };

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
      total
    };
  }, [properties, propertyInsights]);

  return (
    <div className="min-h-screen w-full bg-[#f3f4f6] text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
          <div className="px-4 py-5 border-b border-slate-200">
            <p className="text-xl font-semibold">Menu</p>
            <p className="text-slate-500 text-sm">Navigation</p>
          </div>

          <nav className="p-2 space-y-1">
            <SidebarButton
              icon={<Home className="w-4 h-4" />}
              label="Dashboard"
              active={activePage === 'dashboard'}
              onClick={() => setActivePage('dashboard')}
            />
            <SidebarButton
              icon={<FileText className="w-4 h-4" />}
              label="All Property Listing"
              active={activePage === 'listings'}
              onClick={() => setActivePage('listings')}
            />
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="h-20 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Open navigation">
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Real Estate Analytics</h1>
                <p className="text-sm text-slate-500">Property Sentiment Analysis Dashboard</p>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </header>

          <main className="w-full p-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-slate-500 mt-3">Loading insights...</p>
              </div>
            ) : activePage === 'dashboard' ? (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  <StatCard icon={<LayoutGrid className="w-5 h-5 text-blue-600" />} title="Total Listings" value={dashboardStats.totalListings} subtitle="Active properties" />
                  <StatCard
                    icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
                    title="Number of Reviewers"
                    value={dashboardStats.uniqueReviewers}
                    subtitle={`${dashboardStats.reviewCount} user reviews`}
                  />
                  <StatCard icon={<Tag className="w-5 h-5 text-violet-600" />} title="Number of Aspects" value={dashboardStats.aspectCount} subtitle="Location, transport, utilities, price" />
                  <StatCard icon={<Smile className="w-5 h-5 text-amber-600" />} title="Avg Review Score" value={`${averageReviewScore(propertyInsights)}%`} subtitle="Across all property reviews" />
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Type of Property</h2>
                    <p className="text-sm text-slate-500 mb-6">Distribution by estimated BHK configuration</p>
                    <TypeDistributionChart buckets={dashboardStats.bhkBuckets} total={dashboardStats.total} />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Property Sentiment Analysis</h2>
                    <p className="text-sm text-slate-500 mb-6">Number of properties by sentiment rating</p>
                    <SentimentBarChart buckets={dashboardStats.sentimentBuckets} total={dashboardStats.total} />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">Review & Aspect Overview</h2>
                      <p className="text-sm text-slate-500">Quick highlights from reviewer sentiment and aspect confidence</p>
                    </div>
                    <div className="relative w-full max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search property or location"
                        className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="py-2 pr-4 font-medium">Property Name</th>
                          <th className="py-2 pr-4 font-medium">Location</th>
                          <th className="py-2 pr-4 font-medium">Sentiment</th>
                          <th className="py-2 pr-4 font-medium">Reviews</th>
                          <th className="py-2 pr-4 font-medium">Avg Review Score</th>
                          <th className="py-2 pr-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInsights.map((row) => (
                          <tr key={row.property.id} className="border-b border-slate-100">
                            <td className="py-3 pr-4 font-medium text-slate-900">{row.property.name}</td>
                            <td className="py-3 pr-4 text-slate-600">{row.property.location}</td>
                            <td className="py-3 pr-4">
                              <SentimentBadge label={row.sentimentLabel} />
                            </td>
                            <td className="py-3 pr-4 text-slate-700">{row.reviews.length}</td>
                            <td className="py-3 pr-4 text-slate-700">{Math.round(row.avgReviewScore * 100)}%</td>
                            <td className="py-3 pr-4">
                              <button
                                onClick={() => setSelectedProperty(row.property)}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100"
                              >
                                View insights
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-3xl font-semibold text-slate-900">All Property Listings</h2>
                <p className="text-slate-500 mb-4">Complete list of properties with review-driven sentiment context</p>

                <div className="relative max-w-md mb-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search property or location"
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-2 pr-4 font-medium">Property Name</th>
                        <th className="py-2 pr-4 font-medium">Location</th>
                        <th className="py-2 pr-4 font-medium">Price</th>
                        <th className="py-2 pr-4 font-medium">Sentiment</th>
                        <th className="py-2 pr-4 font-medium">Reviews</th>
                        <th className="py-2 pr-4 font-medium">Avg Review Score</th>
                        <th className="py-2 pr-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInsights.map((row) => (
                        <tr key={row.property.id} className="border-b border-slate-100">
                          <td className="py-3 pr-4 font-medium text-slate-900">{row.property.name}</td>
                          <td className="py-3 pr-4 text-slate-600">{row.property.location}</td>
                          <td className="py-3 pr-4 text-slate-700">{formatPrice(row.property.price)}</td>
                          <td className="py-3 pr-4">
                            <SentimentBadge label={row.sentimentLabel} />
                          </td>
                          <td className="py-3 pr-4 text-slate-700">{row.reviews.length}</td>
                          <td className="py-3 pr-4 text-slate-700">{Math.round(row.avgReviewScore * 100)}%</td>
                          <td className="py-3 pr-4">
                            <button
                              onClick={() => setSelectedProperty(row.property)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 hover:bg-blue-100"
                            >
                              View insights
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}

function SidebarButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left flex items-center gap-3 transition-colors ${
        active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: ReactNode; title: string; value: string | number; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-3xl font-semibold text-slate-900 mt-1">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

function TypeDistributionChart({ buckets, total }: { buckets: Record<string, number>; total: number }) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const entries = Object.entries(buckets);

  const conicStops = entries
    .reduce(
      (acc, [, value], index) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        const start = acc.running;
        const end = start + percent;
        acc.running = end;
        acc.stops.push(`${colors[index]} ${start}% ${end}%`);
        return acc;
      },
      { running: 0, stops: [] as string[] }
    )
    .stops.join(', ');

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="w-72 h-72 rounded-full" style={{ background: `conic-gradient(${conicStops || '#e2e8f0 0% 100%'})` }} />
      <div className="space-y-3 w-full max-w-xs">
        {entries.map(([label, value], index) => {
          const percent = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colors[index] }} />
                <span className="text-slate-700">{label}</span>
              </div>
              <span className="font-medium text-slate-900">
                {percent}% ({value})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentimentBarChart({ buckets, total }: { buckets: Record<'Positive' | 'Neutral' | 'Negative', number>; total: number }) {
  return (
    <div className="space-y-6 py-4">
      {Object.entries(buckets).map(([label, value]) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={label}>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-slate-700">{label}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
            <div className="w-full h-9 rounded-md bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-md" style={{ width: `${Math.max(percent, value > 0 ? 6 : 0)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SentimentBadge({ label }: { label: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' }) {
  const styles = {
    'Very Positive': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Positive: 'bg-blue-100 text-blue-700 border-blue-200',
    Neutral: 'bg-slate-100 text-slate-600 border-slate-200',
    Negative: 'bg-rose-100 text-rose-700 border-rose-200'
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[label]}`}>{label}</span>;
}

function averageReviewScore(insights: PropertyInsight[]) {
  const reviewScores = insights.flatMap((insight) => insight.reviews.map((review) => review.sentiment_score));
  if (reviewScores.length === 0) return 0;

  const average = reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length;
  return Math.round(average * 100);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export default App;
