'use client'
import { useEffect, useRef } from 'react'
import { useChatStore, Message } from '@/store/chatStore'

const TYPE_TAG: Record<string, { label: string; icon: string; bg: string; color: string; border: string }> = {
  agent: { label: 'AGENT',    icon: 'ti-robot',    bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.22)' },
  rag:   { label: 'RAG',      icon: 'ti-database', bg: 'rgba(6,182,212,0.10)',  color: '#22d3ee', border: 'rgba(6,182,212,0.20)' },
  code:  { label: 'CODE',     icon: 'ti-code',     bg: 'rgba(16,185,129,0.10)', color: '#34d399', border: 'rgba(16,185,129,0.20)' },
  web:   { label: 'WEB',      icon: 'ti-world',    bg: 'rgba(59,130,246,0.10)', color: '#60a5fa', border: 'rgba(59,130,246,0.20)' },
}

export default function ChatWindow() {
  const { messages, isTyping } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      style={{
        flex: 1, overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        background: 'var(--nx-bg)',
      }}
    >
      {/* Context badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <span style={{
          fontSize: 9, fontFamily: 'var(--nx-mono)',
          color: 'var(--nx-text-muted)',
          background: 'rgba(255,255,255,0.03)',
          padding: '3px 10px', borderRadius: 20,
          border: '1px solid var(--nx-border)',
        }}>
          Research workspace · RAG + Web Search enabled
        </span>
      </div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <div style={{
      display: 'flex', gap: 10,
      maxWidth: '88%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      <div style={{
        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, marginTop: 2,
        background: isUser
          ? 'rgba(255,255,255,0.07)'
          : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: isUser ? 'var(--nx-text-muted)' : '#fff',
      }}>
        {isUser
          ? <i className="ti ti-user" style={{ fontSize: 12 }} aria-hidden="true" />
          : 'N'}
      </div>

      {/* Content */}
      <div>
        {/* Tags */}
        {msg.tags && msg.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
            {msg.tags.map(tag => {
              const t = TYPE_TAG[tag]
              if (!t) return null
              return (
                <span key={tag} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 9, fontFamily: 'var(--nx-mono)',
                  padding: '2px 7px', borderRadius: 4,
                  background: t.bg, color: t.color, border: `1px solid ${t.border}`,
                }}>
                  <i className={`ti ${t.icon}`} style={{ fontSize: 9 }} aria-hidden="true" />
                  {t.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: '9px 13px', borderRadius: 10, fontSize: 12,
          lineHeight: 1.65, maxWidth: '100%',
          background: isUser ? 'rgba(59,130,246,0.12)' : 'var(--nx-card)',
          border: isUser
            ? '1px solid rgba(59,130,246,0.22)'
            : '1px solid var(--nx-border)',
          color: 'var(--nx-text)',
          borderTopRightRadius: isUser ? 3 : 10,
          borderTopLeftRadius: isUser ? 10 : 3,
        }}>
          {msg.content}
        </div>

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
            {msg.sources.map(s => (
              <span key={s} style={{
                fontSize: 9, fontFamily: 'var(--nx-mono)',
                padding: '2px 7px', borderRadius: 4,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--nx-border)',
                color: 'var(--nx-text-muted)', cursor: 'pointer',
              }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Model badge */}
        {!isUser && msg.model && (
          <span style={{
            display: 'inline-block', marginTop: 4,
            fontSize: 9, fontFamily: 'var(--nx-mono)',
            padding: '1px 5px', borderRadius: 3,
            background: 'rgba(139,92,246,0.10)',
            border: '1px solid rgba(139,92,246,0.18)',
            color: '#a78bfa',
          }}>
            {msg.model} · {msg.latency}
          </span>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: '88%' }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6, flexShrink: 0, marginTop: 2,
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color: '#fff',
      }}>N</div>
      <div style={{
        padding: '10px 14px', borderRadius: 10, borderTopLeftRadius: 3,
        background: 'var(--nx-card)', border: '1px solid var(--nx-border)',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--nx-text-muted)',
            display: 'inline-block',
            animation: `nx-pulse 1.2s ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}