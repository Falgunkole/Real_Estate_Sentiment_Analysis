import { X, MapPin, Home, DollarSign } from 'lucide-react';
import type { Property } from '../lib/database.types';
import { SentimentAnalysis } from './SentimentAnalysis';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

  return (
    <div className="fixed inset-0 bg-stone-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl max-w-6xl w-full my-8 shadow-2xl">
        <div className="relative">
          <button
            onClick={onClose}
            aria-label="Close property details"
            className="absolute top-4 right-4 bg-white rounded-full p-2 border border-stone-200 hover:bg-stone-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-stone-700" />
          </button>

          <div className="h-64 overflow-hidden rounded-t-2xl">
            <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4 text-stone-900">{property.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-stone-700">
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                <MapPin className="w-5 h-5 text-amber-700" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                <Home className="w-5 h-5 text-amber-700" />
                <span>{property.area_sqft} sq.ft</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
                <DollarSign className="w-5 h-5 text-amber-700" />
                <span className="font-semibold">{formatPrice(property.price)}</span>
              </div>
            </div>

            <p className="text-stone-600 mb-6">{property.description}</p>

            <div className="border-t border-stone-200 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-stone-900">Sentiment Analysis</h3>
              <SentimentAnalysis property={property} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
