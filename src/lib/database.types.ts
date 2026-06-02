import type { AspectSentimentLabel, AspectName } from './sentiment';

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  area_sqft: number;
  property_type: string;
  listing_url: string;
  description: string;
  image_url: string;
  overall_sentiment_score: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_name: string;
  review_text: string;
  rating: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentiment_score: number;
  created_at: string;
}

export interface AspectSentiment {
  id: string;
  review_id: string;
  aspect: AspectName;
  sentiment: AspectSentimentLabel;
  score: number;
  key_phrases: string[];
  created_at: string;
}
