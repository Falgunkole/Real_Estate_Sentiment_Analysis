export type AspectName = 'Location' | 'Transport' | 'Utilities' | 'Price';

export type StandardSentiment = 'Positive' | 'Negative' | 'Neutral';
export type AspectSentimentLabel = StandardSentiment;

export const ASPECT_NAMES: AspectName[] = ['Location', 'Transport', 'Utilities', 'Price'];

/** Maps raw ML verdict strings to a display label (all aspects use Positive/Negative/Neutral). */
export function normalizeVerdict(verdict: string): AspectSentimentLabel {
  const v = verdict.trim();
  const lower = v.toLowerCase();

  if (lower.includes('positive') || lower.includes('good') || lower.includes('well connected') || lower.includes('value buy')) {
    return 'Positive';
  }
  if (lower.includes('negative') || lower.includes('poor') || lower.includes('issue') || lower.includes('overpric')) {
    return 'Negative';
  }
  return 'Neutral';
}

/** Maps verdict + confidence to a 0–1 score for charts and aggregates. */
export function calculateAspectScore(verdict: string, confidence: number): number {
  const label = normalizeVerdict(verdict);

  if (label === 'Positive') return 0.5 + confidence * 0.5;
  if (label === 'Negative') return 0.5 - confidence * 0.5;
  return 0.45 + confidence * 0.1;
}

/** Collapses aspect labels into Positive / Neutral / Negative for review-level sentiment. */
export function toReviewSentiment(label: AspectSentimentLabel): StandardSentiment {
  return label;
}
