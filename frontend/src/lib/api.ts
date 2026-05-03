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

interface StreamHandlers {
  onThinkingStart?: () => void
  onThinkingDelta?: (text: string) => void
  onResponseStart?: () => void
  onResponseDelta?: (text: string) => void
  onDone?: () => void
  onError?: (msg: string) => void
}

async function streamPost(
  path: string,
  body: unknown,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const msg = res.status === 429
      ? 'Too many requests — please wait a few minutes.'
      : res.status === 400
      ? 'Invalid request.'
      : 'Something went wrong. Please try again.'
    handlers.onError?.(msg)
    return
  }

  if (!res.body) { handlers.onError?.('No response from server.'); return }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''
    for (const block of blocks) {
      const lines = block.trim().split('\n')
      const eventLine = lines.find((l) => l.startsWith('event:'))
      const dataLine = lines.find((l) => l.startsWith('data:'))
      if (!eventLine) continue
      const event = eventLine.slice(7).trim()
      const data = dataLine ? dataLine.slice(5).trim() : ''
      if (event === 'thinking_start') handlers.onThinkingStart?.()
      else if (event === 'thinking_delta') handlers.onThinkingDelta?.(JSON.parse(data))
      else if (event === 'response_start') handlers.onResponseStart?.()
      else if (event === 'response_delta') handlers.onResponseDelta?.(JSON.parse(data))
      else if (event === 'done') { handlers.onDone?.(); return }
      else if (event === 'error') { handlers.onError?.(data ? JSON.parse(data) : 'Error'); return }
    }
  }
}

export const api = {
  meta: () => get('/api/meta'),
  reviews: {
    list: () => get('/api/reviews'),
    stats: () => get('/api/reviews/stats'),
    respond: (id: string) => patch(`/api/reviews/${id}/respond`),
    generateResponse: (
      id: string,
      tone: string,
      handlers: StreamHandlers,
      signal?: AbortSignal
    ) => streamPost(`/api/reviews/${id}/generate-response`, { tone }, handlers, signal),
  },
  followups: {
    list: () => get('/api/followups'),
    send: (data: Record<string, string>) => post('/api/followups', data),
  },
}
