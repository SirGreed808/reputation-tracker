const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002'

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Request failed')
  }
  return res.json()
}

async function patch(path: string) {
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Request failed')
  return res.json()
}

export const api = {
  meta: () => get('/api/meta'),
  reviews: {
    list: () => get('/api/reviews'),
    stats: () => get('/api/reviews/stats'),
    respond: (id: string) => patch(`/api/reviews/${id}/respond`),
  },
  followups: {
    list: () => get('/api/followups'),
    send: (data: Record<string, string>) => post('/api/followups', data),
  },
}
