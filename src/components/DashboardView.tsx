import { useEffect } from 'react'
import { useAnalyticsStore } from '../stores/analyticsStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { View } from '../App'

const METRICS_MAP = [
  { key: 'avg_response', label: 'Avg Response' },
  { key: 'success_rate', label: 'Success Rate' },
  { key: 'tasks_today', label: 'Tasks Today' },
  { key: 'tokens_used', label: 'Tokens Used' },
]

export default function DashboardView({ setActiveView }: { setActiveView: (v: View) => void }) {
  const { metrics, loading, fetch } = useAnalyticsStore()
  const { agents } = useDashboardStore()

  useEffect(() => {
    fetch()
  }, [fetch])

  const PODS = [
    { name: 'Research Agent', status: 'running', detail: 'Crawling sources', pct: 73 },
    { name: 'RAG Agent', status: 'running', detail: 'Embedding docs', pct: 92 },
    { name: 'Code Agent', status: 'idle', detail: 'Awaiting task', pct: 0 },
    { name: 'Browser Agent', status: 'queued', detail: 'In queue · #2', pct: 0 },
  ]

  const TASKS = [
    { name: 'Competitor price scrape', agent: 'Research', step: 'Step 3/5 · Parsing results', status: 'running' },
    { name: 'Embed: market_2024.pdf', agent: 'RAG', step: 'Chunking · 847 / 923 tokens', status: 'running' },
    { name: 'Web scrape: G2 reviews', agent: 'Browser', step: 'Queued', status: 'queued' },
  ]

  const MODELS = [
    { name: 'Claude Sonnet', pct: 52, color: 'var(--accent-purple)', tokens: '2.4M' },
    { name: 'Groq Llama', pct: 28, color: 'var(--accent-cyan)', tokens: '1.3M' },
    { name: 'Gemini Flash', pct: 12, color: 'var(--accent-emerald)', tokens: '560K' },
    { name: 'GPT-4o mini', pct: 8, color: 'var(--accent-amber)', tokens: '370K' },
  ]

  return (
    <div className="dash-view">
      <div className="dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div className="dash-title">Dashboard</div>
          <span className="badge badge-live">
            <span className="dot dot-red" />
            LIVE
          </span>
        </div>
        <div className="dash-sub">Agent fleet & analytics · {loading ? 'Loading...' : 'Updated now'}</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading metrics...</div>
      ) : metrics ? (
        <>
          <div className="metrics-row">
            {METRICS_MAP.map((m) => (
              <div key={m.key} className="metric-card">
                <div className="metric-label">{m.label}</div>
                <div className="metric-value">
                  {metrics[m.key as keyof typeof metrics]}
                </div>
              </div>
            ))}
          </div>

          <div className="section-header">
            <div className="section-title">Agent Pods</div>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setActiveView('agents')}>
              Manage agents →
            </button>
          </div>
          <div className="agent-pods">
            {PODS.map((p) => (
              <div key={p.name} className="agent-pod">
                <div className="agent-pod-header">
                  <span className="agent-pod-name">{p.name}</span>
                  <span className={`badge badge-${p.status}`}>{p.status.toUpperCase()}</span>
                </div>
                {p.pct > 0 ? (
                  <div className="prog-bar" style={{ marginBottom: '6px' }}>
                    <div className="prog-bar-fill" style={{ width: `${p.pct}%` }} />
                  </div>
                ) : (
                  <div style={{ height: '8px' }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.detail}</span>
                  {p.pct > 0 && <span style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{p.pct}%</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="task-feed" style={{ marginBottom: '16px' }}>
            <div className="task-feed-header">
              <span className="section-title">Task Feed</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                3 tasks · 2 running
              </span>
            </div>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Agent</th>
                  <th>Step</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {TASKS.map((t) => (
                  <tr key={t.name}>
                    <td className="task-name-cell">{t.name}</td>
                    <td>
                      <span className={`badge badge-${t.agent === 'RAG' ? 'rag' : 'agent'}`}>{t.agent}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.step}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{t.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-bottom">
            <div className="model-usage-card">
              <div className="section-title" style={{ marginBottom: '14px' }}>Model Usage</div>
              {MODELS.map((m) => (
                <div key={m.name} className="model-row">
                  <div className="model-row-name">{m.name}</div>
                  <div className="model-row-bar">
                    <div className="model-row-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '36px', textAlign: 'right' }}>
                    {m.tokens}
                  </div>
                  <div className="model-row-pct" style={{ color: m.color }}>{m.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data</div>
      )}
    </div>
  )
}