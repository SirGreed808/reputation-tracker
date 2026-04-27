import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import QRCode from 'qrcode'
import { addFollowup, BUSINESS_NAME, GOOGLE_REVIEW_URL } from '../lib/store'

const router = Router()

const followupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: 'Too many follow-up requests, please try again later.' },
})

const ALLOWED_CHANNELS = ['email', 'sms', 'qr'] as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function sanitizeField(s: string, maxLen: number): string {
  return s.replace(/[\r\n<>]/g, '').trim().slice(0, maxLen)
}

router.get('/', (_req, res) => {
  res.json([]) // followups list — empty on fresh start after deploy
})

router.post('/', followupLimiter, async (req, res) => {
  const raw = req.body as Record<string, unknown>
  const customer_name = sanitizeField(String(raw.customer_name ?? ''), 80)
  const customer_email = sanitizeField(String(raw.customer_email ?? ''), 254)
  const customer_phone = sanitizeField(String(raw.customer_phone ?? ''), 20)
  const channel = String(raw.channel ?? '')

  if (!customer_name || !channel) {
    res.status(400).json({ error: 'customer_name and channel required' })
    return
  }
  if (!ALLOWED_CHANNELS.includes(channel as typeof ALLOWED_CHANNELS[number])) {
    res.status(400).json({ error: 'Invalid channel' })
    return
  }

  const safeName = escapeHtml(customer_name)
  const message = `Hi ${customer_name}! Thanks for choosing ${BUSINESS_NAME}. We'd love your feedback — it only takes a minute: ${GOOGLE_REVIEW_URL}`

  try {
    if (channel === 'email') {
      if (!customer_email || !EMAIL_RE.test(customer_email)) {
        res.status(400).json({ error: 'Valid customer_email required' })
        return
      }
      // Demo mode — simulates a successful send without a live email account
      console.log(`[demo] email to ${customer_email}: ${message}`)

      const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email, customer_phone: customer_phone || null, channel, status: 'sent', message_body: message, sent_at: new Date().toISOString() })
      res.json(record)

    } else if (channel === 'sms') {
      const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email: customer_email || null, customer_phone: customer_phone || null, channel, status: 'simulated', message_body: message, sent_at: new Date().toISOString() })
      res.json(record)

    } else if (channel === 'qr') {
      const qrDataUrl = await QRCode.toDataURL(GOOGLE_REVIEW_URL, { width: 300, margin: 2 })
      const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email: customer_email || null, customer_phone: customer_phone || null, channel, status: 'sent', message_body: message, sent_at: new Date().toISOString() })
      res.json({ ...record, qrDataUrl })
    }
  } catch (err) {
    console.error('followup error:', err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

export default router
