import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Building2,
  LayoutGrid,
  MessageSquare,
  Search,
  Smile,
  Tag,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { PropertyModal } from './components/PropertyModal';
import { getProperties, getReviewsByProperty } from './lib/queries';
import type { Property, Review } from './lib/database.types';

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

    return {
      totalListings: properties.length,
      uniqueReviewers,
      aspectCount: aspectNames.length,
      reviewCount: allReviews.length,
    };
  }, [properties, propertyInsights]);

  // Derive Top Properties for the Leaderboard
  const topProperties = useMemo(() => {
    return [...propertyInsights]
      .sort((a, b) => b.property.overall_sentiment_score - a.property.overall_sentiment_score)
      .slice(0, 3);
  }, [propertyInsights]);

  // Derive Latest Reviews
  const latestReviews = useMemo(() => {
    const allReviews = propertyInsights.flatMap(insight => 
      insight.reviews.map(r => ({ ...r, propertyName: insight.property.name }))
    );
    return allReviews
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);
  }, [propertyInsights]);

  return (
    <div className="min-h-screen w-full bg-navy-900 text-slate-200 selection:bg-brand-500 selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-navy-800 bg-navy-900/80 backdrop-blur-lg sticky top-0 z-20 animate-fade-in">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 duration-300">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Sentiment<span className="text-brand-500">Intel</span></h1>
                <p className="text-slate-400 text-sm mt-1">Professional Real Estate Review Analytics</p>
              </div>
            </div>
            <div className="hidden sm:flex px-4 py-2 rounded-lg border border-navy-700 bg-navy-800 text-slate-300 text-sm items-center gap-2 hover:border-brand-500 transition-colors cursor-pointer">
               Live Insights Active
               <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-navy-700 border-t-brand-500 mb-6" />
            <p className="text-slate-400 text-lg">Aggregating market sentiment...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Top Stats - Staggered Slide Up */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                 <StatCard icon={<LayoutGrid className="w-6 h-6 text-brand-500" />} title="Total Properties" value={dashboardStats.totalListings} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <StatCard icon={<MessageSquare className="w-6 h-6 text-blue-400" />} title="Total Reviews Analyzed" value={dashboardStats.reviewCount} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <StatCard icon={<Tag className="w-6 h-6 text-purple-400" />} title="Aspects Tracked" value={dashboardStats.aspectCount} />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <StatCard icon={<Smile className="w-6 h-6 text-emerald-400" />} title="Global Sentiment" value={`${averageReviewScore(propertyInsights)}%`} />
              </div>
            </div>

            {/* Middle Section: Leaderboard & Recent Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leaderboard */}
              <div className="lg:col-span-2 rounded-2xl border border-navy-800 bg-navy-800/50 p-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" />
                    Property Sentiment Leaderboard
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topProperties.map((insight, idx) => (
                    <div key={insight.property.id} className="group relative bg-navy-900 rounded-xl p-6 border border-navy-700 hover:border-brand-500 transition-all duration-300 cursor-pointer overflow-hidden" onClick={() => setSelectedProperty(insight.property)}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                      <div className="text-4xl font-black text-navy-800 absolute right-4 bottom-4 opacity-50 select-none">#{idx + 1}</div>
                      <h4 className="text-lg font-bold text-white mb-1 relative z-10">{insight.property.name}</h4>
                      <p className="text-sm text-slate-400 mb-4 relative z-10">{insight.property.location}</p>
                      <div className="flex items-center gap-2 relative z-10">
                        <span className="text-2xl font-bold text-brand-400">{Math.round(insight.property.overall_sentiment_score * 100)}%</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews Feed */}
              <div className="rounded-2xl border border-navy-800 bg-navy-800/50 p-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-bold text-white mb-6">Live Review Feed</h3>
                <div className="space-y-4">
                  {latestReviews.map((review, i) => (
                    <div key={i} className="bg-navy-900 rounded-lg p-4 border border-navy-700 hover:border-navy-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-slate-200 text-sm">{review.propertyName}</span>
                        <div className="flex text-amber-400">
                           {Array.from({ length: review.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">"{review.review_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Section: Full Directory */}
            <section className="rounded-2xl border border-navy-800 bg-navy-800/50 p-8 shadow-xl animate-slide-up" style={{ animationDelay: '0.7s' }}>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">Property Intelligence Directory</h3>
                  <p className="text-slate-400 mt-1">Detailed breakdown of all tracked properties.</p>
                </div>
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or location..."
                    className="w-full bg-navy-900 rounded-xl border border-navy-700 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-navy-700">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-navy-900 text-slate-300 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Property</th>
                      <th className="px-6 py-4 font-semibold">Location</th>
                      <th className="px-6 py-4 font-semibold">Sentiment Status</th>
                      <th className="px-6 py-4 font-semibold">Score</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-700 bg-navy-800/30">
                    {filteredInsights.map((row) => (
                      <tr key={row.property.id} className="group hover:bg-navy-700/50 transition-colors">
                        <td className="px-6 py-5 font-bold text-white">{row.property.name}</td>
                        <td className="px-6 py-5 text-slate-400">{row.property.location}</td>
                        <td className="px-6 py-5"><SentimentBadge label={row.sentimentLabel} /></td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-200 font-medium">{Math.round(row.avgReviewScore * 100)}%</span>
                            <div className="w-24 h-1.5 bg-navy-900 rounded-full overflow-hidden hidden sm:block">
                              <div className="h-full bg-brand-500" style={{ width: `${Math.round(row.avgReviewScore * 100)}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setSelectedProperty(row.property)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-brand-500/10 text-brand-400 rounded-lg hover:bg-brand-500 hover:text-white transition-all font-medium text-xs uppercase tracking-wider"
                          >
                            Analyze
                            <ArrowRight className="w-4 h-4" />
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

function StatCard({ icon, title, value }: { icon: ReactNode; title: string; value: string | number }) {
  return (
    <div className="group rounded-2xl border border-navy-800 bg-navy-800/50 p-6 hover:bg-navy-800 transition-all duration-300 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center group-hover:scale-110 group-hover:border-brand-500/50 transition-all duration-300">
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SentimentBadge({ label }: { label: PropertyInsight['sentimentLabel'] }) {
  const styles = {
    'Very Positive': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Positive: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    Neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };
  return <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${styles[label]}`}>{label}</span>;
}

function averageReviewScore(insights: PropertyInsight[]) {
  const reviewScores = insights.flatMap((insight) => insight.reviews.map((review) => review.sentiment_score));
  if (reviewScores.length === 0) return 0;
  return Math.round((reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length) * 100);
}

export default App;
