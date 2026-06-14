'use client'
import { useRef, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'

const TOOLS = [
  { id: 'rag',    icon: 'ti-database',    label: 'RAG',    defaultOn: true },
  { id: 'web',    icon: 'ti-world',       label: 'Search', defaultOn: true },
  { id: 'code',   icon: 'ti-code',        label: 'Code',   defaultOn: false },
  { id: 'agent',  icon: 'ti-robot',       label: 'Agent',  defaultOn: false },
  { id: 'upload', icon: 'ti-file-upload', label: 'Upload', defaultOn: false },
]

export default function ChatInput() {
  const { sendMessage, loading } = useChatStore()  // ← Changed isTyping to loading
  const [value, setValue] = useState('')
  const [activeTools, setActiveTools] = useState<Set<string>>(
    new Set(TOOLS.filter(t => t.defaultOn).map(t => t.id))
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggleTool(id: string) {
    if (id === 'upload') { fileInputRef.current?.click(); return }
    setActiveTools(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSend() {
    if (!value.trim() || loading) return  // ← Changed isTyping to loading
    sendMessage(value.trim(), Array.from(activeTools))
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  return (
    <div style={{
      padding: '12px 16px 14px',
      background: 'var(--nx-bg)',
      borderTop: '1px solid var(--nx-border)',
    }}>
      {/* Tool chips */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
        {TOOLS.map(tool => {
          const on = activeTools.has(tool.id)
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              aria-pressed={on}
              style={{
                height: 22, padding: '0 8px', borderRadius: 4, cursor: 'pointer',
                background: on ? 'rgba(59,130,246,0.10)' : 'rgba(255,255,255,0.04)',
                border: on ? '1px solid rgba(59,130,246,0.28)' : '1px solid var(--nx-border)',
                color: on ? 'var(--nx-accent)' : 'var(--nx-text-muted)',
                fontSize: 10, fontFamily: 'var(--nx-mono)',
                display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.13s',
              }}
            >
              <i className={`ti ${tool.icon}`} style={{ fontSize: 10 }} aria-hidden="true" />
              {tool.label}
            </button>
          )
        })}
      </div>

      {/* Input box */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        background: 'var(--nx-card)',
        border: '1px solid var(--nx-border)',
        borderRadius: 10, padding: '8px 10px',
        transition: 'border-color 0.15s',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.40)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--nx-border)')}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => { setValue(e.target.value); handleInput() }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, launch an agent, or upload a document…"
          rows={1}
          aria-label="Chat input"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--nx-text)', fontFamily: 'var(--nx-display)',
            fontSize: 12, resize: 'none', lineHeight: 1.55,
            maxHeight: 120, paddingTop: 2,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || loading}
          aria-label="Send message"
          style={{
            width: 30, height: 30, borderRadius: 7, border: 'none',
            background: value.trim() && !loading ? 'var(--nx-accent)' : 'rgba(59,130,246,0.25)',
            color: '#fff', cursor: value.trim() && !loading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          <i className="ti ti-arrow-up" style={{ fontSize: 14 }} aria-hidden="true" />
        </button>
      </div>

      <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".pdf,.txt,.md,.docx" />
    </div>
  )
}
