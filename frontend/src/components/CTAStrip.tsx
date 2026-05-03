interface Props {
  variant?: 'dashboard' | 'followups'
}

const copy = {
  dashboard: {
    headline: 'Want this running on your real reviews?',
    sub: 'This is a live demo. The full version connects to your Google Business profile, tracks real reviews as they come in, and lets your team respond without ever leaving the dashboard.',
  },
  followups: {
    headline: 'Turn every happy customer into a reviewer.',
    sub: 'The full version automates follow-up timing, tracks open rates, and tells you which customers are most likely to leave a review — so you stop guessing and start growing.',
  },
}

export default function CTAStrip({ variant = 'dashboard' }: Props) {
  const { headline, sub } = copy[variant]
  return (
    <div className="cta-strip">
      <div className="cta-strip-inner">
        <div className="cta-strip-left">
          <span className="cta-strip-eyebrow">Honest Dev Consulting</span>
          <p className="cta-strip-headline">{headline}</p>
          <p className="cta-strip-sub">{sub}</p>
        </div>
        <div className="cta-strip-right">
          <a href="https://honestdev808.com" target="_blank" rel="noopener noreferrer" className="cta-strip-btn">
            Let's talk →
          </a>
          <p className="cta-strip-note">No commitment. Just a conversation.</p>
        </div>
      </div>
    </div>
  )
}
