import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Reviews from './pages/Reviews'
import Followups from './pages/Followups'
import './index.css'

function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="ambient-orb ambient-orb-4" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AmbientBackground />
      <div className="app-shell">
        <TopNav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/followups" element={<Followups />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
