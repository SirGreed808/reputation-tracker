import type { Review, ReputationScore, TrendPoint } from '../types'

export function computeScore(reviews: Review[]): ReputationScore {
  if (reviews.length === 0) {
    return { score: 0, ratingScore: 0, volumeScore: 0, recencyScore: 0, responseRateScore: 0, avgRating: 0, totalReviews: 0, respondedCount: 0 }
  }

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const ratingScore = Math.round((avgRating / 5) * 40)

  const volumeScore = Math.min(20, Math.round((reviews.length / 50) * 20))

  const now = Date.now()
  const avgAgeDays = reviews.reduce((s, r) => s + (now - new Date(r.review_date).getTime()) / 86400000, 0) / reviews.length
  const recencyScore = Math.round(Math.max(0, 20 - (avgAgeDays / 90) * 20))

  const respondedCount = reviews.filter((r) => r.responded_at).length
  const responseRateScore = Math.round((respondedCount / reviews.length) * 20)

  const score = ratingScore + volumeScore + recencyScore + responseRateScore

  return { score, ratingScore, volumeScore, recencyScore, responseRateScore, avgRating, totalReviews: reviews.length, respondedCount }
}

export function computeTrend(reviews: Review[], days = 90): TrendPoint[] {
  const now = new Date()
  const points: TrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)

    // cumulative reviews up to this date
    const upTo = reviews.filter((r) => r.review_date <= dateStr)
    if (upTo.length === 0) continue

    const avgRating = upTo.reduce((s, r) => s + r.rating, 0) / upTo.length
    const score = computeScore(upTo).score
    points.push({ date: dateStr, avgRating: Math.round(avgRating * 10) / 10, reviewCount: upTo.length, score })
  }

  // downsample to ~30 points for chart readability
  if (points.length <= 30) return points
  const step = Math.ceil(points.length / 30)
  return points.filter((_, i) => i % step === 0)
}
