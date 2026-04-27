import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { FollowupRequest } from '../types'

const channels = [
  { id: 'email', label: 'Email', desc: 'Real email sent via Resend' },
  { id: 'sms', label: 'SMS', desc: 'Simulated — shows preview only' },
  { id: 'qr', label: 'QR Code', desc: 'Download printable card' },
] as const

export default function Followups() {
  const [requests, setRequests] = useState<FollowupRequest[]>([])
  const [channel, setChannel] = useState<'email' | 'sms' | 'qr'>('email')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'qr'; message: string; qrDataUrl?: string } | null>(null)
  const [smsPreview, setSmsPreview] = useState<string | null>(null)

  useEffect(() => {
    api.followups.list().then(setRequests)
  }, [])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSending(true)
    setResult(null)
    setSmsPreview(null)

    try {
      if (channel === 'sms') {
        const msg = `Hi ${name}! Thanks for choosing Kai's Auto Repair. We'd love your feedback — it only takes a minute: https://g.page/r/demo-review-link`
        setSmsPreview(msg)
        setSending(false)
        return
      }

      const data = await api.followups.send({ customer_name: name, customer_email: email, customer_phone: phone, channel })
      setRequests(prev => [data, ...prev])

      if (channel === 'qr' && data.qrDataUrl) {
        setResult({ type: 'qr', message: 'QR code ready — download and print for your checkout counter.', qrDataUrl: data.qrDataUrl })
      } else {
        setResult({ type: 'success', message: 'Email sent successfully.' })
      }
      setName(''); setEmail(''); setPhone('')
    } catch (err: any) {
      setResult({ type: 'success', message: `Error: ${err.message}` })
    } finally {
      setSending(false)
    }
  }

  async function logSms() {
    const data = await api.followups.send({ customer_name: name, customer_phone: phone, channel: 'sms' })
    setRequests(prev => [data, ...prev])
    setSmsPreview(null)
    setResult({ type: 'success', message: 'SMS logged as simulated.' })
    setName(''); setPhone('')
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Follow-up Requests</h1>
          <p className="page-subtitle">Send review requests to recent customers</p>
        </div>
      </div>

      <div className="followup-grid">
        <div className="card">
          <div className="card-header">New Request</div>
          <div className="card-body">
            <div className="channel-tabs">
              {channels.map(ch => (
                <button
                  key={ch.id}
                  className={`channel-tab${channel === ch.id ? ' active' : ''}`}
                  onClick={() => { setChannel(ch.id); setResult(null); setSmsPreview(null) }}
                  type="button"
                >
                  <span className="channel-tab-label">{ch.label}</span>
                  <span className="channel-tab-desc">{ch.desc}</span>
                </button>
              ))}
            </div>

            {channel === 'sms' && (
              <div className="alert alert-info" style={{ marginBottom: 16, fontSize: '0.82rem' }}>
                Demo: SMS is simulated. In production this sends via Twilio.
              </div>
            )}

            <form onSubmit={send}>
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
              </div>
              {channel === 'email' && (
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              )}
              {(channel === 'sms' || channel === 'qr') && (
                <div className="form-group">
                  <label className="form-label">Phone {channel === 'sms' ? '*' : '(optional)'}</label>
                  <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required={channel === 'sms'} />
                </div>
              )}
              <button className="btn btn-primary btn-full" type="submit" disabled={sending}>
                {sending ? 'Sending…' : channel === 'qr' ? 'Generate QR Code' : channel === 'sms' ? 'Preview SMS' : 'Send Email'}
              </button>
            </form>

            {smsPreview && (
              <div className="sms-preview">
                <div className="sms-preview-header">SMS Preview <span className="simulated-tag">SIMULATED</span></div>
                <div className="sms-preview-to">To: {phone || '(no phone)'}</div>
                <div className="sms-preview-bubble">{smsPreview}</div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={logSms}>
                  Log as sent
                </button>
              </div>
            )}

            {result && (
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                {result.message}
                {result.qrDataUrl && (
                  <div style={{ marginTop: 12 }}>
                    <img src={result.qrDataUrl} alt="Review QR Code" style={{ width: 150, display: 'block', marginBottom: 8, border: '1px solid var(--border)', borderRadius: 4 }} />
                    <a href={result.qrDataUrl} download="review-qr.png" className="btn btn-primary btn-sm">Download PNG</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Sent ({requests.length})</div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {requests.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-desc">No requests sent yet.</div>
              </div>
            ) : requests.map(r => (
              <div key={r.id} className="request-item">
                <div className="request-name">{r.customer_name}</div>
                <div className="request-meta">
                  <span className={`channel-badge channel-${r.channel}`}>{r.channel.toUpperCase()}</span>
                  {r.status === 'simulated' && <span className="simulated-tag">SIMULATED</span>}
                  <span className="request-date" style={{ marginLeft: 'auto' }}>{new Date(r.sent_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
