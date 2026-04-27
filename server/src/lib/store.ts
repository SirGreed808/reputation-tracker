import type { FollowupRequest } from '../types'
import { generateSeedReviews } from './seed'

// In-memory store — no database needed for the portfolio demo
export const LOCATION_ID = 'kai-auto-honolulu'
export const BUSINESS_NAME = "Kai's Auto Repair"
export const GOOGLE_REVIEW_URL = 'https://g.page/r/demo-review-link'

export const reviews = generateSeedReviews(LOCATION_ID)

export const followups: FollowupRequest[] = []

export function addFollowup(f: Omit<FollowupRequest, 'id' | 'created_at'>): FollowupRequest {
  const record: FollowupRequest = {
    ...f,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  followups.unshift(record)
  if (followups.length > 100) followups.splice(100)
  return record
}
