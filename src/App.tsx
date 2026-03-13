import { useEffect, useMemo, useState } from 'react';
import { Brain, Building2, Search, Sparkles } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { getProperties } from './lib/queries';
import type { Property } from './lib/database.types';

type FilterKey = 'all' | 'premium' | 'value' | 'top-rated';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        normalizedTerm.length === 0 ||
        property.name.toLowerCase().includes(normalizedTerm) ||
        property.location.toLowerCase().includes(normalizedTerm);

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'premium' && property.price >= 30000000) ||
        (activeFilter === 'value' && property.price < 20000000) ||
        (activeFilter === 'top-rated' && property.overall_sentiment_score >= 0.75);

      return matchesSearch && matchesFilter;
    });
  }, [properties, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-violet-950/40">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sentiment ananlysis of real istate market</h1>
                <p className="text-slate-300 text-sm mt-1">High-clarity real estate sentiment analytics for modern teams</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <section className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-900/60 p-6 sm:p-8 shadow-xl shadow-slate-950/35">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-3">Executive Dashboard</p>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight max-w-4xl text-white">
            Track property and location insights to understand portfolio coverage and market positioning faster.
          </h2>
        </section>

        <div className="mb-8">
          <Dashboard />
        </div>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by property or location..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'premium', label: 'Premium' },
                { key: 'value', label: 'Value Picks' },
                { key: 'top-rated', label: 'Top Rated' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as FilterKey)}
                  className={`px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                    activeFilter === filter.key
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-5 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-cyan-300" />
          <h2 className="text-2xl font-bold text-white">Properties</h2>
          <span className="text-slate-400">({filteredProperties.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent" />
            <p className="mt-4 text-slate-300">Loading portfolio insights...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} onClick={() => setSelectedProperty(property)} />
            ))}
          </div>
        )}
      </main>

      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  );
}

export default App;
