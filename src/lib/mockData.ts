import type { AspectSentiment, Property, Review } from './database.types';

const now = new Date().toISOString();

export const mockProperties: Property[] = [
  {
    id: 'p1',
    name: 'Skyline Residences',
    location: 'Bandra West, Mumbai',
    price: 48500000,
    area_sqft: 2140,
    description: 'Premium sea-facing apartments with concierge services, wellness center, and private terraces.',
    image_url: '',
    overall_sentiment_score: 0.86,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p2',
    name: 'Emerald Heights',
    location: 'Whitefield, Bengaluru',
    price: 22400000,
    area_sqft: 1680,
    description: 'Smart-home enabled residences near tech parks with landscaped gardens and co-working lounges.',
    image_url: '',
    overall_sentiment_score: 0.72,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p3',
    name: 'Maple Courtyard',
    location: 'Noida Sector 150, NCR',
    price: 13800000,
    area_sqft: 1420,
    description: 'Community-focused project with sports facilities, EV charging, and dedicated kids activity zones.',
    image_url: '',
    overall_sentiment_score: 0.58,
    created_at: now,
    updated_at: now
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    property_id: 'p1',
    user_name: 'Ananya S.',
    review_text: 'Amazing maintenance and beautiful views. The access roads can get slightly crowded during weekends.',
    rating: 5,
    sentiment: 'Positive',
    sentiment_score: 0.88,
    created_at: now
  },
  {
    id: 'r2',
    property_id: 'p1',
    user_name: 'Rahul M.',
    review_text: 'Great location and premium amenities, but monthly maintenance is expensive for some buyers.',
    rating: 4,
    sentiment: 'Neutral',
    sentiment_score: 0.55,
    created_at: now
  },
  {
    id: 'r3',
    property_id: 'p2',
    user_name: 'Priya K.',
    review_text: 'Commute to tech parks is easy and the apartment layout is fantastic. Water pressure issues happened twice.',
    rating: 4,
    sentiment: 'Positive',
    sentiment_score: 0.79,
    created_at: now
  },
  {
    id: 'r4',
    property_id: 'p3',
    user_name: 'Vikas R.',
    review_text: 'Value for money but public transport options are limited in late evenings.',
    rating: 3,
    sentiment: 'Neutral',
    sentiment_score: 0.48,
    created_at: now
  },
  {
    id: 'r5',
    property_id: 'p3',
    user_name: 'Neha T.',
    review_text: 'Clubhouse is still under construction and there are frequent power backup delays.',
    rating: 2,
    sentiment: 'Negative',
    sentiment_score: 0.21,
    created_at: now
  }
];

export const mockAspectSentiments: AspectSentiment[] = [
  { id: 'a1', review_id: 'r1', aspect: 'Location', sentiment: 'Positive', score: 0.9, key_phrases: ['sea view', 'prime neighborhood'], created_at: now },
  { id: 'a2', review_id: 'r1', aspect: 'Transport', sentiment: 'Neutral', score: 0.48, key_phrases: ['weekend traffic'], created_at: now },
  { id: 'a3', review_id: 'r1', aspect: 'Utilities', sentiment: 'Positive', score: 0.83, key_phrases: ['maintenance'], created_at: now },
  { id: 'a4', review_id: 'r2', aspect: 'Location', sentiment: 'Positive', score: 0.81, key_phrases: ['central'], created_at: now },
  { id: 'a5', review_id: 'r2', aspect: 'Price', sentiment: 'Negative', score: 0.35, key_phrases: ['high maintenance'], created_at: now },
  { id: 'a6', review_id: 'r3', aspect: 'Transport', sentiment: 'Positive', score: 0.84, key_phrases: ['easy commute'], created_at: now },
  { id: 'a7', review_id: 'r3', aspect: 'Utilities', sentiment: 'Neutral', score: 0.46, key_phrases: ['water pressure'], created_at: now },
  { id: 'a8', review_id: 'r4', aspect: 'Price', sentiment: 'Positive', score: 0.77, key_phrases: ['value'], created_at: now },
  { id: 'a9', review_id: 'r4', aspect: 'Transport', sentiment: 'Negative', score: 0.29, key_phrases: ['limited options'], created_at: now },
  { id: 'a10', review_id: 'r5', aspect: 'Utilities', sentiment: 'Negative', score: 0.22, key_phrases: ['backup delays'], created_at: now },
  { id: 'a11', review_id: 'r5', aspect: 'Location', sentiment: 'Neutral', score: 0.5, key_phrases: ['developing zone'], created_at: now }
];
