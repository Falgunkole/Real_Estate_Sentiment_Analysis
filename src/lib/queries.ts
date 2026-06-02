import type { AspectSentiment, Property, Review } from './database.types';
import {
  hydratePropertyDetails,
  processedAspectSentiments,
  processedProperties,
  processedReviews,
  propertyAspectSummaries,
  ensureFullData,
  type PropertyAspectSummary
} from './dataProcessor';

export type { PropertyAspectSummary };

export async function getProperties(): Promise<Property[]> {
  return processedProperties;
}

export async function getReviewsByProperty(propertyId: string): Promise<Review[]> {
  await hydratePropertyDetails(propertyId);
  return processedReviews.filter((review) => review.property_id === propertyId);
}

export async function getAspectSentimentsByReview(reviewId: string): Promise<AspectSentiment[]> {
  return processedAspectSentiments.filter((aspect) => aspect.review_id === reviewId);
}

export async function getPropertyAspectSummaries(propertyId: string): Promise<PropertyAspectSummary[]> {
  return propertyAspectSummaries.get(propertyId) ?? [];
}

export async function preloadFullDataset(): Promise<void> {
  await ensureFullData();
}

export async function getPropertyAspectSentiments(propertyId: string): Promise<AspectSentiment[]> {
  await hydratePropertyDetails(propertyId);
  const reviewIds = new Set(
    processedReviews.filter((r) => r.property_id === propertyId).map((r) => r.id)
  );
  return processedAspectSentiments.filter((a) => reviewIds.has(a.review_id));
}
