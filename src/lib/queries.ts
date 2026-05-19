import rawData from '../data/master_dashboard_data.json';

export type AspectName = 'Utility' | 'Transport' | 'Location' | 'Price';
export type Verdict = 'Positive' | 'Neutral' | 'Negative';

export interface AspectReview {
  date: string;
  reviewText: string;
  attentionWeight: number;
}

export interface AspectBucket {
  aspect: AspectName;
  finalVerdict: string;
  confidenceScore: number;
  sentiment: Verdict;
  reviews: AspectReview[];
}

export interface PropertyInsights {
  propertyId: string;
  propertyUrl: string;
  propertyName: string;
  aspects: Record<AspectName, AspectBucket | null>;
  overallConfidence: number;
  overallSentiment: Verdict;
  totalReviews: number;
}

interface RawRow {
  property_id: string;
  aspect: string;
  final_verdict: string;
  confidence_score: number;
  timeline_data: Array<{ date: string; review_text: string; attention_weight: number }>;
}

const aspectMap: Record<string, AspectName> = {
  Utilities: 'Utility',
  Utility: 'Utility',
  Transport: 'Transport',
  Location: 'Location',
  Price: 'Price'
};

function toSentiment(verdict: string): Verdict {
  const v = verdict.toLowerCase();
  if (v.includes('overpriced') || v.includes('poor') || v.includes('negative') || v.includes('bad')) return 'Negative';
  if (v.includes('fair') || v.includes('neutral') || v.includes('average')) return 'Neutral';
  return 'Positive';
}

function toPropertyName(url: string): string {
  const slug = url.split('/').find((p) => p.includes('reviews-ratings')) ?? '';
  return slug
    .replace(/-reviews-ratings.*/, '')
    .split('-')
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(' ');
}

const rows = rawData as RawRow[];

const grouped = new Map<string, PropertyInsights>();

for (const row of rows) {
  const aspect = aspectMap[row.aspect];
  if (!aspect) continue;
  if (!grouped.has(row.property_id)) {
    grouped.set(row.property_id, {
      propertyId: row.property_id,
      propertyUrl: row.property_id,
      propertyName: toPropertyName(row.property_id),
      aspects: { Utility: null, Transport: null, Location: null, Price: null },
      overallConfidence: 0,
      overallSentiment: 'Neutral',
      totalReviews: 0
    });
  }

  const p = grouped.get(row.property_id)!;
  p.aspects[aspect] = {
    aspect,
    finalVerdict: row.final_verdict,
    confidenceScore: row.confidence_score,
    sentiment: toSentiment(row.final_verdict),
    reviews: row.timeline_data.map((r) => ({ date: r.date, reviewText: r.review_text, attentionWeight: r.attention_weight }))
  };
}

for (const p of grouped.values()) {
  const existing = (Object.values(p.aspects).filter(Boolean) as AspectBucket[]);
  const sum = existing.reduce((acc, a) => acc + a.confidenceScore, 0);
  p.overallConfidence = existing.length ? sum / existing.length : 0;
  p.totalReviews = existing.reduce((acc, a) => acc + a.reviews.length, 0);
  const score = existing.reduce((acc, a) => acc + (a.sentiment === 'Positive' ? 1 : a.sentiment === 'Negative' ? -1 : 0), 0);
  p.overallSentiment = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral';
}

export async function getPropertyInsights(): Promise<PropertyInsights[]> {
  return [...grouped.values()].sort((a, b) => b.overallConfidence - a.overallConfidence);
}
