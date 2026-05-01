import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Review, StatsResponse } from '../types'
import ScoreCard from '../components/ScoreCard'
import TrendChart from '../components/TrendChart'
import ReviewFeed from '../components/ReviewFeed'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const FALLBACK_REVIEWS: Review[] = [
  { id: 'f1', location_id: 'demo', reviewer_name: 'Keoni A.', rating: 5, body: 'Best shop on the island. Honest pricing, no upsells, and the work was done right the first time. Will be back.', review_date: daysAgo(1), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f2', location_id: 'demo', reviewer_name: 'Mia C.', rating: 4, body: 'Great communication throughout. Got texts with updates the whole time — really appreciated that.', review_date: daysAgo(3), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f3', location_id: 'demo', reviewer_name: 'Tyler F.', rating: 5, body: 'Clean shop, friendly staff. Brakes feel solid. Highly recommend.', review_date: daysAgo(5), platform: 'Yelp', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f4', location_id: 'demo', reviewer_name: 'Jordan M.', rating: 4, body: 'Quick oil change, no wait. These guys respect your time.', review_date: daysAgo(8), platform: 'Google', sentiment: 'positive', responded_at: new Date().toISOString() },
  { id: 'f5', location_id: 'demo', reviewer_name: 'Sarah M.', rating: 2, body: "Charged me for a part that didn't fix the issue. Had to go back twice.", review_date: daysAgo(20), platform: 'Google', sentiment: 'negative', responded_at: null },
]

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    Promise.all([api.reviews.stats(), api.reviews.list()])
      .then(([s, r]) => { setStats(s); setReviews(r) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => setToast(true), 2500)
    return () => clearTimeout(t)
  }, [loading])

  async function markResponded(id: string) {
    await api.reviews.respond(id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, responded_at: new Date().toISOString() } : r))
  }

  if (loading) return <div className="loading-bar" />

  return (
    <>
      {toast && (
        <div className="toast" role="alert">
          <div className="toast-top">
            <div className="toast-rating-row">
              <span className="toast-stars-big">★☆☆☆☆</span>
              <span className="toast-rating-label">1-Star · Google</span>
            </div>
            <button className="toast-dismiss" onClick={() => setToast(false)} aria-label="Dismiss">✕</button>
          </div>
          <p className="toast-reviewer"><strong>James K.</strong> just left a review</p>
          <p className="toast-quote">"Waited 2 hours past my appointment. No one called to let me know."</p>
          <div className="toast-footer">
            <span className="toast-time">🔔 Just now</span>
            <Link to="/reviews" className="toast-link" onClick={() => setToast(false)}>View &amp; respond →</Link>
          </div>
        </div>
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title">Kai's Auto Repair</h1>
          <p className="page-subtitle">Demo Location · 90-day reputation overview</p>
        </div>
        {stats && stats.unansweredAlerts > 0 && (
          <div className="alert alert-warning" style={{ margin: 0 }}>
            ⚠ {stats.unansweredAlerts} negative review{stats.unansweredAlerts > 1 ? 's' : ''} unanswered &gt;48hrs
          </div>
        )}
      </div>

      {stats && (
        <div className="dashboard-grid">
          <ScoreCard score={stats.score} />
          <TrendChart trend={stats.trend} />
        </div>
      )}

      <ReviewFeed reviews={reviews.slice(0, 20)} onRespond={markResponded} />
    </>
  )
}
