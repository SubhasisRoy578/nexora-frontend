'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useChatStore } from '@/stores/chatStore';
import { streamChat, uploadDocument } from '@/lib/api';  // Using your actual uploadDocument
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

export default function ChatLayout() {
  const { user, getToken } = useUser();
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

      const token = await getToken();
      const userId = user?.id ?? 'anonymous';

      // Upload files to your RAG backend
      let fileContext = '';
      if (files.length > 0) {
        try {
          const uploads = await Promise.all(
            files.map(async (file) => {
              const result = await uploadDocument(file, token);
              return `[File: ${result.name || file.name} - ${result.chunks || '?'} chunks indexed]`;
            })
          );
          fileContext = uploads.join(' ');
          toast.success(`${files.length} file(s) uploaded and indexed to RAG`);
        } catch (err) {
          console.error('Upload error:', err);
          toast.error('File upload failed — sending message without files');
        }
      }

      const fullMessage = fileContext ? `${fileContext}\n\n${text}` : text;

      // Add user message
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

      // Add assistant placeholder
      const assistantId = addMessage(sessionId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      setIsStreaming(true);

      const abort = new AbortController();
      abortRef.current = abort;

      let buffer = '';
      const tools = Array.from(new Set(['rag', ...(text.includes('code') ? ['code'] : [])]));

      try {
        for await (const chunk of streamChat(fullMessage, tools, token)) {
          buffer += chunk;
          updateMessage(sessionId!, assistantId, {
            content: buffer,
            isStreaming: true,
          });
        }

        updateMessage(sessionId!, assistantId, {
          content: buffer || 'Done.',
          isStreaming: false,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Stream error';
        updateMessage(sessionId!, assistantId, {
          content: `Error: ${errorMsg}`,
          isStreaming: false,
          error: true,
        });
        toast.error(`Error: ${errorMsg}`);
      } finally {
        setIsStreaming(false);
      }
    },
    [
      isStreaming, activeSessionId, createSession,
      user, getToken, provider, addMessage, updateMessage, setIsStreaming,
    ]
  );

  const sessionTitle = activeMessages.find(m => m.role === 'user')?.content?.slice(0, 42) ?? 'Nexora AI';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg, #0A0C12)' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface, #11141C)',
            color: 'var(--text, #E5E7EB)',
            border: '1px solid var(--border, #1E2433)',
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
            background: 'var(--surface, #11141C)',
            borderColor: 'var(--border, #1E2433)',
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
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text, #E5E7EB)' }}
              >
                {sessionTitle}
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-3, #6B7280)' }}>
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
              <span className="text-[11px]" style={{ color: 'var(--text-3, #6B7280)' }}>
                Connected
              </span>
            </div>
          </div>
        </div>

        <ChatWindow />

        <div
          className="flex-shrink-0 px-4 pb-4 pt-2 border-t"
          style={{
            borderColor: 'var(--border, #1E2433)',
            background: 'var(--bg, #0A0C12)',
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
