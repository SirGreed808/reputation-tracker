import { useEffect, useState } from 'react'
import type { ReputationScore } from '../types'

interface Props { score: ReputationScore; style?: React.CSSProperties }

const SUBSCORE_TIPS: Record<string, string> = {
  Rating: 'Your average star rating — the biggest single factor. Even a 0.1 drop moves you down in local search.',
  Volume: 'More reviews signal an active, trusted business to Google. Thin volume hurts credibility.',
  Recency: 'Recent reviews carry more weight. A great review from 2 years ago barely moves the needle.',
  'Response Rate': 'How consistently you reply to reviews. Google rewards engagement — and so do customers.',
}

function ScoreMeter({ value, displayValue }: { value: number; displayValue: number }) {
  const color = value >= 75 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="score-meter">
      <div className="score-meter-bg">
        <div className="score-meter-fill" style={{ width: `${displayValue}%`, background: color }} />
      </div>
      <span className="score-meter-label" style={{ color }}>{displayValue}</span>
    </div>
  )
}

function SubScore({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="subscore">
      <div className="subscore-label">
        {label}
        {SUBSCORE_TIPS[label] && (
          <span className="subscore-tip" title={SUBSCORE_TIPS[label]}>?</span>
        )}
      </div>
      <div className="subscore-bar-wrap">
        <div className="subscore-bar" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="subscore-val">{value}/{max}</div>
    </div>
  )
}

export default function ScoreCard({ score, style }: Props) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const target = score.score
    const duration = 1200
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score.score])

  return (
    <div className="card score-card" style={style}>
      <div className="card-header">Reputation Health Score</div>
      <div className="card-body">
        <ScoreMeter value={score.score} displayValue={displayScore} />
        <p className="insight-nudge">
          {score.score < 60
            ? "Below 60, most customers scroll past without clicking."
            : score.score < 80
            ? "Most businesses here lose 1 in 3 undecided customers to a competitor."
            : "Top tier. This is where word-of-mouth starts compounding."}
        </p>

        <div className="score-meta">
          <div className="score-meta-item">
            <span className="score-meta-label">Avg Rating</span>
            <span className="score-meta-value">{'★'.repeat(Math.round(score.avgRating))} {score.avgRating.toFixed(1)}</span>
          </div>
          <div className="score-meta-item">
            <span className="score-meta-label">Total Reviews</span>
            <span className="score-meta-value">{score.totalReviews}</span>
          </div>
          <div className="score-meta-item">
            <span className="score-meta-label">Responded</span>
            <span className="score-meta-value">{score.respondedCount} / {score.totalReviews}</span>
          </div>
        </div>

        <div className="subscores">
          <SubScore label="Rating" value={score.ratingScore} max={40} />
          <SubScore label="Volume" value={score.volumeScore} max={20} />
          <SubScore label="Recency" value={score.recencyScore} max={20} />
          <SubScore label="Response Rate" value={score.responseRateScore} max={20} />
        </div>
      </div>
    </div>
  )
}
