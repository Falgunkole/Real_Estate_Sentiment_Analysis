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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 px-4 py-6 backdrop-blur-sm sm:py-10">
      <div className="mx-auto my-auto w-full max-w-6xl rounded-2xl border border-stone-200 bg-stone-50 shadow-2xl">
        <div className="max-h-[88vh] overflow-y-auto">
          <div className="border-b border-stone-200 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  <Building2 className="h-3.5 w-3.5" />
                  Property insight hub
                </div>
                <h2 className="text-3xl font-bold text-stone-900">{property.name}</h2>
                <p className="mt-2 max-w-3xl text-stone-600">{property.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close property details"
                className="rounded-full border border-stone-300 bg-white p-2 transition-colors hover:bg-stone-100"
              >
                <X className="h-6 w-6 text-stone-700" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-stone-700 md:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                <MapPin className="h-5 w-5 text-amber-700" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                <Home className="h-5 w-5 text-amber-700" />
                <span>{property.area_sqft} sq.ft</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                <DollarSign className="h-5 w-5 text-amber-700" />
                <span className="font-semibold">{formatPrice(property.price)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="mb-4 text-xl font-semibold text-stone-900">Comprehensive sentiment intelligence</h3>
            <p className="mb-6 text-sm text-stone-600">
              This page consolidates sentiment signals extracted from user reviews and aspect-level analysis so teams can make faster investment,
              marketing, and product decisions.
            </p>
            <SentimentAnalysis property={property} />

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-700 transition-colors hover:bg-stone-100"
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
