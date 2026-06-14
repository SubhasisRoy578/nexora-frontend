'use client'
// Nexora AI — Chat Page

import { useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import { useChatStore } from '@/stores/chatStore'
import { uploadDocument, streamChat } from '@/lib/api'

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>()
  const sessionId = params?.sessionId
  const { user } = useUser()
  const { getToken } = useAuth()
  const { addMessage, updateMessage, messages, isStreaming, setIsStreaming, setCurrentSessionId } = useChatStore()
  const [isUploading, setIsUploading] = useState(false)

  // Set session ID when available
  useState(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId)
    }
  })

  const handleSend = useCallback(async (text: string, files: File[]) => {
    if (isStreaming) return
    
    const token = await getToken()
    let fileContext = ''
    
    // Upload files if any
    if (files.length > 0) {
      setIsUploading(true)
      try {
        const uploads = await Promise.all(
          files.map(async (file) => {
            const result = await uploadDocument(file, token)
            return `[Uploaded: ${result.name || file.name}]`
          })
        )
        fileContext = uploads.join(' ')
        toast.success(`${files.length} file(s) uploaded successfully`)
      } catch (err) {
        console.error('Upload error:', err)
        toast.error('File upload failed')
      } finally {
        setIsUploading(false)
      }
    }
    
    const fullMessage = fileContext ? `${fileContext}\n\n${text}` : text
    if (!fullMessage.trim() && files.length === 0) return
    
    // Add user message
    const userMsgId = addMessage({
      type: 'user',
      content: fullMessage || (files.length ? `[Uploaded ${files.length} file(s)]` : ''),
    })
    
    // Add assistant placeholder
    const assistantId = addMessage({
      type: 'ai',
      content: '',
      isStreaming: true,
    })
    
    let buffer = ''
    const tools = ['rag'] // Default RAG tool for knowledge base
    
    try {
      for await (const chunk of streamChat(fullMessage, tools, token)) {
        buffer += chunk
        updateMessage(assistantId, { content: buffer, isStreaming: true })
      }
      updateMessage(assistantId, { content: buffer || 'Done.', isStreaming: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Stream error'
      updateMessage(assistantId, { content: `Error: ${errorMsg}`, isStreaming: false, error: true })
      toast.error(`Error: ${errorMsg}`)
    }
  }, [isStreaming, getToken, addMessage, updateMessage])

  // Get recent messages for this session
  const sessionMessages = messages.filter(m => m.sessionId === sessionId || !m.sessionId)

  return (
    <div className="flex flex-col h-full">
      {/* Uploading indicator */}
      {isUploading && (
        <div className="fixed bottom-24 right-6 bg-gray-800 rounded-lg px-4 py-2 text-sm z-50">
          📤 Uploading files...
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow 
          sessionId={sessionId} 
          messages={sessionMessages}
          isStreaming={isStreaming}
        />
      </div>

      {/* Input area */}
      <div className="border-t border-nexora px-4 py-4"
           style={{ borderColor: 'var(--border-subtle)' }}>
        <ChatInput onSend={handleSend} disabled={isStreaming || isUploading} />
      </div>
    </div>
  )
}
