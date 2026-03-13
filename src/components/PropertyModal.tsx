import { X, MapPin, Home, DollarSign, BadgeInfo, TrendingUp, Phone, CalendarCheck } from 'lucide-react';
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

  const pricePerSqft = property.area_sqft > 0 ? property.price / property.area_sqft : 0;
  const appreciationBand = property.overall_sentiment_score >= 0.7 ? 'High potential' : property.overall_sentiment_score >= 0.4 ? 'Stable growth' : 'Watch closely';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-[96vw] h-[92vh] shadow-2xl overflow-hidden">
        <div className="relative h-full flex flex-col">
          <button
            onClick={onClose}
            aria-label="Close property details"
            className="absolute top-4 right-4 bg-slate-800 rounded-full p-2 border border-slate-600 hover:bg-slate-700 transition-colors z-10"
          >
            <X className="w-6 h-6 text-slate-100" />
          </button>

          <div className="h-72 overflow-hidden">
            <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <h2 className="text-3xl font-bold text-white">{property.name}</h2>
              <div className="px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-sm inline-flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {(property.overall_sentiment_score * 100).toFixed(0)}% sentiment score
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 text-slate-200">
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <MapPin className="w-5 h-5 text-cyan-300" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <Home className="w-5 h-5 text-cyan-300" />
                <span>{property.area_sqft} sq.ft</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <DollarSign className="w-5 h-5 text-cyan-300" />
                <span className="font-semibold">{formatPrice(property.price)}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                <BadgeInfo className="w-5 h-5 text-cyan-300" />
                <span>{formatPrice(pricePerSqft)} / sq.ft</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Market Outlook</p>
                <p className="text-white font-medium">{appreciationBand}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Assisted Tour</p>
                <p className="text-white font-medium">Schedule site visit in 24 hrs</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Consultant Desk</p>
                <p className="text-white font-medium">Dedicated advisor available</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed">{property.description}</p>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Sentiment Analysis</h3>
              <SentimentAnalysis property={property} />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors">
                <Phone className="w-4 h-4" />
                Contact Advisor
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors">
                <CalendarCheck className="w-4 h-4" />
                Book Visit
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
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
