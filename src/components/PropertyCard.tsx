import { TrendingUp, TrendingDown, Minus, MapPin, Home } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const sentimentIcon = () => {
    if (property.overall_sentiment_score >= 0.7) {
      return <TrendingUp className="w-5 h-5 text-emerald-700" />;
    }
    if (property.overall_sentiment_score >= 0.4) {
      return <Minus className="w-5 h-5 text-yellow-700" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-700" />;
  };

  const sentimentColor = () => {
    if (property.overall_sentiment_score >= 0.7) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (property.overall_sentiment_score >= 0.4) return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-red-50 text-red-800 border-red-200';
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-stone-200 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-52 overflow-hidden">
        <img src={property.image_url} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border ${sentimentColor()} flex items-center gap-1 font-medium`}>
          {sentimentIcon()}
          <span>{(property.overall_sentiment_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-stone-900">{property.name}</h3>

        <div className="flex items-center text-stone-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-stone-600">
            <Home className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.area_sqft} sq.ft</span>
          </div>
          <div className="text-lg font-bold text-amber-700">{formatPrice(property.price)}</div>
        </div>

        <p className="text-stone-600 text-sm line-clamp-2">{property.description}</p>
      </div>
    </div>
  );
}
