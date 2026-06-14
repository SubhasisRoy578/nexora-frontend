'use client'

import { useEffect, useRef } from 'react'
import { useChatStore } from '@/stores/chatStore'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  error?: boolean
  attachments?: Array<{ id: string; name: string; type: string; size: number }>
}

// ✅ ADDED: Props interface to accept sessionId
interface ChatWindowProps {
  sessionId?: string
}

export default function ChatWindow({ sessionId }: ChatWindowProps) {
  const { messages, isStreaming, loadSession, currentSessionId } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeMessages = useChatStore((s) => s.activeMessages?.() || messages) as Message[]
  const sessionLoadedRef = useRef(false)

  // ✅ ADDED: Load session when sessionId prop changes
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId && !sessionLoadedRef.current && loadSession) {
      sessionLoadedRef.current = true
      loadSession(sessionId)
    }
    
    return () => {
      if (sessionId !== currentSessionId) {
        sessionLoadedRef.current = false
      }
    }
  }, [sessionId, currentSessionId, loadSession])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, isStreaming])

  if (activeMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Nexora AI</h2>
          <p className="text-gray-400 text-sm">
            Upload documents and ask questions. Your AI agent will search through your knowledge base to provide accurate answers.
          </p>
          {sessionId && (
            <p className="text-xs text-gray-500 mt-4">
              Session ID: {sessionId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {activeMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.error
                  ? 'bg-red-900/50 text-red-300 border border-red-700'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.attachments && message.attachments.length > 0 && (
                <div className="text-xs mb-2 opacity-70">
                  📎 {message.attachments.map(a => a.name).join(', ')}
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {message.content || (message.isStreaming && '...')}
              </div>
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        {isStreaming && activeMessages[activeMessages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
