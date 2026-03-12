import { useState, useEffect } from 'react';
import { Brain, Building2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { PropertyCard } from './components/PropertyCard';
import { PropertyModal } from './components/PropertyModal';
import { getProperties } from './lib/queries';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-green-600 p-2 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real Estate Sentiment Analyzer</h1>
              <p className="text-gray-600 text-sm mt-1">
                Powered by BERT + BiLSTM with Attention Mechanism
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Dashboard />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <span className="text-gray-600">({properties.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Sentiment Analysis using NLP and Machine Learning - Aspect-Based Analysis with Attention Mechanism
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
