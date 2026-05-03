export interface Business {
  id: string
  user_id: string
  name: string
  type: string
  created_at: string
}

export interface Location {
  id: string
  business_id: string
  name: string
  address: string
  city: string
  state: string
  phone: string
  google_review_url: string
  prime_hours_start: string
  prime_hours_end: string
  created_at: string
}

export interface Review {
  id: string
  location_id: string
  reviewer_name: string
  rating: number
  body: string
  review_date: string
  platform: string
  sentiment: 'positive' | 'neutral' | 'negative'
  responded_at: string | null
  draft_response: string | null
  draft_generated_at: string | null
  created_at: string
}

export interface FollowupRequest {
  id: string
  location_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  channel: 'email' | 'sms' | 'qr'
  status: 'sent' | 'simulated' | 'pending'
  message_body: string
  sent_at: string
  created_at: string
}

export interface ReputationScore {
  score: number
  ratingScore: number
  volumeScore: number
  recencyScore: number
  responseRateScore: number
  avgRating: number
  totalReviews: number
  respondedCount: number
}

export interface TrendPoint {
  date: string
  avgRating: number
  reviewCount: number
  score: number
}
