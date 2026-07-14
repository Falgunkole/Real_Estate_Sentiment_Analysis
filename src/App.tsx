import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  MessageSquare,
  Moon,
  Search,
  Sparkles,
  Sun,
  TrendingUp
} from 'lucide-react';
import { PropertyModal } from './components/PropertyModal';
import type { Property } from './lib/database.types';
import {
  getProperties,
  getPropertyAspectSummaries,
  preloadFullDataset,
  type PropertyAspectSummary
} from './lib/queries';
import { ASPECT_NAMES } from './lib/sentiment';
import { useTheme } from './contexts/ThemeContext';

type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';
type ViewMode = 'grid' | 'table';

interface PropertyRow {
  property: Property;
  summaries: PropertyAspectSummary[];
  sentimentLabel: SentimentLabel;
}

function sentimentLabel(score: number): SentimentLabel {
  // Explicitly check for Neutral first!
  // If the score is between 2.5 and 3.5, it is NEUTRAL.
  if (score >= 2.5 && score < 3.5) return 'Neutral';
  
  // Now check the others
  if (score >= 3.5) return 'Positive';
  
  return 'Negative';
}

function SentimentPill({ label }: { label: SentimentLabel }) {
  const styles: Record<SentimentLabel, string> = {
    Positive: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Neutral: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Negative: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[label]}`}>
      {label}
    </span>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aspectFilters, setAspectFilters] = useState<string[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<Property | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await preloadFullDataset();
        const properties = await getProperties();
        const enriched = await Promise.all(
          properties.map(async (property) => {
            const summaries = await getPropertyAspectSummaries(property.id);
            
            // DEBUGGING: Calculate locally so we can log it
            const score = property.overall_sentiment_score;
            const label = sentimentLabel(score);
            
            // THIS LOG IS YOUR SOURCE OF TRUTH
            console.log(`DEBUG: Prop: ${property.name} | Score: ${score} | Label: ${label}`);
            
            return {
              property,
              summaries,
              sentimentLabel: label // We use our calculated label here
            };
          })
        );
        setRows(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchSearch =
        !q ||
        row.property.name.toLowerCase().includes(q) ||
        row.property.location.toLowerCase().includes(q) ||
        row.property.property_type.toLowerCase().includes(q);

      // Filter by aspect presence (must have ALL selected aspects)
      const matchAspect = aspectFilters.length === 0 || aspectFilters.every((aspect) =>
        row.summaries.some((s) => s.aspect === aspect)
      );

      // Filter by sentiment
      let matchSentiment = true;
      if (sentimentFilter !== 'all') {
        if (aspectFilters.length > 0) {
          // When aspects are selected, ALL selected aspects must match the sentiment
          matchSentiment = aspectFilters.every((aspect) => {
            const summary = row.summaries.find((s) => s.aspect === aspect);
            return summary && summary.verdict_label === sentimentFilter;
          });
        } else {
          // When no aspects are selected, filter by overall property sentiment
          const label = sentimentLabel(row.property.overall_sentiment_score);
          matchSentiment = label === sentimentFilter;
        }
      }

      return matchSearch && matchSentiment && matchAspect;
    });
  }, [rows, search, sentimentFilter, aspectFilters]);

  const stats = useMemo(() => {
    const avgScore = rows.length ? rows.reduce((s, r) => s + r.property.overall_sentiment_score, 0) / rows.length : 0;
    
    const normalizedAvg = ((avgScore - 1) / 4) * 100;

    return {
    properties: rows.length,
    avgScore: Math.round(normalizedAvg), // Now displays 0-100%
    aspects: ASPECT_NAMES.length
  };
}, [rows]);

  const topThree = useMemo(
    () => [...rows].sort((a, b) => b.property.overall_sentiment_score - a.property.overall_sentiment_score).slice(0, 3),
    [rows]
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-[var(--border)] glass animate-fade-in">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg glow-amber">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Sentiment<span className="text-gradient">Intel</span>
              </h1>
              <p className="text-xs text-[var(--muted)] sm:text-sm">204 properties · 4-aspect NLP intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--muted)] transition hover:border-amber-500/30 hover:text-amber-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live data connected
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="h-14 w-14 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            <p className="mt-6 text-[var(--muted)]">Loading 204 properties from sentiment dataset…</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up">
              {[
                { label: 'Properties', value: stats.properties, icon: LayoutGrid, delay: 'stagger-1' },
                { label: 'Avg sentiment', value: `${stats.avgScore}%`, icon: Sparkles, delay: 'stagger-2' },
                { label: 'Aspects tracked', value: stats.aspects, icon: MessageSquare, delay: 'stagger-3' }
              ].map((card) => (
                <div
                  key={card.label}
                  className={`glass rounded-2xl p-5 transition hover:border-amber-500/30 hover:glow-amber animate-fade-up ${card.delay}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--muted)]">{card.label}</p>
                    <card.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold tabular-nums">{card.value}</p>
                </div>
              ))}
            </section>

            {topThree.length > 0 && (
              <section className="animate-fade-up stagger-2">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  Top sentiment leaders
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {topThree.map((row, i) => (
                    <button
                      key={row.property.id}
                      type="button"
                      onClick={() => setSelected(row.property)}
                      className="group glass rounded-2xl p-5 text-left transition hover:-translate-y-1 hover:border-amber-500/40"
                    >
                      <span className="text-xs font-bold text-amber-500/80">#{i + 1}</span>
                      <h3 className="mt-1 font-semibold group-hover:text-amber-300">{row.property.name}</h3>
                      <p className="text-sm text-[var(--muted)]">{row.property.location}</p>
                      <p className="mt-3 text-2xl font-bold text-amber-400">
                        {Math.round(((row.property.overall_sentiment_score - 1) / 4) * 100)}%
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="glass rounded-2xl p-4 sm:p-6 animate-fade-up stagger-3">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, location, BHK type…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--muted)]" />
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_NAMES.map((aspect) => (
                      <label key={aspect} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm cursor-pointer hover:border-amber-500/30">
                        <input
                          type="checkbox"
                          checked={aspectFilters.includes(aspect)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAspectFilters([...aspectFilters, aspect]);
                            } else {
                              setAspectFilters(aspectFilters.filter((a) => a !== aspect));
                            }
                          }}
                          className="rounded border-[var(--border)] bg-[var(--surface)] text-amber-500 focus:ring-amber-500"
                        />
                        {aspect}
                      </label>
                    ))}
                  </div>
                  <select
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                    disabled={aspectFilters.length === 0}
                  >
                    <option value="all">All sentiments</option>
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                  <div className="flex rounded-lg border border-[var(--border)] p-0.5">
                    <button
                      type="button"
                      onClick={() => setView('grid')}
                      className={`rounded-md p-2 ${view === 'grid' ? 'bg-amber-500/20 text-amber-300' : 'text-[var(--muted)]'}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('table')}
                      className={`rounded-md p-2 ${view === 'table' ? 'bg-amber-500/20 text-amber-300' : 'text-[var(--muted)]'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-[var(--muted)]">
                Showing <strong className="text-white">{filtered.length}</strong> of {rows.length} properties
              </p>
            </section>

            {view === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((row, idx) => (
                  <PropertyCard key={row.property.id} row={row} index={idx} onOpen={() => setSelected(row.property)} />
                ))}
              </div>
            ) : (
              <div className="glass overflow-hidden rounded-2xl animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
                      <tr>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Sentiment</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row) => (
                        <tr key={row.property.id} className="border-b border-[var(--border)]/60 hover:bg-white/[0.02]">
                          <td className="px-4 py-4 font-medium">{row.property.name}</td>
                          <td className="px-4 py-4 text-[var(--muted)]">{row.property.location}</td>
                          <td className="px-4 py-4">
                            <SentimentPill label={row.sentimentLabel} />
                            <span className="ml-2 text-xs text-[var(--muted)]">
                              {Math.round(((row.property.overall_sentiment_score - 1) / 4) * 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelected(row.property)}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
                            >
                              Analyze <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <p className="py-16 text-center text-[var(--muted)]">No properties match your filters.</p>
            )}
          </div>
        )}
      </main>

      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PropertyCard({
  row,
  index,
  onOpen
}: {
  row: PropertyRow;
  index: number;
  onOpen: () => void;
}) {
  const delay = `stagger-${(index % 6) + 1}`;

  return (
    <article
      className={`glass group flex flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-amber-500/35 hover:glow-amber animate-fade-up ${delay}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold leading-snug group-hover:text-amber-200">{row.property.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {row.property.location}
          </p>
        </div>
        <SentimentPill label={row.sentimentLabel} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
      {row.summaries.map((s) => (
    <span
      key={s.aspect}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]"
      title={s.verdict_label}
    >
      {/* Normalized Math: (score - 1) / 4 maps the 1-5 range to 0-1 range, then * 100 for % */}
      {s.aspect[0]}: {Math.round(((s.score - 1) / 4) * 100)}%
    </span>
  ))}
</div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Deep analysis <ArrowUpRight className="h-4 w-4" />
        </button>
        {row.property.listing_url && (
          <a
            href={row.property.listing_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center rounded-xl border border-[var(--border)] px-3 text-[var(--muted)] hover:text-amber-300"
            title="View on 99acres"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}
