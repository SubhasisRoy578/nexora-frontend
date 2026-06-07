// src/stores/chatStore.ts
import { create } from 'zustand'
import { streamChat } from '../lib/api'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  tools?: string[]
  timestamp: Date
}

interface ChatStore {
  messages: Message[]
  loading: boolean
  error: string | null
  sendMessage: (text: string, tools: string[]) => Promise<void>
  clear: () => void
  setError: (e: string | null) => void
}

let msgId = 0
const genId = () => `msg_${++msgId}`

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loading: false,
  error: null,

  sendMessage: async (text: string, tools: string[]) => {
    set({ loading: true, error: null })
    set((s) => ({
      messages: [...s.messages, {
        id: genId(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      }],
    }))

    try {
      let aiResponse = ''
      const aiMsgId = genId()
      const aiMsg = { id: aiMsgId, type: 'ai' as const, content: '', tools, timestamp: new Date() }
      set((s) => ({ messages: [...s.messages, aiMsg] }))

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

  clear: () => set({ messages: [], error: null, loading: false }),
  setError: (error) => set({ error }),
}))