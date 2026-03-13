import { useEffect, useState } from 'react';
import { Brain, Building2, Sparkles } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { getProperties } from './lib/queries';
import { hasSupabaseCredentials } from './lib/supabase';
import type { Property } from './lib/database.types';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-stone-100/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-700 to-orange-500 p-2.5 rounded-xl shadow-md">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">EstatePulse Intelligence</h1>
                <p className="text-stone-600 text-sm mt-1">High-clarity real estate sentiment analytics for modern teams</p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {hasSupabaseCredentials ? 'Live cloud data' : 'Demo mode with curated sample data'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">Executive Dashboard</p>
          <h2 className="text-3xl sm:text-4xl font-semibold leading-tight max-w-3xl text-stone-900">
            Understand buyer emotions, detect risk areas, and make pricing and launch decisions faster.
          </h2>
        </section>

        <div className="mb-8">
          <Dashboard />
        </div>

        <div className="mb-5 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-700" />
          <h2 className="text-2xl font-bold text-stone-900">Properties</h2>
          <span className="text-stone-500">({properties.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-amber-700 border-t-transparent" />
            <p className="mt-4 text-stone-600">Loading portfolio insights...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
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
