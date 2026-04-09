import { Building2, DollarSign, Home, MapPin, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl max-w-6xl w-full my-8 shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-medium mb-3">
                <Building2 className="w-3.5 h-3.5" />
                Property insight hub
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{property.name}</h2>
              <p className="text-slate-600 mt-2 max-w-3xl">{property.description}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close property details"
              className="bg-white rounded-full p-2 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 text-slate-700">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
              <MapPin className="w-5 h-5 text-indigo-700" />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
              <Home className="w-5 h-5 text-indigo-700" />
              <span>{property.area_sqft} sq.ft</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
              <DollarSign className="w-5 h-5 text-indigo-700" />
              <span className="font-semibold">{formatPrice(property.price)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-semibold mb-4 text-slate-900">Comprehensive sentiment intelligence</h3>
          <p className="text-sm text-slate-600 mb-6">
            This page consolidates sentiment signals extracted from user reviews and aspect-level analysis so teams can make faster investment,
            marketing, and product decisions.
          </p>
          <SentimentAnalysis property={property} />

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
