import { mockAspectSentiments, mockProperties, mockReviews } from './mockData';
import { hasSupabaseCredentials, supabase } from './supabase';

const sortByNewest = <T extends { created_at: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

export async function getProperties() {
  if (!hasSupabaseCredentials || !supabase) {
    return [...mockProperties].sort((a, b) => b.overall_sentiment_score - a.overall_sentiment_score);
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('overall_sentiment_score', { ascending: false });

  if (error) {
    console.warn('Falling back to local property data:', error.message);
    return [...mockProperties].sort((a, b) => b.overall_sentiment_score - a.overall_sentiment_score);
  }

  return data;
}

export async function getPropertyById(id: string) {
  if (!hasSupabaseCredentials || !supabase) {
    return mockProperties.find((property) => property.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('Falling back to local property details:', error.message);
    return mockProperties.find((property) => property.id === id) ?? null;
  }

  return data;
}

export async function getReviewsByProperty(propertyId: string) {
  if (!hasSupabaseCredentials || !supabase) {
    return sortByNewest(mockReviews.filter((review) => review.property_id === propertyId));
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Falling back to local review data:', error.message);
    return sortByNewest(mockReviews.filter((review) => review.property_id === propertyId));
  }

  return data;
}

export async function getAspectSentimentsByReview(reviewId: string) {
  if (!hasSupabaseCredentials || !supabase) {
    return mockAspectSentiments.filter((aspect) => aspect.review_id === reviewId);
  }

  const { data, error } = await supabase
    .from('aspect_sentiments')
    .select('*')
    .eq('review_id', reviewId);

  if (error) {
    console.warn('Falling back to local aspect sentiment data:', error.message);
    return mockAspectSentiments.filter((aspect) => aspect.review_id === reviewId);
  }

  return data;
}

export async function getAspectSentimentsByProperty(propertyId: string) {
  if (!hasSupabaseCredentials || !supabase) {
    const reviews = mockReviews.filter((review) => review.property_id === propertyId);
    return reviews.map((review) => ({
      id: review.id,
      aspect_sentiments: mockAspectSentiments.filter((aspect) => aspect.review_id === review.id)
    }));
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      aspect_sentiments (*)
    `)
    .eq('property_id', propertyId);

  if (error) {
    console.warn('Falling back to local aspect sentiment aggregate data:', error.message);
    const reviews = mockReviews.filter((review) => review.property_id === propertyId);
    return reviews.map((review) => ({
      id: review.id,
      aspect_sentiments: mockAspectSentiments.filter((aspect) => aspect.review_id === review.id)
    }));
  }

  return data;
}

export async function getSentimentStats() {
  if (!hasSupabaseCredentials || !supabase) {
    return {
      positive: mockReviews.filter((review) => review.sentiment === 'Positive').length,
      negative: mockReviews.filter((review) => review.sentiment === 'Negative').length,
      neutral: mockReviews.filter((review) => review.sentiment === 'Neutral').length,
      total: mockReviews.length
    };
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('sentiment');

  if (error) {
    console.warn('Falling back to local sentiment stats:', error.message);
    return {
      positive: mockReviews.filter((review) => review.sentiment === 'Positive').length,
      negative: mockReviews.filter((review) => review.sentiment === 'Negative').length,
      neutral: mockReviews.filter((review) => review.sentiment === 'Neutral').length,
      total: mockReviews.length
    };
  }

  const sentimentRows = (data ?? []) as Array<{ sentiment: 'Positive' | 'Negative' | 'Neutral' }>;

  return {
    positive: sentimentRows.filter((review) => review.sentiment === 'Positive').length,
    negative: sentimentRows.filter((review) => review.sentiment === 'Negative').length,
    neutral: sentimentRows.filter((review) => review.sentiment === 'Neutral').length,
    total: sentimentRows.length
  };
}
