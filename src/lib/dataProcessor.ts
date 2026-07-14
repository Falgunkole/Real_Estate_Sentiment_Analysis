import catalogData from '../data/catalog.json';
import metadataBundle from '../data/properties_metadata.json';
import {
  ASPECT_NAMES,
  type AspectName,
  calculateAspectScore,
  normalizeVerdict,
  toReviewSentiment
} from './sentiment';
import type { AspectSentiment, Property, Review } from './database.types';

interface CatalogAspect {
  final_verdict: string;
  confidence_score: number;
  review_count: number;
}

interface CatalogProperty {
  property_id: string;
  listing_url: string;
  name: string;
  location: string;
  price: number;
  area_sqft: number;
  property_type: string;
  aspects: Record<string, CatalogAspect>;
}

interface TimelineItem {
  date: string;
  review_text: string;
  attention_weight: number;
}

interface FullAspect {
  final_verdict: string;
  confidence_score: number;
  timeline_data: TimelineItem[];
}

interface FullProperty {
  property_id: string;
  listing_url: string;
  name: string;
  location: string;
  price: number;
  area_sqft: number;
  property_type: string;
  aspects: Record<string, FullAspect>;
}

interface FullDataset {
  properties: FullProperty[];
}

interface FlatRecord {
  property_id: string;
  aspect: string;
  final_verdict: string;
  confidence_score: number;
  timeline_data: TimelineItem[];
}

export interface PropertyAspectSummary {
  aspect: AspectName;
  final_verdict: string;
  verdict_label: ReturnType<typeof normalizeVerdict>;
  confidence_score: number;
  score: number;
  review_count: number;
}

const catalog = catalogData as { properties: CatalogProperty[] };
const metadata = metadataBundle as Record<
  string,
  {
    name?: string;
    location?: string;
    price?: number;
    area_sqft?: number;
    property_type?: string;
    listing_url?: string;
  }
>;

let fullDataset: FullDataset | null = null;
let fullLoadPromise: Promise<FullDataset> | null = null;

export async function ensureFullData(): Promise<FullDataset> {
  if (fullDataset) return fullDataset;
  if (!fullLoadPromise) {
    fullLoadPromise = fetch('/data/final_dashboard_data.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load property timelines');
        return r.json() as Promise<FlatRecord[]>;
      })
      .then((flatRecords) => {
        // Transform flat array into nested structure
        const propertiesMap = new Map<string, FullProperty>();
        
        for (const record of flatRecords) {
          const pid = record.property_id;
          if (!propertiesMap.has(pid)) {
            propertiesMap.set(pid, {
              property_id: pid,
              listing_url: '',
              name: '',
              location: '',
              price: 0,
              area_sqft: 0,
              property_type: 'N/A',
              aspects: {}
            });
          }
          const prop = propertiesMap.get(pid)!;
          prop.aspects[record.aspect] = {
            final_verdict: record.final_verdict,
            confidence_score: record.confidence_score,
            timeline_data: record.timeline_data
          };
        }
        
        fullDataset = { properties: Array.from(propertiesMap.values()) };
        return fullDataset;
      })
      .catch((error) => {
        console.warn('Failed to load full dataset, using empty dataset:', error);
        fullDataset = { properties: [] };
        return fullDataset;
      });
  }
  return fullLoadPromise;
}

function mergeMeta(prop: CatalogProperty): CatalogProperty {
  const meta = metadata[prop.property_id];
  if (!meta) return prop;
  return {
    ...prop,
    name: meta.name || prop.name,
    location: meta.location || prop.location,
    price: meta.price || prop.price,
    area_sqft: meta.area_sqft || prop.area_sqft,
    property_type: meta.property_type || prop.property_type,
    listing_url: meta.listing_url || prop.listing_url
  };
}

function buildSummaries(prop: CatalogProperty): PropertyAspectSummary[] {
  const summaries: PropertyAspectSummary[] = [];

  for (const aspectName of ASPECT_NAMES) {
    const aspect = prop.aspects[aspectName];
    if (!aspect) continue;

    const verdictLabel = normalizeVerdict(aspect.final_verdict);
    const score = calculateAspectScore(aspect.final_verdict, aspect.confidence_score);

    summaries.push({
      aspect: aspectName,
      final_verdict: aspect.final_verdict,
      verdict_label: verdictLabel,
      confidence_score: aspect.confidence_score,
      score: parseFloat(score.toFixed(2)),
      review_count: aspect.review_count
    });
  }

  return summaries;
}

function overallScore(summaries: PropertyAspectSummary[]): number {
  if (summaries.length === 0) return 0;
  
  // LOG THIS TO YOUR BROWSER CONSOLE
  console.log("Processing summaries:", summaries); 
  
  const avg = summaries.reduce((s, a) => s + a.score, 0) / summaries.length;
  return parseFloat(avg.toFixed(2));
}

export const processedProperties: Property[] = catalog.properties.map((raw) => {
  const prop = mergeMeta(raw);
  const summaries = buildSummaries(prop);
  const score = overallScore(summaries);

  return {
    id: prop.property_id,
    name: prop.name,
    location: prop.location,
    price: prop.price,
    area_sqft: prop.area_sqft,
    property_type: prop.property_type,
    listing_url: prop.listing_url,
    description: `${prop.property_type} · ${prop.location} · Sentiment across 4 aspects.`,
    image_url: '',
    overall_sentiment_score: score,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

export const propertyAspectSummaries = new Map<string, PropertyAspectSummary[]>(
  catalog.properties.map((raw) => {
    const prop = mergeMeta(raw);
    return [prop.property_id, buildSummaries(prop)] as const;
  })
);

let reviewSequence = 1;
let aspectSequence = 1;
export const processedReviews: Review[] = [];
export const processedAspectSentiments: AspectSentiment[] = [];

export async function hydratePropertyDetails(propertyId: string): Promise<void> {
  const data = await ensureFullData();
  const fullProp = data.properties.find((p) => p.property_id === propertyId);
  if (!fullProp) return;

  const existingReviewIds = new Set(
    processedReviews.filter((r) => r.property_id === propertyId).map((r) => r.id)
  );
  if (existingReviewIds.size > 0) return;

  for (const aspectName of ASPECT_NAMES) {
    const record = fullProp.aspects[aspectName];
    if (!record) continue;

    const verdictLabel = normalizeVerdict(record.final_verdict);
    const aspectScore = calculateAspectScore(record.final_verdict, record.confidence_score);

    for (const item of record.timeline_data) {
      const reviewId = `rev_${reviewSequence++}`;

      let isoDate = new Date().toISOString();
      if (item.date?.includes('-')) {
        const parts = item.date.split('-');
        if (parts.length === 3) isoDate = `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
      }

      processedReviews.push({
        id: reviewId,
        property_id: propertyId,
        user_name: `Resident ${reviewSequence}`,
        review_text: item.review_text,
        rating: 0,
        sentiment: toReviewSentiment(verdictLabel),
        sentiment_score: parseFloat(aspectScore.toFixed(2)),
        created_at: isoDate
      });

      processedAspectSentiments.push({
        id: `asp_${aspectSequence++}`,
        review_id: reviewId,
        aspect: aspectName,
        sentiment: verdictLabel,
        score: parseFloat(aspectScore.toFixed(2)),
        key_phrases: [record.final_verdict],
        created_at: new Date().toISOString()
      });
    }
  }
}

export const DATA_STATS = {
  propertyCount: processedProperties.length,
  catalogSource: 'catalog.json',
  timelinesSource: '/data/final_dashboard_data.json'
};
