'use client'

import { useEffect, useRef } from 'react'
import { useChatStore, Message } from '@/stores/chatStore'

interface ChatWindowProps {
  sessionId?: string  // ← ADDED: Accept sessionId prop
}

const TYPE_TAG: Record<string, { label: string; icon: string; bg: string; color: string; border: string }> = {
  agent: { label: 'AGENT',    icon: 'ti-robot',    bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.22)' },
  rag:   { label: 'RAG',      icon: 'ti-database', bg: 'rgba(6,182,212,0.10)',  color: '#22d3ee', border: 'rgba(6,182,212,0.20)' },
  code:  { label: 'CODE',     icon: 'ti-code',     bg: 'rgba(16,185,129,0.10)', color: '#34d399', border: 'rgba(16,185,129,0.20)' },
  web:   { label: 'WEB',      icon: 'ti-world',    bg: 'rgba(59,130,246,0.10)', color: '#60a5fa', border: 'rgba(59,130,246,0.20)' },
}

export default function ChatWindow({ sessionId }: ChatWindowProps) {  // ← UPDATED: Accept prop
  const { messages, isTyping, loadSession, currentSessionId } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionLoadedRef = useRef(false)

  // Load session messages when sessionId changes
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId && !sessionLoadedRef.current) {
      sessionLoadedRef.current = true
      loadSession?.(sessionId)
    }
    
    // Reset flag when sessionId changes
    return () => {
      if (sessionId !== currentSessionId) {
        sessionLoadedRef.current = false
      }
    }
  }, [sessionId, currentSessionId, loadSession])

  // Auto-scroll to bottom
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
      {/* Session info badge - ENHANCED */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, gap: 8 }}>
        <span style={{
          fontSize: 9, fontFamily: 'var(--nx-mono)',
          color: 'var(--nx-text-muted)',
          background: 'rgba(255,255,255,0.03)',
          padding: '3px 10px', borderRadius: 20,
          border: '1px solid var(--nx-border)',
        }}>
          Research workspace · RAG + Web Search enabled
        </span>
        {sessionId && (
          <span style={{
            fontSize: 9, fontFamily: 'var(--nx-mono)',
            color: '#22d3ee',
            background: 'rgba(6,182,212,0.10)',
            padding: '3px 10px', borderRadius: 20,
            border: '1px solid rgba(6,182,212,0.20)',
          }}>
            Session: {sessionId.slice(0, 8)}...
          </span>
        )}
      </div>

      {/* Empty state - ENHANCED */}
      {messages.length === 0 && !isTyping && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '60%', gap: 12,
          color: 'var(--nx-text-muted)',
        }}>
          <i className="ti ti-message-2" style={{ fontSize: 48, opacity: 0.3 }} />
          <p style={{ fontSize: 13, textAlign: 'center' }}>
            {sessionId ? 'Continue your conversation below' : 'Start a new conversation'}
          </p>
        </div>
      )}

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
      <div style={{ maxWidth: 'calc(100% - 36px)' }}>
        {/* Tags */}
        {msg.tags && msg.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
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
          wordBreak: 'break-word',
        }}>
          {msg.content || (msg.role === 'assistant' && !msg.content ? '...' : msg.content)}
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
              }}
              onClick={() => window.open(s, '_blank')}
              >
                📎 {s.length > 30 ? s.slice(0, 30) + '...' : s}
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
            🤖 {msg.model} {msg.latency && `· ${msg.latency}`}
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
        <span style={{ fontSize: 11, color: 'var(--nx-text-muted)', marginRight: 4 }}>
          Nexora is thinking
        </span>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--nx-text-muted)',
            display: 'inline-block',
            animation: `nx-pulse 1.2s ${delay}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes nx-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
