import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { reviews } from '../lib/store'
import { computeScore, computeTrend } from '../lib/score'

const router = Router()

const REVIEW_RESPONDER_URL = 'https://review-responder-inky.vercel.app/api/respond'
const ALLOWED_TONES = ['Professional', 'Friendly', 'Apologetic', 'Enthusiastic']

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: 'Too many AI requests, please wait a few minutes.' },
})

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

router.post('/:id/generate-response', aiLimiter, async (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id)
  if (!review) { res.status(404).json({ error: 'Review not found' }); return }

  const tone = String(req.body?.tone ?? '')
  if (!ALLOWED_TONES.includes(tone)) {
    res.status(400).json({ error: 'Invalid tone' }); return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.flushHeaders()

  function send(event: string, data: string) {
    res.write(`event: ${event}\ndata: ${data}\n\n`)
  }

  try {
    const clientIp = req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown'
    const upstream = await fetch(REVIEW_RESPONDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': String(clientIp),
      },
      body: JSON.stringify({ review: review.body, tone }),
      signal: AbortSignal.timeout(60000),
    })

    if (!upstream.ok || !upstream.body) {
      send('error', JSON.stringify('Could not reach generation service.'))
      res.end(); return
    }

    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finalResponse = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''
      for (const block of blocks) {
        // accumulate response_delta to persist the draft
        const dataLine = block.trim().split('\n').find((l) => l.startsWith('data:'))
        const eventLine = block.trim().split('\n').find((l) => l.startsWith('event:'))
        if (eventLine?.includes('response_delta') && dataLine) {
          try { finalResponse += JSON.parse(dataLine.slice(5).trim()) } catch { /* skip */ }
        }
        // forward every event as-is to the frontend
        res.write(block + '\n\n')
      }
    }

    review.draft_response = finalResponse || null
    review.draft_generated_at = finalResponse ? new Date().toISOString() : null
    res.end()
  } catch (err) {
    console.error('generate-response proxy error:', err)
    try { send('error', JSON.stringify('Could not generate response. Please try again.')); res.end() } catch { /* client gone */ }
  }
})

export default router
