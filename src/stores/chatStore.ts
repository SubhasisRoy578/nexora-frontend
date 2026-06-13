// src/stores/chatStore.ts
import { create } from 'zustand'
import { streamChat } from '../lib/api'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  tools?: string[]
  timestamp: Date
  sessionId?: string  // Added for session tracking
}

interface ChatStore {
  // State
  messages: Message[]
  loading: boolean
  error: string | null
  isTemporaryMode: boolean  // ← ADDED
  currentSessionId: string | null  // ← ADDED
  
  // Actions
  sendMessage: (text: string, tools: string[]) => Promise<void>
  clear: () => void
  setError: (e: string | null) => void
  setIsTemporaryMode: (value: boolean) => void  // ← ADDED
  setCurrentSessionId: (id: string | null) => void  // ← ADDED
  loadSession: (sessionId: string) => Promise<void>  // ← ADDED for persistence
}

let msgId = 0
const genId = () => `msg_${++msgId}`

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  loading: false,
  error: null,
  isTemporaryMode: false,  // ← INITIALIZED
  currentSessionId: null,  // ← INITIALIZED

  // Send message with streaming
  sendMessage: async (text: string, tools: string[]) => {
    const { currentSessionId } = get()
    
    set({ loading: true, error: null })
    
    // Add user message
    set((s) => ({
      messages: [...s.messages, {
        id: genId(),
        type: 'user',
        content: text,
        timestamp: new Date(),
        sessionId: currentSessionId || undefined,
      }],
    }))

    try {
      let aiResponse = ''
      const aiMsgId = genId()
      const aiMsg = { 
        id: aiMsgId, 
        type: 'ai' as const, 
        content: '', 
        tools, 
        timestamp: new Date(),
        sessionId: currentSessionId || undefined,
      }
      set((s) => ({ messages: [...s.messages, aiMsg] }))

      // Stream AI response
      for await (const chunk of streamChat(text, tools)) {
        aiResponse += chunk
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === aiMsgId ? { ...m, content: aiResponse } : m
          ),
        }))
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error'
      set({ error: errMsg })
    } finally {
      set({ loading: false })
    }
  },

  // Clear all messages
  clear: () => set({ 
    messages: [], 
    error: null, 
    loading: false,
    currentSessionId: null,
    isTemporaryMode: false,
  }),
  
  // Set error message
  setError: (error) => set({ error }),
  
  // Set temporary mode (for guest/unauthenticated users)
  setIsTemporaryMode: (value: boolean) => set({ isTemporaryMode: value }),
  
  // Set current session ID
  setCurrentSessionId: (id: string | null) => set({ currentSessionId: id }),
  
  // Load previous session messages (from backend)
  loadSession: async (sessionId: string) => {
    set({ loading: true, error: null, currentSessionId: sessionId })
    try {
      // Fetch messages from backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) throw new Error('Failed to load session')
      
      const data = await response.json()
      const loadedMessages: Message[] = data.messages.map((msg: any, index: number) => ({
        id: genId(),
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        tools: msg.tools || [],
        timestamp: new Date(msg.timestamp || Date.now()),
        sessionId: sessionId,
      }))
      
      set({ messages: loadedMessages, loading: false })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to load session'
      set({ error: errMsg, loading: false })
    }
  },
}))
