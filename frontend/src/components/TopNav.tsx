import { NavLink } from 'react-router-dom'
import { useTourProgress } from '../hooks/useTourProgress'

interface Props { alertCount: number }

export default function TopNav({ alertCount }: Props) {
  const { completed } = useTourProgress()

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-brand">
          <span className="top-nav-logo">RepuTrack</span>
          <span className="top-nav-demo-badge">Live Demo</span>
        </div>
        <nav className="top-nav-links">
          <NavLink to="/" end className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/reviews" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
            Reviews
            {alertCount > 0 && (
              <span className="nav-badge" aria-label={`${alertCount} unanswered`}>{alertCount}</span>
            )}
          </NavLink>
          <NavLink to="/followups" className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
            Follow-ups
          </NavLink>
        </nav>
        <div className="tour-progress" aria-label="Demo tour progress">
          <span className={`tour-dot${completed.has('dashboard') ? ' done' : ''}`} />
          <span className={`tour-dot${completed.has('reviews') ? ' done' : ''}`} />
          <span className={`tour-dot${completed.has('followups') ? ' done' : ''}`} />
        </div>
        <a
          href="https://honestdev808.com"
          target="_blank"
          rel="noopener noreferrer"
          className="top-nav-credit"
        >
          Built by Honest Dev
        </a>
      </div>
    </header>
  )
}
