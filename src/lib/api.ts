// src/lib/api.ts - Add these exports at the end of the file

// Alias for uploadDocument to maintain compatibility
export const uploadFile = uploadDocument

// Export BASE for other files to use
export const API_BASE = BASE

// Add streaming chat with callback interface (for ChatLayout)
export async function streamChatWithCallback(params: {
  message: string
  tools: string[]
  token?: string
  onToken: (token: string) => void
  onDone: () => void
  onError: (err: string) => void
}) {
  const { message, tools, token, onToken, onDone, onError } = params

  try {
    for await (const chunk of streamChat(message, tools, token)) {
      onToken(chunk)
    }
    onDone()
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Stream error')
  }
}
