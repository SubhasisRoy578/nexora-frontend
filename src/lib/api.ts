// src/lib/api.ts
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000'

const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
})

// ──── CHAT (Streaming) ────
export async function* streamChat(
  message: string,
  tools: string[],
  token?: string
) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ message, tools }),
  })

  if (!res.ok) throw new Error(`Chat error: ${res.status}`)

  const reader = res.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break
    yield decoder.decode(value)
  }
}

// ──── UPLOAD ────
export const uploadDocument = async (file: File, token?: string) => {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token || ''}` },
    body: form,
  })

  if (!res.ok) throw new Error(`Upload error: ${res.status}`)
  return res.json()
}

// ──── AGENTS ────
export const getAgents = async (token?: string) => {
  const res = await fetch(`${BASE}/api/agents`, {
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error(`Agents error: ${res.status}`)
  return res.json()
}

export const runAgent = async (
  agentId: string,
  task: string,
  token?: string
) => {
  const res = await fetch(`${BASE}/api/agents/run`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ agent_id: agentId, task }),
  })
  if (!res.ok) throw new Error(`Run agent error: ${res.status}`)
  return res.json()
}

// ──── KNOWLEDGE ────
export const getKnowledge = async (token?: string) => {
  const res = await fetch(`${BASE}/api/knowledge`, {
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error(`Knowledge error: ${res.status}`)
  return res.json()
}

export const deleteDoc = async (docId: string, token?: string) => {
  const res = await fetch(`${BASE}/api/knowledge/${docId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error(`Delete error: ${res.status}`)
  return res.json()
}

// ──── ANALYTICS ────
export const getAnalytics = async (token?: string) => {
  const res = await fetch(`${BASE}/api/analytics`, {
    headers: getHeaders(token),
  })
  if (!res.ok) throw new Error(`Analytics error: ${res.status}`)
  return res.json()
}

// ──── WEBSOCKET (Agent Activity) ────
export const connectAgentSocket = (
  onMessage: (data: any) => void,
  onError?: (e: Event) => void
) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = process.env.REACT_APP_API_URL || 'localhost:8000'
  const ws = new WebSocket(`${protocol}://${host}/ws/agent-activity`)

  ws.onopen = () => console.log('🟢 Agent socket connected')
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data))
    } catch (err) {
      console.error('Socket message parse error:', err)
    }
  }
  ws.onerror = (e) => {
    console.error('🔴 Socket error:', e)
    onError?.(e)
  }
  ws.onclose = () => console.log('🟡 Agent socket closed')

  return ws
}