import { useEffect, useState } from 'react'
import { useKnowledgeStore } from '../stores/knowledgeStore'

export default function KnowledgeView() {
  const { docs, loading, uploading, error, setError, fetchDocs, upload } = useKnowledgeStore()
  const [dragOver, setDragOver] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    try {
      setError(null)
      await upload(file)
      await fetchDocs()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return
    try {
      setError(null)
      await upload(file)
      await fetchDocs()
    } catch (err) {
      console.error(err)
    }
  }

  const STATS = [
    { label: 'Documents', value: docs.length },
    { label: 'Chunks', value: docs.reduce((sum, d) => sum + d.chunks, 0) + 'K' },
    { label: 'Avg Recall', value: '94%' },
  ]

  return (
    <div className="knowledge-view">
      <div className="dash-header">
        <div className="dash-title">Knowledge Base</div>
        <div className="dash-sub">Upload, index, and semantically search your documents</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {STATS.map((s) => (
          <div key={s.label} className="metric-card">
            <div className="metric-label">{s.label}</div>
            <div className="metric-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="kb-search-bar">
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            className="nx-input"
            placeholder="Semantic search across all documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-ghost)', fontSize: '13px' }}>
            ⌕
          </span>
        </div>
        <button className="btn btn-primary">Search</button>
      </div>

      <div
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent-cyan)' : 'var(--border-dim)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          textAlign: 'center',
          marginBottom: '20px',
          background: dragOver ? 'var(--accent-cyan-glow)' : 'transparent',
          transition: 'all 0.15s',
          cursor: 'pointer',
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>↑</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Drop files here or{' '}
          <label style={{ color: 'var(--accent-cyan)', cursor: 'pointer' }}>
            browse
            <input
              type="file"
              hidden
              onChange={handleFileSelect}
              accept=".pdf,.docx,.md,.txt,.csv,.html,.pptx"
            />
          </label>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>
          PDF · DOCX · MD · TXT · CSV · HTML · PPTX · up to 50MB
        </div>
      </div>

      {uploading && <div style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>📤 Uploading...</div>}
      {error && (
        <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '11px' }}>
          {error}
        </div>
      )}

      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div className="section-title">Indexed Documents</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading documents...</div>
      ) : (
        <div className="kb-grid">
          {docs.map((d) => (
            <div key={d.id} className="doc-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="doc-icon">{d.icon}</div>
                <span className="badge badge-rag">{d.type}</span>
              </div>
              <div className="doc-name">{d.name}</div>
              <div className="doc-meta">{d.size} · {d.date}</div>
              <div className="doc-status">
                <span className="dot dot-green" />
                {d.status}
              </div>
              <div className="doc-chunk" style={{ marginTop: '6px' }}>{d.chunks} chunks indexed</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}