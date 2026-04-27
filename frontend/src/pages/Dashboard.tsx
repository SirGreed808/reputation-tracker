import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Review, StatsResponse } from '../types'
import ScoreCard from '../components/ScoreCard'
import TrendChart from '../components/TrendChart'
import ReviewFeed from '../components/ReviewFeed'

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.reviews.stats(), api.reviews.list()])
      .then(([s, r]) => { setStats(s); setReviews(r) })
      .finally(() => setLoading(false))
  }, [])

  async function markResponded(id: string) {
    await api.reviews.respond(id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, responded_at: new Date().toISOString() } : r))
  }

  if (loading) return <div className="loading-bar" />

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Acme Auto Repair</h1>
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
