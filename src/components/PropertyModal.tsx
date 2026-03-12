import { X, MapPin, Home, DollarSign } from 'lucide-react';
import type { Property } from '../lib/database.types';
import { SentimentAnalysis } from './SentimentAnalysis';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-50 rounded-lg max-w-6xl w-full my-8">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          <div className="h-64 overflow-hidden rounded-t-lg">
            <img
              src={property.image_url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{property.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Home className="w-5 h-5 text-blue-600" />
                <span>{property.area_sqft} sq.ft</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">{formatPrice(property.price)}</span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{property.description}</p>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sentiment Analysis</h3>
              <SentimentAnalysis property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
