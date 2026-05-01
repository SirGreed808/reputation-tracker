import type { Review } from '../types'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const FALLBACK_REVIEWS: Review[] = [
  { id: 'f1', location_id: 'demo', reviewer_name: 'Keoni A.', rating: 5, body: 'Best shop on the island. Honest pricing, no upsells, and the work was done right the first time. Will be back.', review_date: daysAgo(1), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f2', location_id: 'demo', reviewer_name: 'Mia C.', rating: 4, body: 'Great communication throughout. Got texts with updates the whole time — really appreciated that.', review_date: daysAgo(3), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f3', location_id: 'demo', reviewer_name: 'Tyler F.', rating: 5, body: 'Clean shop, friendly staff. Brakes feel solid. Highly recommend.', review_date: daysAgo(5), platform: 'Yelp', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f4', location_id: 'demo', reviewer_name: 'Jordan M.', rating: 4, body: 'Quick oil change, no wait. These guys respect your time.', review_date: daysAgo(8), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f5', location_id: 'demo', reviewer_name: 'Sarah M.', rating: 2, body: "Charged me for a part that didn't fix the issue. Had to go back twice.", review_date: daysAgo(20), platform: 'Google', sentiment: 'negative', responded_at: null },
]
