'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useChatStore } from '@/stores/chatStore';
import { streamChat } from '@/lib/api';  // ← Removed uploadFile
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

export default function ChatLayout() {
  const { user } = useUser();
  const {
    createSession, addMessage, updateMessage,
    provider, isStreaming, setIsStreaming, sidebarOpen,
  } = useChatStore();

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const activeMessages = useChatStore((s) => s.activeMessages());

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!activeSessionId) createSession();
  }, [activeSessionId, createSession]);

  const handleSend = useCallback(
    async (text: string, files: File[]) => {
      if (isStreaming) return;

      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = createSession();
      }

      const userId = user?.id ?? 'anonymous';

      let fileContext = '';
      if (files.length > 0) {
        // File upload temporarily disabled until uploadFile is implemented
        toast.error('File upload coming soon');
      }

      const fullMessage = fileContext ? `${fileContext}\n\n${text}` : text;

      addMessage(sessionId, {
        role: 'user',
        content: fullMessage,
        attachments: files.map((f) => ({
          id: Math.random().toString(36).slice(2),
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      });

      const assistantId = addMessage(sessionId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      setIsStreaming(true);

      const abort = new AbortController();
      abortRef.current = abort;

      let buffer = '';

      await streamChat({
        userId,
        message: fullMessage,
        provider,
        sessionId,
        signal: abort.signal,

        onToken: (token) => {
          buffer += token;
          updateMessage(sessionId!, assistantId, {
            content: buffer,
            isStreaming: true,
          });
        },

        onDone: (meta) => {
          updateMessage(sessionId!, assistantId, {
            content: buffer || 'Done.',
            isStreaming: false,
            agent: meta?.agent as never,
            provider: meta?.provider as never,
          });
          setIsStreaming(false);
        },

        onError: (err) => {
          updateMessage(sessionId!, assistantId, {
            content: '',
            isStreaming: false,
            error: true,
          });
          setIsStreaming(false);
          toast.error(`Error: ${err}`);
        },
      });
    },
    [
      isStreaming, activeSessionId, createSession,
      user, provider, addMessage, updateMessage, setIsStreaming,
    ]
  );

  const sessionTitle = activeMessages.find(m => m.role === 'user')?.content?.slice(0, 42) ?? 'Nexora AI';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: 13,
          },
        }}
      />

      <div className="relative flex-shrink-0" style={{ zIndex: 20 }}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-3.5 border-b flex-shrink-0"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                N
              </div>
            )}
            <div>
              <h1
                className="text-sm font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                {sessionTitle}
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                {activeMessages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#10b981' }}
              />
              <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                Connected
              </span>
            </div>
          </div>
        </div>

        <ChatWindow />

        <div
          className="flex-shrink-0 px-4 pb-4 pt-2 border-t"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg)',
          }}
        >
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
