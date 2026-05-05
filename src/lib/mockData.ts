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
  },
  {
    id: 'p4',
    name: 'Harbor View Towers',
    location: 'Nerul, Navi Mumbai',
    price: 19800000,
    area_sqft: 1310,
    description: 'Transit-friendly residences with podium gardens, coworking pods, and rooftop fitness deck.',
    image_url: '',
    overall_sentiment_score: 0.69,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p5',
    name: 'Cedar Lake Enclave',
    location: 'Kondapur, Hyderabad',
    price: 27300000,
    area_sqft: 1765,
    description: 'Family-centric gated community near schools with clubhouse, jogging loops, and smart security.',
    image_url: '',
    overall_sentiment_score: 0.74,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p6',
    name: 'Aurora Greens',
    location: 'Wakad, Pune',
    price: 16200000,
    area_sqft: 1240,
    description: 'Modern apartments with EV charging, rainwater harvesting, and integrated retail frontage.',
    image_url: '',
    overall_sentiment_score: 0.63,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p7',
    name: 'Palm Signature',
    location: 'Sarjapur Road, Bengaluru',
    price: 31900000,
    area_sqft: 1890,
    description: 'Premium high-rise project with sky lounge, concierge desk, and proximity to major tech corridors.',
    image_url: '',
    overall_sentiment_score: 0.81,
    created_at: now,
    updated_at: now
  },
  {
    id: 'p8',
    name: 'Riverstone Habitat',
    location: 'Gomti Nagar Extension, Lucknow',
    price: 11900000,
    area_sqft: 1385,
    description: 'Value-led residential township with landscaped courtyards, multipurpose halls, and retail arcade.',
    image_url: '',
    overall_sentiment_score: 0.54,
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
  },
  {
    id: 'r6',
    property_id: 'p4',
    user_name: 'Sanya P.',
    review_text: 'Connectivity is excellent and maintenance team responds quickly. Visitor parking is limited on weekends.',
    rating: 4,
    sentiment: 'Positive',
    sentiment_score: 0.76,
    created_at: now
  },
  {
    id: 'r7',
    property_id: 'p4',
    user_name: 'Kunal B.',
    review_text: 'Good amenities and clean common areas, but gym gets crowded in the evenings.',
    rating: 4,
    sentiment: 'Neutral',
    sentiment_score: 0.58,
    created_at: now
  },
  {
    id: 'r8',
    property_id: 'p5',
    user_name: 'Aditi N.',
    review_text: 'Safe neighborhood and excellent clubhouse activities for kids. Slightly higher maintenance charges.',
    rating: 5,
    sentiment: 'Positive',
    sentiment_score: 0.84,
    created_at: now
  },
  {
    id: 'r9',
    property_id: 'p5',
    user_name: 'Rohan G.',
    review_text: 'Great build quality and greenery, though traffic near the main junction can be slow during peak hours.',
    rating: 4,
    sentiment: 'Positive',
    sentiment_score: 0.72,
    created_at: now
  },
  {
    id: 'r10',
    property_id: 'p6',
    user_name: 'Meera J.',
    review_text: 'Affordable and well-planned units. Water supply timing could be more consistent.',
    rating: 3,
    sentiment: 'Neutral',
    sentiment_score: 0.51,
    created_at: now
  },
  {
    id: 'r11',
    property_id: 'p6',
    user_name: 'Nikhil D.',
    review_text: 'Good value for first-time buyers, but elevators need faster servicing.',
    rating: 3,
    sentiment: 'Neutral',
    sentiment_score: 0.47,
    created_at: now
  },
  {
    id: 'r12',
    property_id: 'p7',
    user_name: 'Ira V.',
    review_text: 'Excellent interiors, premium amenities, and quick access to offices. Pricing is on the higher side.',
    rating: 5,
    sentiment: 'Positive',
    sentiment_score: 0.87,
    created_at: now
  },
  {
    id: 'r13',
    property_id: 'p7',
    user_name: 'Dev M.',
    review_text: 'Very polished community experience and reliable power backup. Weekend traffic near gate is a concern.',
    rating: 4,
    sentiment: 'Positive',
    sentiment_score: 0.75,
    created_at: now
  },
  {
    id: 'r14',
    property_id: 'p8',
    user_name: 'Pooja L.',
    review_text: 'Spacious layouts and fair pricing, but final finishing quality needs improvement.',
    rating: 3,
    sentiment: 'Neutral',
    sentiment_score: 0.49,
    created_at: now
  },
  {
    id: 'r15',
    property_id: 'p8',
    user_name: 'Arjun S.',
    review_text: 'Promising township but handover delays and limited public transport reduced overall satisfaction.',
    rating: 2,
    sentiment: 'Negative',
    sentiment_score: 0.31,
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
  { id: 'a11', review_id: 'r5', aspect: 'Location', sentiment: 'Neutral', score: 0.5, key_phrases: ['developing zone'], created_at: now },
  { id: 'a12', review_id: 'r6', aspect: 'Transport', sentiment: 'Positive', score: 0.82, key_phrases: ['excellent connectivity'], created_at: now },
  { id: 'a13', review_id: 'r6', aspect: 'Price', sentiment: 'Neutral', score: 0.52, key_phrases: ['parking limits'], created_at: now },
  { id: 'a14', review_id: 'r7', aspect: 'Utilities', sentiment: 'Positive', score: 0.73, key_phrases: ['clean common areas'], created_at: now },
  { id: 'a15', review_id: 'r7', aspect: 'Location', sentiment: 'Neutral', score: 0.49, key_phrases: ['crowded gym'], created_at: now },
  { id: 'a16', review_id: 'r8', aspect: 'Location', sentiment: 'Positive', score: 0.85, key_phrases: ['safe neighborhood'], created_at: now },
  { id: 'a17', review_id: 'r8', aspect: 'Price', sentiment: 'Neutral', score: 0.46, key_phrases: ['maintenance charges'], created_at: now },
  { id: 'a18', review_id: 'r9', aspect: 'Utilities', sentiment: 'Positive', score: 0.78, key_phrases: ['build quality'], created_at: now },
  { id: 'a19', review_id: 'r9', aspect: 'Transport', sentiment: 'Neutral', score: 0.44, key_phrases: ['peak-hour traffic'], created_at: now },
  { id: 'a20', review_id: 'r10', aspect: 'Price', sentiment: 'Positive', score: 0.74, key_phrases: ['affordable'], created_at: now },
  { id: 'a21', review_id: 'r10', aspect: 'Utilities', sentiment: 'Neutral', score: 0.42, key_phrases: ['water supply timing'], created_at: now },
  { id: 'a22', review_id: 'r11', aspect: 'Price', sentiment: 'Positive', score: 0.69, key_phrases: ['first-time buyers'], created_at: now },
  { id: 'a23', review_id: 'r11', aspect: 'Utilities', sentiment: 'Negative', score: 0.34, key_phrases: ['elevator servicing'], created_at: now },
  { id: 'a24', review_id: 'r12', aspect: 'Utilities', sentiment: 'Positive', score: 0.88, key_phrases: ['premium amenities'], created_at: now },
  { id: 'a25', review_id: 'r12', aspect: 'Price', sentiment: 'Neutral', score: 0.45, key_phrases: ['higher pricing'], created_at: now },
  { id: 'a26', review_id: 'r13', aspect: 'Utilities', sentiment: 'Positive', score: 0.81, key_phrases: ['reliable backup'], created_at: now },
  { id: 'a27', review_id: 'r13', aspect: 'Transport', sentiment: 'Negative', score: 0.37, key_phrases: ['weekend traffic'], created_at: now },
  { id: 'a28', review_id: 'r14', aspect: 'Price', sentiment: 'Positive', score: 0.72, key_phrases: ['fair pricing'], created_at: now },
  { id: 'a29', review_id: 'r14', aspect: 'Utilities', sentiment: 'Neutral', score: 0.41, key_phrases: ['finishing quality'], created_at: now },
  { id: 'a30', review_id: 'r15', aspect: 'Transport', sentiment: 'Negative', score: 0.28, key_phrases: ['limited public transport'], created_at: now },
  { id: 'a31', review_id: 'r15', aspect: 'Utilities', sentiment: 'Negative', score: 0.33, key_phrases: ['handover delays'], created_at: now }
];
