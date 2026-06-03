import { Building2, ExternalLink, MapPin, X } from 'lucide-react';
import type { Property } from '../lib/database.types';
import { SentimentAnalysis } from './SentimentAnalysis';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: PropertyModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
              <Building2 className="h-3.5 w-3.5" />
              Property intelligence
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{property.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{property.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-[var(--border)] px-5 py-4 sm:grid-cols-2 sm:px-6">
          <MetaChip icon={<MapPin className="h-4 w-4" />} label="Location" value={property.location} />
        </div>

        {property.listing_url && (
          <div className="border-b border-[var(--border)] px-5 py-3 sm:px-6">
            <a
              href={property.listing_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300"
            >
              View listing on 99acres <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <SentimentAnalysis property={property} />
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
      <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-snug">{value}</p>
    </div>
  );
}
