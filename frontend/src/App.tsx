import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Reviews from './pages/Reviews'
import Followups from './pages/Followups'
import { api } from './lib/api'
import './index.css'

function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="ambient-orb ambient-orb-4" />
      <div className="ambient-orb ambient-orb-5" />
    </div>
  )
}

export default function App() {
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    api.reviews.stats().then(s => setAlertCount(s.unansweredAlerts))
  }, [])

  return (
    <BrowserRouter>
      <AmbientBackground />
      <div className="app-shell">
        <TopNav alertCount={alertCount} />
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
