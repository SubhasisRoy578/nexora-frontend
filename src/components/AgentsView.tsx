import { useEffect, useState } from 'react'
import { useAgentStore } from '../stores/agentStore'

const AGENT_ICONS = {
  research: '🔍',
  rag: '◈',
  code: '⌥',
  browser: '◻',
}

export default function AgentsView() {
  const { agents, loading, error, fetchAgents } = useAgentStore()
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const RUNS = [
    { agent: 'Research', task: 'Competitor price analysis', duration: '4m 12s', status: 'running', time: 'Now' },
    { agent: 'RAG', task: 'Embed market_2024.pdf', duration: '52s', status: 'running', time: '1m ago' },
    { agent: 'Code', task: 'Auth module security review', duration: '1m 8s', status: 'completed', time: '18m ago' },
  ]

  return (
    <div className="agents-view">
      <div className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="dash-title">Agents</div>
            <div className="dash-sub">Configure, monitor, and deploy autonomous AI agents</div>
          </div>
          <button className="btn btn-primary">+ Deploy new agent</button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '11px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading agents...</div>
      ) : (
        <>
          <div className="agents-grid">
            {agents.map((a) => (
              <div
                key={a.id}
                className={`agent-card${selected === a.id ? ' active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(selected === a.id ? null : a.id)}
              >
                <div className="agent-card-top">
                  <div
                    className="agent-icon"
                    style={{ background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}
                  >
                    {a.icon || AGENT_ICONS[a.id as keyof typeof AGENT_ICONS] || '◉'}
                  </div>
                  <span className={`badge badge-${a.status}`}>{a.status.toUpperCase()}</span>
                </div>
                <div className="agent-card-name">{a.name}</div>
                <div className="agent-card-stats">
                  <div className="agent-stat">
                    <div className="agent-stat-val">{a.tasks}</div>
                    <div className="agent-stat-lbl">Tasks run</div>
                  </div>
                  <div className="agent-stat">
                    <div className="agent-stat-val" style={{ color: 'var(--accent-cyan)' }}>{a.success}</div>
                    <div className="agent-stat-lbl">Success</div>
                  </div>
                </div>
                {selected === a.id && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '11px', flex: 1, justifyContent: 'center' }}>
                      Configure
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '11px', flex: 1, justifyContent: 'center' }}>
                      Run task
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="task-feed">
            <div className="task-feed-header">
              <span className="section-title">Agent Run History</span>
            </div>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Agent</th>
                  <th>Duration</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RUNS.map((r, i) => (
                  <tr key={i}>
                    <td className="task-name-cell">{r.task}</td>
                    <td>
                      <span className={`badge badge-${r.agent === 'RAG' ? 'rag' : 'agent'}`}>{r.agent}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{r.duration}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-ghost)' }}>{r.time}</td>
                    <td>
                      <span className={`badge badge-${r.status}`}>{r.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}