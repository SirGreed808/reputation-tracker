import type { Review } from '../types'

interface Props {
  reviews: Review[]
  onRespond: (id: string) => void
}

const sentimentConfig = {
  positive: { label: 'Positive', color: 'var(--success)', bg: 'var(--success-light)' },
  neutral: { label: 'Neutral', color: 'var(--text-muted)', bg: 'var(--bg)' },
  negative: { label: 'Negative', color: 'var(--danger)', bg: 'var(--danger-light)' },
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewFeed({ reviews, onRespond }: Props) {
  if (reviews.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-state-title">No reviews yet</div>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="card-header">Recent Reviews ({reviews.length})</div>
      <div>
        {reviews.map(review => {
          const cfg = sentimentConfig[review.sentiment]
          const isOldNegative = review.sentiment === 'negative' && !review.responded_at &&
            (Date.now() - new Date(review.review_date).getTime()) > 48 * 3600 * 1000

          return (
            <div key={review.id} className={`review-item${isOldNegative ? ' review-alert' : ''}`}>
              <div className="review-header">
                <div>
                  <span className="review-name">{review.reviewer_name}</span>
                  <span className="review-platform">{review.platform}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sentiment-tag" style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                  <span className="review-date">{new Date(review.review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <Stars rating={review.rating} />
              {review.body && <p className="review-body">{review.body}</p>}
              <div className="review-footer">
                {review.responded_at ? (
                  <span className="responded-tag">✓ Responded</span>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => onRespond(review.id)}>
                    Mark as responded
                  </button>
                )}
                {isOldNegative && <span className="overdue-tag">⚠ No response in 48+ hrs</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
