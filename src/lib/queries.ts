import { supabase } from './supabase';

export async function getProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('overall_sentiment_score', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getReviewsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAspectSentimentsByReview(reviewId: string) {
  const { data, error } = await supabase
    .from('aspect_sentiments')
    .select('*')
    .eq('review_id', reviewId);

  if (error) throw error;
  return data;
}

export async function getAspectSentimentsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      aspect_sentiments (*)
    `)
    .eq('property_id', propertyId);

  if (error) throw error;
  return data;
}

export async function getSentimentStats() {
  const { data, error } = await supabase
    .from('reviews')
    .select('sentiment');

  if (error) throw error;

  const stats = {
    positive: data.filter(r => r.sentiment === 'Positive').length,
    negative: data.filter(r => r.sentiment === 'Negative').length,
    neutral: data.filter(r => r.sentiment === 'Neutral').length,
    total: data.length
  };

  return stats;
}
