import React from 'react'
import type { Review } from '../types'
import ReviewCard from './ReviewCard'
import CTAInline from './CTAInline'

interface Props {
  reviews: Review[]
  onRespond: (id: string) => void
  ctaAfter?: number
}

export default function ReviewFeed({ reviews, onRespond, ctaAfter }: Props) {
  if (reviews.length === 0) return (
    <div className="card">
      <div className="empty-state">
        <div className="empty-state-title">No reviews match your filters</div>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="card-header">
        Recent Reviews ({reviews.length})
        <div className="review-legend">
          <span className="legend-item"><span className="legend-swatch legend-swatch-alert" />Needs response</span>
          <span className="legend-item"><span className="legend-swatch legend-swatch-replied" />Responded</span>
          <span className="legend-item"><span className="legend-swatch legend-swatch-edited" />Response updated</span>
        </div>
      </div>
      <div>
        {reviews.map((review, i) => (
          <React.Fragment key={review.id}>
            <ReviewCard review={review} onRespond={onRespond} index={i} />
            {ctaAfter !== undefined && i === ctaAfter - 1 && <CTAInline />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
