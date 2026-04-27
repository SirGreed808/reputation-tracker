import { Router } from 'express'
import { reviews } from '../lib/store'
import { computeScore, computeTrend } from '../lib/score'

const router = Router()

router.get('/', (_req, res) => {
  res.json([...reviews].sort((a, b) => b.review_date.localeCompare(a.review_date)))
})

router.get('/stats', (_req, res) => {
  const score = computeScore(reviews)
  const trend = computeTrend(reviews)
  const unansweredAlerts = reviews.filter(
    (r) => r.sentiment === 'negative' && !r.responded_at &&
    (Date.now() - new Date(r.review_date).getTime()) > 48 * 3600 * 1000
  ).length
  res.json({ score, trend, unansweredAlerts })
})

router.patch('/:id/respond', (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id)
  if (!review) { res.status(404).json({ error: 'Not found' }); return }
  review.responded_at = new Date().toISOString()
  res.json(review)
})

export default router
