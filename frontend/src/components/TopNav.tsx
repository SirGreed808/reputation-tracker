import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Follow-ups', to: '/followups' },
]

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-brand">
          <span className="top-nav-logo">RepuTrack</span>
          <span className="top-nav-demo-badge">Live Demo · Acme Auto Repair</span>
        </div>
        <nav className="top-nav-links">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
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
