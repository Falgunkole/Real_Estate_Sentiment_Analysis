export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          name: string;
          location: string;
          price: number;
          area_sqft: number;
          description: string;
          image_url: string;
          overall_sentiment_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          user_name: string;
          review_text: string;
          rating: number;
          sentiment: 'Positive' | 'Negative' | 'Neutral';
          sentiment_score: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      aspect_sentiments: {
        Row: {
          id: string;
          review_id: string;
          aspect: 'Location' | 'Transport' | 'Utilities' | 'Price';
          sentiment: 'Positive' | 'Negative' | 'Neutral';
          score: number;
          key_phrases: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['aspect_sentiments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['aspect_sentiments']['Insert']>;
      };
    };
  };
}

export type Property = Database['public']['Tables']['properties']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type AspectSentiment = Database['public']['Tables']['aspect_sentiments']['Row'];
