import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Review } from '../types'
import { FALLBACK_REVIEWS } from '../lib/fallback'
import ReviewFeed from '../components/ReviewFeed'

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative'
type StatusFilter = 'all' | 'needs-response' | 'responded'

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)
  const [sentiment, setSentiment] = useState<SentimentFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.reviews.list()
      .then(r => setReviews(r))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function markResponded(id: string) {
    await api.reviews.respond(id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, responded_at: new Date().toISOString() } : r))
  }

  const q = search.trim().toLowerCase()

  const filtered = reviews.filter(r => {
    if (sentiment !== 'all' && r.sentiment !== sentiment) return false
    if (status === 'needs-response' && r.responded_at) return false
    if (status === 'responded' && !r.responded_at) return false
    if (q && !r.reviewer_name.toLowerCase().includes(q) && !r.body.toLowerCase().includes(q)) return false
    return true
  })

  const counts = {
    all: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
    'needs-response': reviews.filter(r => !r.responded_at).length,
    responded: reviews.filter(r => r.responded_at).length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">{reviews.length} total · 90 days</p>
        </div>
        <input
          className="review-search"
          type="search"
          placeholder="Search by name or keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search reviews"
        />
      </div>

      <div className="filter-rows">
        <div className="filter-tabs" role="radiogroup" aria-label="Filter by sentiment">
          {(['all', 'positive', 'neutral', 'negative'] as const).map(s => (
            <button key={s} role="radio" aria-checked={sentiment === s}
              className={`filter-tab${sentiment === s ? ' active' : ''}`}
              onClick={() => setSentiment(s)}
            >
              <span style={{ textTransform: 'capitalize' }}>{s}</span>
              <span className="filter-tab-count">({counts[s]})</span>
            </button>
          ))}
        </div>

        <div className="filter-tabs" role="radiogroup" aria-label="Filter by status">
          {([
            { key: 'all', label: 'All status' },
            { key: 'needs-response', label: 'Needs response' },
            { key: 'responded', label: 'Responded' },
          ] as const).map(({ key, label }) => (
            <button key={key} role="radio" aria-checked={status === key}
              className={`filter-tab${status === key ? ' active' : ''}`}
              onClick={() => setStatus(key)}
            >
              {label}
              <span className="filter-tab-count">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {sentiment === 'negative' && counts.negative > 0 && (
        <p className="insight-nudge">These are the reviews undecided customers read first.</p>
      )}

      {loading
        ? <div className="loading-bar" role="status" aria-label="Loading" />
        : <ReviewFeed reviews={filtered} onRespond={markResponded} ctaAfter={8} />
      }
    </>
  )
}
