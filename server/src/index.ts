import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import reviewRoutes from './routes/reviews'
import followupRoutes from './routes/followups'
import { BUSINESS_NAME, LOCATION_ID } from './lib/store'

const app = express()
const PORT = process.env.PORT || 3002

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())
app.use(globalLimiter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.get('/api/meta', (_, res) => res.json({ businessName: BUSINESS_NAME, locationId: LOCATION_ID }))

app.use('/api/reviews', reviewRoutes)
app.use('/api/followups', followupRoutes)

app.listen(PORT, () => console.log(`Reputation tracker API on port ${PORT}`))
