/*
  # Real Estate Sentiment Analysis Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `name` (text) - Property name
      - `location` (text) - Property location
      - `price` (numeric) - Property price
      - `area_sqft` (numeric) - Area in square feet
      - `description` (text) - Property description
      - `image_url` (text) - Property image
      - `overall_sentiment_score` (numeric) - Aggregated sentiment score
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties)
      - `user_name` (text) - Reviewer name
      - `review_text` (text) - Review content
      - `rating` (integer) - Star rating (1-5)
      - `sentiment` (text) - Overall sentiment (Positive/Negative/Neutral)
      - `sentiment_score` (numeric) - Sentiment confidence score
      - `created_at` (timestamptz)
    
    - `aspect_sentiments`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to reviews)
      - `aspect` (text) - Aspect name (Location/Transport/Utilities/Price)
      - `sentiment` (text) - Aspect sentiment (Positive/Negative/Neutral)
      - `score` (numeric) - Sentiment score for this aspect
      - `key_phrases` (text[]) - Important phrases identified by attention
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (for demo purposes)
    - Add policies for authenticated users to insert reviews
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  area_sqft numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image_url text DEFAULT '',
  overall_sentiment_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  review_text text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
  sentiment text CHECK (sentiment IN ('Positive', 'Negative', 'Neutral')) DEFAULT 'Neutral',
  sentiment_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aspect_sentiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  aspect text CHECK (aspect IN ('Location', 'Transport', 'Utilities', 'Price')) NOT NULL,
  sentiment text CHECK (sentiment IN ('Positive', 'Negative', 'Neutral')) NOT NULL,
  score numeric DEFAULT 0,
  key_phrases text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspect_sentiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view aspect sentiments"
  ON aspect_sentiments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_aspect_sentiments_review_id ON aspect_sentiments(review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_aspect_sentiments_aspect ON aspect_sentiments(aspect);