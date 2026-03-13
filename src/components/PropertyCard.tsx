import { TrendingUp, TrendingDown, Minus, MapPin, Home, ArrowRight, Info } from 'lucide-react';
import type { Property } from '../lib/database.types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const sentimentIcon = () => {
    if (property.overall_sentiment_score >= 0.7) {
      return <TrendingUp className="w-5 h-5 text-emerald-300" />;
    }
    if (property.overall_sentiment_score >= 0.4) {
      return <Minus className="w-5 h-5 text-yellow-300" />;
    }
    return <TrendingDown className="w-5 h-5 text-rose-300" />;
  };

  const sentimentColor = () => {
    if (property.overall_sentiment_score >= 0.7) return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30';
    if (property.overall_sentiment_score >= 0.4) return 'bg-yellow-500/15 text-yellow-200 border-yellow-400/30';
    return 'bg-rose-500/15 text-rose-200 border-rose-400/30';
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

  const sentimentLabel =
    property.overall_sentiment_score >= 0.7
      ? 'Excellent Buyer Sentiment'
      : property.overall_sentiment_score >= 0.4
      ? 'Balanced Buyer Sentiment'
      : 'Needs Attention';

  return (
    <article
      onClick={onClick}
      className="rounded-2xl border border-slate-800 bg-slate-900/75 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="relative h-52 overflow-hidden">
        <img src={property.image_url} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border ${sentimentColor()} flex items-center gap-1 font-medium backdrop-blur-sm`}>
          {sentimentIcon()}
          <span>{(property.overall_sentiment_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 text-white">{property.name}</h3>

        <div className="flex items-center text-slate-300 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-slate-300">
            <Home className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.area_sqft} sq.ft</span>
          </div>
          <div className="text-lg font-bold text-cyan-300">{formatPrice(property.price)}</div>
        </div>

        <p className="text-slate-300 text-sm line-clamp-2 mb-4">{property.description}</p>

        <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 mb-4 flex items-center gap-2 text-sm text-slate-200">
          <Info className="w-4 h-4 text-cyan-300" />
          <span>{sentimentLabel}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-cyan-200 text-sm hover:bg-cyan-500/20 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={(event) => event.stopPropagation()}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 text-sm hover:bg-slate-700 transition-colors"
          >
            Compare
          </button>
        </div>
      </div>
    </article>
  );
}
