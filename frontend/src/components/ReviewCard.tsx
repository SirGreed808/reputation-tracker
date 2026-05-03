import { useState, useRef } from 'react'
import type { Review } from '../types'
import { api } from '../lib/api'

const TONES = ['Professional', 'Friendly', 'Apologetic', 'Enthusiastic'] as const
type Tone = typeof TONES[number]

type StreamState = 'idle' | 'thinking' | 'responding' | 'done' | 'error'

interface Props {
  review: Review
  onRespond: (id: string) => void
  index?: number
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--ink-muted)', letterSpacing: 1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

const sentimentConfig = {
  positive: { label: 'Positive', color: 'var(--success)', bg: 'var(--success-light)' },
  neutral: { label: 'Neutral', color: 'var(--text-muted)', bg: 'var(--bg)' },
  negative: { label: 'Negative', color: 'var(--danger)', bg: 'var(--danger-light)' },
}

export default function ReviewCard({ review, onRespond, index = 0 }: Props) {
  const cfg = sentimentConfig[review.sentiment]
  const isOldNegative = review.sentiment === 'negative' && !review.responded_at &&
    (Date.now() - new Date(review.review_date).getTime()) > 48 * 3600 * 1000

  const [expanded, setExpanded] = useState(false)
  const [tone, setTone] = useState<Tone>('Professional')
  const [thinking, setThinking] = useState('')
  const [response, setResponse] = useState(review.draft_response ?? '')
  const [streamState, setStreamState] = useState<StreamState>(review.draft_response ? 'done' : 'idle')
  const [thinkingDuration, setThinkingDuration] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [replied, setReplied] = useState(false)
  const [repliedText, setRepliedText] = useState('')
  const [locked, setLocked] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const thinkingStartRef = useRef<number | null>(null)

  const isResponded = !!(review.responded_at || replied)
  const isArchived = isResponded && !!response
  const isDirty = isArchived && !locked && repliedText !== '' && response !== repliedText

  async function handleGenerate() {
    if (streamState === 'thinking' || streamState === 'responding') return
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setThinking('')
    setResponse('')
    setThinkingDuration(null)
    thinkingStartRef.current = null
    setStreamState('thinking')

    await api.reviews.generateResponse(review.id, tone, {
      onThinkingStart: () => {
        thinkingStartRef.current = Date.now()
        setStreamState('thinking')
      },
      onThinkingDelta: (text) => setThinking((t) => t + text),
      onResponseStart: () => {
        const start = thinkingStartRef.current
        if (start !== null) setThinkingDuration((Date.now() - start) / 1000)
        setStreamState('responding')
      },
      onResponseDelta: (text) => setResponse((r) => r + text),
      onDone: () => setStreamState('done'),
      onError: (msg) => { setResponse(msg); setStreamState('error') },
    }, abortRef.current.signal)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleReply() {
    onRespond(review.id)
    setReplied(true)
    setRepliedText(response)
    setExpanded(false)
  }

  function handleLock() {
    setLocked(true)
    setRepliedText(response)
  }

  const isStreaming = streamState === 'thinking' || streamState === 'responding'
  const showToggle = isArchived || !isResponded
  const toggleLabel = expanded
    ? (isArchived ? 'Hide reply' : 'Hide draft')
    : (isArchived ? 'View reply' : response ? 'View draft' : 'Generate response')

  const cardClass = [
    'review-item',
    isOldNegative ? 'review-alert' : '',
    isDirty ? 'review-edited' : isArchived ? 'review-replied' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass} style={{ '--index': index } as React.CSSProperties}>
      <div className="review-header">
        <div>
          <span className="review-name">{review.reviewer_name}</span>
          <span className="review-platform">{review.platform}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sentiment-tag" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
          <span className="review-date">
            {new Date(review.review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Stars rating={review.rating} />
      {review.body && <p className="review-body">{review.body}</p>}

      <div className="review-footer">
        {isResponded ? (
          <span className="responded-tag">✓ Responded</span>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => onRespond(review.id)}>
            Mark as responded
          </button>
        )}
        {showToggle && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            {toggleLabel}
          </button>
        )}
        {isOldNegative && <span className="overdue-tag">⚠ No response in 48+ hrs</span>}
        {isOldNegative && <span className="insight-nudge" style={{ display: 'inline' }}>Every reader is forming an opinion.</span>}
      </div>

      <div className={`draft-panel-wrap${expanded ? ' expanded' : ''}`} inert={expanded ? undefined : true}>
        <div className="draft-panel-inner">
          <div className="draft-panel">

            {/* Tone picker — hidden when locked */}
            {!locked && (
              <div className="draft-tones" role="radiogroup" aria-label="Response tone">
                {TONES.map((t) => (
                  <button
                    key={t}
                    role="radio"
                    aria-checked={tone === t}
                    className={`draft-tone${tone === t ? ' active' : ''}`}
                    onClick={() => setTone(t)}
                    disabled={isStreaming}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <div className="draft-status" aria-live="polite">
              {isArchived && locked && '✓ Reply locked'}
              {isArchived && !locked && isDirty && 'Response edited since posting'}
              {isArchived && !locked && !isDirty && '✓ Sent reply'}
              {!isArchived && streamState === 'thinking' && 'Thinking…'}
              {!isArchived && streamState === 'responding' && 'Drafting…'}
              {!isArchived && streamState === 'done' && thinkingDuration !== null && `Thought for ${thinkingDuration.toFixed(1)}s`}
              {!isArchived && streamState === 'error' && 'Error — try again'}
              {!isArchived && streamState === 'idle' && !response && 'Pick a tone and generate'}
            </div>

            {thinking && !locked && (
              <details className="draft-thinking">
                <summary>Claude's reasoning</summary>
                <div className="draft-thinking-body">{thinking}</div>
              </details>
            )}

            {response && (
              <textarea
                className="draft-response draft-response-editable"
                value={response}
                onChange={(e) => { if (!locked) setResponse(e.target.value) }}
                rows={5}
                aria-label="Edit response"
                readOnly={locked}
                style={locked ? { opacity: 0.7, cursor: 'default', resize: 'none' } : undefined}
              />
            )}

            {!isArchived && streamState === 'done' && (
              <p className="insight-nudge">Most owners paste this in under 30 seconds. A response turns a critic into a case study.</p>
            )}

            <div className="draft-actions">
              {/* Regenerate — hidden when locked */}
              {!locked && (
                <button
                  className={`btn btn-sm${isStreaming ? ' streaming' : ''}`}
                  onClick={handleGenerate}
                  disabled={isStreaming}
                >
                  {isStreaming ? 'Generating…' : (response ? 'Regenerate' : 'Generate')}
                </button>
              )}

              {/* Copy — always available */}
              {response && (
                <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}

              {/* Reply — only before archived */}
              {response && !isArchived && (
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}
                  onClick={handleReply}
                >
                  Reply
                </button>
              )}

              {/* Lock / Unlock — only in archived state */}
              {isArchived && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => locked ? setLocked(false) : handleLock()}
                >
                  {locked ? 'Unlock reply' : 'Lock reply'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
