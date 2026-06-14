'use client'

import { useCallback, useState } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import { useChatStore } from '@/stores/chatStore'
import { streamChat, uploadDocument } from '@/lib/api'

export default function ChatPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const { addMessage, updateMessage } = useChatStore()
  const [isStreaming, setIsStreaming] = useState(false)

  const handleSend = useCallback(async (text: string, files: File[]) => {
    if (isStreaming) return
    setIsStreaming(true)

    const token = await getToken()

    // Upload files
    let fileContext = ''
    if (files.length) {
      try {
        const uploads = await Promise.all(files.map(f => uploadDocument(f, token)))
        fileContext = uploads.map(u => `[Uploaded: ${u.name}]`).join(' ')
        toast.success(`${files.length} file(s) uploaded`)
      } catch (err) {
        toast.error('Upload failed')
      }
    }

    const fullMessage = fileContext ? `${fileContext}\n${text}` : text

    // Add user message - using 'type' instead of 'role' to match chatStore
    addMessage({ type: 'user', content: fullMessage })

    // Add assistant placeholder
    const assistantId = Date.now().toString()
    addMessage({ 
      id: assistantId, 
      type: 'ai',           // ← Changed from 'assistant' to 'ai' to match chatStore
      content: '', 
      isStreaming: true 
    })

    let buffer = ''
    try {
      for await (const chunk of streamChat(fullMessage, ['rag'], token)) {
        buffer += chunk
        updateMessage(assistantId, { content: buffer, isStreaming: true })
      }
      updateMessage(assistantId, { content: buffer || 'Done.', isStreaming: false })
    } catch (err) {
      updateMessage(assistantId, { content: 'Error processing request', isStreaming: false, error: true })
      toast.error('Failed to get response')
    } finally {
      setIsStreaming(false)
    }
  }, [isStreaming, getToken, addMessage, updateMessage])

  return (
    <WorkspaceLayout>
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChatWindow />
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </section>
    </WorkspaceLayout>
  )
}
