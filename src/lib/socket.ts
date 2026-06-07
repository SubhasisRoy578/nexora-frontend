export function connectAgentSocket(onEvent: (e: AgentEvent) => void) {
  const ws = new WebSocket(`ws://localhost:8000/ws/agent-activity`)
  ws.onmessage = (msg) => {
    const event = JSON.parse(msg.data)  // { agent, status, pct, step }
    onEvent(event)
  }
  return ws
}