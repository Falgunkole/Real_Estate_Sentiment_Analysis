import type { Property, Review, AspectSentiment } from './database.types';
import rawData from '../data/master_dashboard_data.json';

interface TimelineReview {
  date: string;
  review_text: string;
}

interface AspectRecord {
  property_id: string;
  aspect: AspectSentiment['aspect'];
  final_verdict: string;
  confidence_score: number;
  timeline_data: TimelineReview[];
}

const typedAspectRecords = rawData as AspectRecord[];

const POSITIVE_PATTERNS = ['good', 'positive', 'value buy', 'fairly', 'well connected'];
const NEGATIVE_PATTERNS = ['overpriced', 'poor', 'negative', 'issue'];

function parsePropertyName(idUrl: string): string {
  try {
    const { pathname } = new URL(idUrl);
    const parts = pathname.split('/').filter(Boolean);
    const slug = parts.find((p) => p.includes('reviews-ratings')) ?? parts.at(-1) ?? 'premium-property';
    return slug
      .replace(/-reviews-ratings.*/, '')
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Premium Urban Residence';
  }
}

function parseLocation(idUrl: string): string {
  try {
    const { pathname } = new URL(idUrl);
    const parts = pathname.split('/').filter(Boolean);
    const slug = parts.find((p) => p.includes('reviews-ratings')) ?? '';
    const tokens = slug.split('-').filter(Boolean);
    if (tokens.length >= 4) {
      const city = tokens[tokens.length - 3];
      const zone = tokens[tokens.length - 4];
      return `${zone.charAt(0).toUpperCase() + zone.slice(1)}, ${city.charAt(0).toUpperCase() + city.slice(1)}`;
    }
  } catch {
    // Ignore URL parse failures.
  }
  return 'Mumbai Region, MH';
}

function calculateScore(verdict: string, confidence: number): number {
  const normalized = verdict.toLowerCase();
  if (POSITIVE_PATTERNS.some((pattern) => normalized.includes(pattern))) return 0.5 + confidence * 0.5;
  if (NEGATIVE_PATTERNS.some((pattern) => normalized.includes(pattern))) return 0.5 - confidence * 0.5;
  return 0.5;
}

function parseReviewDate(value: string): string {
  const parts = value.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}T12:00:00.000Z`;
  }
  return new Date().toISOString();
}

const propertyAggregates = new Map<string, { cumulativeScore: number; count: number }>();
const propertySequence = new Map<string, number>();
const reviewByKey = new Map<string, Review>();
const reviewAspects = new Map<string, AspectSentiment[]>();
const properties: Property[] = [];
const reviews: Review[] = [];
const aspects: AspectSentiment[] = [];

for (const record of typedAspectRecords) {
  const score = calculateScore(record.final_verdict, record.confidence_score);
  const current = propertyAggregates.get(record.property_id) ?? { cumulativeScore: 0, count: 0 };
  propertyAggregates.set(record.property_id, { cumulativeScore: current.cumulativeScore + score, count: current.count + 1 });

  if (!propertySequence.has(record.property_id)) {
    propertySequence.set(record.property_id, propertySequence.size + 1);
  }
}

const sortedPropertyIds = Array.from(propertySequence.keys());
for (const propertyId of sortedPropertyIds) {
  const index = propertySequence.get(propertyId)!;
  const aggregate = propertyAggregates.get(propertyId)!;
  const name = parsePropertyName(propertyId);
  const location = parseLocation(propertyId);

  properties.push({
    id: propertyId,
    name,
    location,
    price: 12000000 + index * 3500000,
    area_sqft: 850 + index * 95,
    description: `Sentiment profile generated from complete timeline reviews for ${name}, covering location, transport, utilities, and price signals.`,
    image_url: '',
    overall_sentiment_score: Number((aggregate.cumulativeScore / aggregate.count).toFixed(2)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
}

let reviewCounter = 1;
let aspectCounter = 1;

for (const record of typedAspectRecords) {
  const score = Number(calculateScore(record.final_verdict, record.confidence_score).toFixed(2));
  const sentiment: Review['sentiment'] = score > 0.65 ? 'Positive' : score < 0.4 ? 'Negative' : 'Neutral';

  for (const item of record.timeline_data) {
    const reviewKey = `${record.property_id}::${item.review_text}`;
    let review = reviewByKey.get(reviewKey);

    if (!review) {
      review = {
        id: `json_rev_${reviewCounter++}`,
        property_id: record.property_id,
        user_name: `Verified Resident ${reviewCounter}`,
        review_text: item.review_text,
        rating: score > 0.75 ? 5 : score > 0.45 ? 4 : 2,
        sentiment,
        sentiment_score: score,
        created_at: parseReviewDate(item.date)
      };
      reviewByKey.set(reviewKey, review);
      reviews.push(review);
      reviewAspects.set(review.id, []);
    }

    const aspectRecord: AspectSentiment = {
      id: `json_asp_${aspectCounter++}`,
      review_id: review.id,
      aspect: record.aspect,
      sentiment,
      score,
      key_phrases: [record.final_verdict],
      created_at: new Date().toISOString()
    };

    aspects.push(aspectRecord);
    reviewAspects.get(review.id)?.push(aspectRecord);
  }
}

const reviewsByProperty = new Map<string, Review[]>();
for (const review of reviews) {
  const current = reviewsByProperty.get(review.property_id) ?? [];
  current.push(review);
  reviewsByProperty.set(review.property_id, current);
}

export async function getProperties(): Promise<Property[]> {
  return properties;
}

export async function getReviewsByProperty(propertyId: string): Promise<Review[]> {
  return reviewsByProperty.get(propertyId) ?? [];
}

export async function getAspectSentimentsByReview(reviewId: string): Promise<AspectSentiment[]> {
  return reviewAspects.get(reviewId) ?? [];
}

export async function getPropertyAspectSentiments(propertyId: string): Promise<AspectSentiment[]> {
  return (reviewsByProperty.get(propertyId) ?? []).flatMap((review) => reviewAspects.get(review.id) ?? []);
}

export async function getTrackedAspectCount(): Promise<number> {
  return new Set(typedAspectRecords.map((entry) => entry.aspect)).size;
}
