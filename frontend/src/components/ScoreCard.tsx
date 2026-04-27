import type { ReputationScore } from '../types'

interface Props { score: ReputationScore }

function ScoreMeter({ value }: { value: number }) {
  const color = value >= 75 ? 'var(--success)' : value >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="score-meter">
      <div className="score-meter-bg">
        <div className="score-meter-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="score-meter-label" style={{ color }}>{value}</span>
    </div>
  )
}

function SubScore({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="subscore">
      <div className="subscore-label">{label}</div>
      <div className="subscore-bar-wrap">
        <div className="subscore-bar" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="subscore-val">{value}/{max}</div>
    </div>
  )
}

export default function ScoreCard({ score }: Props) {
  return (
    <div className="card score-card">
      <div className="card-header">Reputation Health Score</div>
      <div className="card-body">
        <ScoreMeter value={score.score} />

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
