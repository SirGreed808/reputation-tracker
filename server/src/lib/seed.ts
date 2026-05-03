import type { Review } from '../types'

// 90-day mixed/realistic narrative for "Kai's Auto Repair" in Honolulu, HI
// Arc: decent start → negative streak around day 30-45 → recovery → strong finish

const positiveReviewers = [
  'Marcus T.', 'Leilani K.', 'Dave S.', 'Priya N.', 'Jordan M.', 'Keoni A.',
  'Tiffany R.', 'Sam W.', 'Elena V.', 'Brock H.', 'Mia C.', 'Tyler F.',
]
const negativeReviewers = ['Frustrated Customer', 'John D.', 'Sarah M.', 'Anonymous', 'Local Guide']

const positiveTexts = [
  'Kai and his team were fantastic. Fixed my AC and had me back on the road same day.',
  'Honest pricing, no upsells, and the work was done right the first time. Will be back.',
  'Been coming here for years. Always fair, always fast. Best shop on the island.',
  'They diagnosed a problem two other shops missed. Saved me a ton of money.',
  'Great communication throughout. Got texts with updates — really appreciated that.',
  'Clean shop, friendly staff. Brakes feel solid. Highly recommend.',
  "Reasonable prices and they actually show you what's wrong before charging you. Refreshing.",
  'Quick oil change, no wait. These guys respect your time.',
]
const neutralTexts = [
  'Decent shop. Work was done fine, took a bit longer than expected.',
  'OK experience. Nothing special but got the job done.',
  'Fixed the issue but the waiting area could use some work.',
]
const negativeTexts = [
  'Waited 3 hours for a job they quoted as 1 hour. No apology, no update. Frustrating.',
  "Charged me for a part that didn't fix the issue. Had to go back twice.",
  'Poor communication. Called three times and no one picked up.',
  "The repair didn't hold. Had to take it to another shop to get it done right.",
  "Way overpriced compared to other shops in the area. Won't be back.",
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function dateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

export function generateSeedReviews(locationId: string): Review[] {
  const reviews: Review[] = []

  // Days 85-60: decent start, mostly positive (3-4 reviews/week)
  const phase1 = [
    { daysAgo: 85, rating: 5, type: 'positive' },
    { daysAgo: 82, rating: 4, type: 'positive' },
    { daysAgo: 78, rating: 5, type: 'positive' },
    { daysAgo: 75, rating: 3, type: 'neutral' },
    { daysAgo: 72, rating: 4, type: 'positive' },
    { daysAgo: 68, rating: 5, type: 'positive' },
    { daysAgo: 65, rating: 4, type: 'positive' },
    { daysAgo: 61, rating: 2, type: 'negative' },
    { daysAgo: 60, rating: 5, type: 'positive' },
  ]

  // Days 59-40: negative streak (bad week, couple of 1-stars)
  const phase2 = [
    { daysAgo: 57, rating: 1, type: 'negative' },
    { daysAgo: 54, rating: 2, type: 'negative' },
    { daysAgo: 51, rating: 1, type: 'negative' },
    { daysAgo: 49, rating: 3, type: 'neutral' },
    { daysAgo: 46, rating: 2, type: 'negative' },
    { daysAgo: 44, rating: 4, type: 'positive' },
    { daysAgo: 42, rating: 1, type: 'negative' },
    { daysAgo: 40, rating: 3, type: 'neutral' },
  ]

  // Days 39-20: recovery (owner started responding, improving)
  const phase3 = [
    { daysAgo: 37, rating: 4, type: 'positive' },
    { daysAgo: 34, rating: 3, type: 'neutral' },
    { daysAgo: 31, rating: 5, type: 'positive' },
    { daysAgo: 28, rating: 4, type: 'positive' },
    { daysAgo: 25, rating: 4, type: 'positive' },
    { daysAgo: 22, rating: 5, type: 'positive' },
    { daysAgo: 20, rating: 2, type: 'negative' },
  ]

  // Days 19-1: strong finish
  const phase4 = [
    { daysAgo: 17, rating: 5, type: 'positive' },
    { daysAgo: 15, rating: 5, type: 'positive' },
    { daysAgo: 13, rating: 4, type: 'positive' },
    { daysAgo: 10, rating: 5, type: 'positive' },
    { daysAgo: 8, rating: 4, type: 'positive' },
    { daysAgo: 5, rating: 5, type: 'positive' },
    { daysAgo: 3, rating: 4, type: 'positive' },
    { daysAgo: 1, rating: 5, type: 'positive' },
  ]

  const allItems = [...phase1, ...phase2, ...phase3, ...phase4]

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i]
    const sentiment = item.type as 'positive' | 'neutral' | 'negative'
    const reviewer = sentiment === 'positive'
      ? randomFrom(positiveReviewers)
      : sentiment === 'negative'
      ? randomFrom(negativeReviewers)
      : 'A Local'

    const body = sentiment === 'positive'
      ? randomFrom(positiveTexts)
      : sentiment === 'negative'
      ? randomFrom(negativeTexts)
      : randomFrom(neutralTexts)

    // ~25% responded — every 4th review, spread across all phases
    const responded = i % 4 === 0

    reviews.push({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      location_id: locationId,
      reviewer_name: reviewer,
      rating: item.rating,
      body,
      review_date: dateStr(item.daysAgo),
      platform: Math.random() > 0.2 ? 'Google' : 'Yelp',
      sentiment,
      responded_at: responded ? new Date(Date.now() - item.daysAgo * 86400000 + 86400000).toISOString() : null,
      draft_response: null,
      draft_generated_at: null,
    })
  }

  return reviews
}
