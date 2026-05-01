import { NavLink } from 'react-router-dom'

interface Props { alertCount: number }

export default function TopNav({ alertCount }: Props) {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-brand">
          <span className="top-nav-logo">RepuTrack</span>
          <span className="top-nav-demo-badge">Live Demo · Kai's Auto Repair</span>
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
