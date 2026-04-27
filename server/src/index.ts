import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import reviewRoutes from './routes/reviews'
import followupRoutes from './routes/followups'
import { BUSINESS_NAME, LOCATION_ID } from './lib/store'

if (!process.env.FRONTEND_URL) {
  console.warn('WARN: FRONTEND_URL not set — CORS will allow localhost only')
}

const app = express()
const PORT = process.env.PORT || 3002

// Trust Render's proxy so rate limiter keys on real client IP
app.set('trust proxy', 1)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PATCH'],
}))

app.use(express.json())

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
})
app.use(globalLimiter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.get('/api/meta', (_, res) => res.json({ businessName: BUSINESS_NAME, locationId: LOCATION_ID }))

app.use('/api/reviews', reviewRoutes)
app.use('/api/followups', followupRoutes)

// Global error handler — never leak stack traces to client
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

app.listen(PORT, () => console.log(`Reputation tracker API on port ${PORT}`))
