import { TrendingUp, TrendingDown, Minus, MapPin, Home } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const sentimentIcon = () => {
    if (property.overall_sentiment_score >= 0.7) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (property.overall_sentiment_score >= 0.4) {
      return <Minus className="w-5 h-5 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
  };

  const sentimentColor = () => {
    if (property.overall_sentiment_score >= 0.7) return 'bg-green-100 text-green-800';
    if (property.overall_sentiment_score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={property.image_url}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${sentimentColor()} flex items-center gap-1 font-medium`}>
          {sentimentIcon()}
          <span>{(property.overall_sentiment_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600">
            <Home className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.area_sqft} sq.ft</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {formatPrice(property.price)}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
      </div>
    </div>
  );
}
