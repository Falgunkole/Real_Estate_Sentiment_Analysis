import {
  ArrowRight,
  Building2,
  IndianRupee,
  MapPin,
  MessageSquareText,
  Minus,
  Ruler,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import type { Property } from '../lib/database.types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);

  const sentimentMeta =
    property.overall_sentiment_score >= 0.75
      ? {
          tone: 'text-emerald-200 border-emerald-400/30 bg-emerald-500/15',
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'Strong market confidence'
        }
      : property.overall_sentiment_score >= 0.5
      ? {
          tone: 'text-amber-200 border-amber-400/30 bg-amber-500/15',
          icon: <Minus className="w-4 h-4" />,
          label: 'Mixed market confidence'
        }
      : {
          tone: 'text-rose-200 border-rose-400/30 bg-rose-500/15',
          icon: <TrendingDown className="w-4 h-4" />,
          label: 'Weak market confidence'
        };

  return (
    <article
      onClick={onClick}
      className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-cyan-400/50 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-xs text-slate-300 mb-3">
            <Building2 className="w-3.5 h-3.5 text-cyan-300" />
            Property profile
          </div>
          <h3 className="text-xl font-semibold text-white">{property.name}</h3>
          <div className="mt-2 flex items-center text-slate-300 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-cyan-300" />
            {property.location}
          </div>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${sentimentMeta.tone}`}>
          {sentimentMeta.icon}
          <span>{(property.overall_sentiment_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 min-h-[60px]">{property.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs text-slate-400 mb-1 inline-flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            Listed price
          </div>
          <p className="text-cyan-200 font-semibold text-base">{formatPrice(property.price)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="text-xs text-slate-400 mb-1 inline-flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            Total area
          </div>
          <p className="text-slate-100 font-semibold text-base">{property.area_sqft} sq.ft</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 inline-flex items-center gap-2">
        <MessageSquareText className="w-4 h-4 text-cyan-300" />
        {sentimentMeta.label}
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2.5 text-cyan-200 text-sm hover:bg-cyan-500/20 transition-colors"
      >
        Open analysis dashboard
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </article>
  );
}
