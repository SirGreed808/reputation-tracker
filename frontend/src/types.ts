export interface Review { id: string; location_id: string; reviewer_name: string; rating: number; body: string; review_date: string; platform: string; sentiment: 'positive' | 'neutral' | 'negative'; responded_at: string | null; draft_response: string | null; draft_generated_at: string | null }
export interface FollowupRequest { id: string; customer_name: string; customer_email: string | null; customer_phone: string | null; channel: 'email' | 'sms' | 'qr'; status: string; message_body: string; sent_at: string }

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

export interface TrendPoint { date: string; avgRating: number; reviewCount: number; score: number }

export interface StatsResponse {
  score: ReputationScore
  trend: TrendPoint[]
  unansweredAlerts: number
}
