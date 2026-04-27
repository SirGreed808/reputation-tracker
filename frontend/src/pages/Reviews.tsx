import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Review } from '../types'
import ReviewFeed from '../components/ReviewFeed'

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.reviews.list().then(r => { setReviews(r); setLoading(false) })
  }, [])

  async function markResponded(id: string) {
    await api.reviews.respond(id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, responded_at: new Date().toISOString() } : r))
  }

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.sentiment === filter)
  const counts = {
    all: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">{reviews.length} total · 90 days</p>
        </div>
      </div>

      <div className="filter-tabs" role="radiogroup" aria-label="Filter by sentiment">
        {(['all', 'positive', 'neutral', 'negative'] as const).map(s => (
          <button
            key={s}
            role="radio"
            aria-checked={filter === s}
            className={`filter-tab${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            <span style={{ textTransform: 'capitalize' }}>{s}</span>
            <span className="filter-tab-count">({counts[s]})</span>
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading-bar" role="status" aria-label="Loading" />
        : <ReviewFeed reviews={filtered} onRespond={markResponded} />
      }
    </>
  )
}
