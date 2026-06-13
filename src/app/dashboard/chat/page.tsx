'use client'
// Nexora AI — Chat Page

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import { useChatStore } from '@/store/chatStore'
import TemporaryBanner from '@/components/TemporaryBanner'

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params?.sessionId
  const { isTemporaryMode } = useChatStore()

  return (
    <div className="flex flex-col h-full">
      {/* Temporary mode banner */}
      {isTemporaryMode && <TemporaryBanner />}

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow sessionId={sessionId} />
      </div>

      {/* Input area */}
      <div className="border-t border-nexora px-4 py-4"
           style={{ borderColor: 'var(--border-subtle)' }}>
        <ChatInput />
      </div>
    </div>
  )
}
