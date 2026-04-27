import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import { followups, addFollowup, BUSINESS_NAME, GOOGLE_REVIEW_URL } from '../lib/store'

const router = Router()

const followupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many follow-up requests, please try again later.' },
})

router.get('/', (_req, res) => {
  res.json(followups)
})

router.post('/', followupLimiter, async (req, res) => {
  const { customer_name, customer_email, customer_phone, channel } = req.body
  if (!customer_name || !channel) {
    res.status(400).json({ error: 'customer_name and channel required' })
    return
  }

  const message = `Hi ${customer_name}! Thanks for choosing ${BUSINESS_NAME}. We'd love your feedback — it only takes a minute: ${GOOGLE_REVIEW_URL}`

  if (channel === 'email') {
    if (!customer_email) { res.status(400).json({ error: 'customer_email required' }); return }
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: customer_email,
      subject: `How was your experience at ${BUSINESS_NAME}?`,
      html: `<p>${message}</p><p><a href="${GOOGLE_REVIEW_URL}">Leave a Review →</a></p>`,
    })
    if (error) { res.status(500).json({ error: 'Email send failed' }); return }

    const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email, customer_phone: customer_phone ?? null, channel, status: 'sent', message_body: message, sent_at: new Date().toISOString() })
    res.json(record)

  } else if (channel === 'sms') {
    const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email: customer_email ?? null, customer_phone: customer_phone ?? null, channel, status: 'simulated', message_body: message, sent_at: new Date().toISOString() })
    res.json(record)

  } else if (channel === 'qr') {
    const qrDataUrl = await QRCode.toDataURL(GOOGLE_REVIEW_URL, { width: 300, margin: 2 })
    const record = addFollowup({ location_id: 'kai-auto-honolulu', customer_name, customer_email: customer_email ?? null, customer_phone: customer_phone ?? null, channel, status: 'sent', message_body: message, sent_at: new Date().toISOString() })
    res.json({ ...record, qrDataUrl })

  } else {
    res.status(400).json({ error: 'Invalid channel' })
  }
})

export default router
