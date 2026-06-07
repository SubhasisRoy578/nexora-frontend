import { useEffect, useState } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'
import { connectAgentSocket } from '../lib/api'

export default function RightPanel() {
  const { agents, tasks, setAgentStatus } = useDashboardStore()
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = connectAgentSocket(
      (data) => {
        // data = { agent: 'Research', status: 'running', pct: 74, step: '...' }
        setAgentStatus(data.agent, data.status, data.step)
      },
      (err) => console.error('Socket error:', err)
    )
    setWs(socket)
    return () => socket?.close()
  }, [setAgentStatus])

  const runningAgents = agents.filter((a) => a.status === 'running')
  const runningTasks = tasks.filter((t) => t.status === 'running').slice(0, 3)
  const notifs = [
    { text: 'Knowledge base updated — 3 new docs indexed', time: '2m ago', color: 'var(--accent-emerald)' },
    { text: 'Research agent found 12 relevant sources', time: '4m ago', color: 'var(--accent-cyan)' },
    { text: 'Code review completed — 2 suggestions', time: '8m ago', color: 'var(--accent-purple)' },
  ]

  return (
    <div className="right-panel">
      <div className="rp-header">
        <span className="rp-title">Agent Activity</span>
        <span className="badge badge-live rp-live">
          <span className="dot dot-red" />
          LIVE
        </span>
      </div>
      <div className="rp-body">
        <div className="section-label" style={{ marginBottom: '6px' }}>Running agents ({runningAgents.length})</div>
        {runningAgents.length > 0 ? (
          runningAgents.map((a) => (
            <div key={a.id} className="agent-row">
              <div className="agent-row-header">
                <span className="agent-name">{a.label}</span>
                <span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span>
              </div>
              <div className="agent-detail">
                <span>{a.currentTask || 'Processing...'}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0' }}>No running agents</div>
        )}

        <div className="section-label" style={{ marginTop: '4px', marginBottom: '6px' }}>Running tasks ({runningTasks.length})</div>
        <div className="nx-card" style={{ padding: '8px 12px' }}>
          {runningTasks.length > 0 ? (
            runningTasks.map((t) => (
              <div key={t.id} className="task-item">
                <div className="task-name">{t.title}</div>
                <div className="task-step">{t.durationMs ? `${t.durationMs}ms` : 'Running...'}</div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No running tasks</div>
          )}
        </div>

        <div className="section-label" style={{ marginTop: '4px', marginBottom: '6px' }}>Notifications</div>
        <div className="nx-card" style={{ padding: '8px 12px' }}>
          {notifs.map((n, i) => (
            <div key={i} className="notif-item">
              <div className="notif-dot" style={{ background: n.color, boxShadow: `0 0 5px ${n.color}` }} />
              <div>
                <div className="notif-text">{n.text}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rp-stats">
        <div className="rp-stat">
          <div className="rp-stat-val">{runningAgents.length}</div>
          <div className="rp-stat-lbl">Active</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat-val">{runningTasks.length}</div>
          <div className="rp-stat-lbl">Tasks</div>
        </div>
        <div className="rp-stat">
          <div className="rp-stat-val cyan">98%</div>
          <div className="rp-stat-lbl">Uptime</div>
        </div>
      </div>
    </div>
  )
}