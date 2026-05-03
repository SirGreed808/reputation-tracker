import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { Review, StatsResponse } from '../types'
import { FALLBACK_REVIEWS } from '../lib/fallback'
import ScoreCard from '../components/ScoreCard'
import TrendChart from '../components/TrendChart'
import ReviewFeed from '../components/ReviewFeed'
import CTAStrip from '../components/CTAStrip'

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(false)
  const [toastExiting, setToastExiting] = useState(false)

  function dismissToast() {
    setToastExiting(true)
    setTimeout(() => { setToast(false); setToastExiting(false) }, 300)
  }

  useEffect(() => {
    Promise.all([api.reviews.stats(), api.reviews.list()])
      .then(([s, r]) => { setStats(s); setReviews(r) })
      .catch(() => {})
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
        <div className={`toast${toastExiting ? ' dismissed' : ''}`} role="alert">
          <div className="toast-top">
            <div className="toast-rating-row">
              <span className="toast-stars-big">★☆☆☆☆</span>
              <span className="toast-rating-label">1-Star · Google</span>
              <span className="simulated-badge">Simulated</span>
            </div>
            <button className="toast-dismiss" onClick={dismissToast} aria-label="Dismiss">✕</button>
          </div>
          <p className="toast-reviewer"><strong>James K.</strong> just left a review</p>
          <p className="toast-quote">"Waited 2 hours past my appointment. No one called to let me know."</p>
          <div className="toast-footer">
            <span className="toast-time">🔔 Just now</span>
            <Link to="/reviews" className="toast-link" onClick={dismissToast}>View &amp; respond →</Link>
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

      {stats && stats.unansweredAlerts > 0 && (
        <p className="insight-nudge insight-nudge-urgent">Owners who respond within 24hrs recover 4× more trust. Every hour counts.</p>
      )}

      {stats && (
        <div className="dashboard-grid">
          <ScoreCard score={stats.score} style={{ '--stagger': '0s' } as React.CSSProperties} />
          <TrendChart trend={stats.trend} style={{ '--stagger': '0.15s' } as React.CSSProperties} />
        </div>
      )}

      <ReviewFeed reviews={reviews.slice(0, 5)} onRespond={markResponded} />

      {reviews.length > 5 && (
        <div className="view-all-wrap">
          <Link to="/reviews" className="view-all-link">
            View all {reviews.length} reviews →
          </Link>
        </div>
      )}

      <CTAStrip variant="dashboard" />
    </>
  )
}
