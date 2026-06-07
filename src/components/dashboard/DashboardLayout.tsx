'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, MessageSquare, RefreshCw,
  Sun, Moon, Wifi, WifiOff
} from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { getMockDashboardData } from '@/lib/dashboardApi';
import AgentCards from './AgentCards';
import TaskFeed from './TaskFeed';
import Analytics from './Analytics';

// Polling interval in ms (5 seconds)
const POLL_INTERVAL = 5000;

export default function DashboardLayout() {
  const { theme, toggleTheme } = useChatStore();
  const {
    agents, tasks, providerStats, dailyUsage,
    totalMessages, totalTokens,
    isConnected, setConnected, setLastRefresh,
    setAgentStatus, addTask, updateTask,
    incrementProviderStat,
  } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'analytics'>('agents');

  // Load dashboard data — tries real API, falls back to mock
  const loadData = useCallback(async () => {
    try {
      // Try real backend first
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/agents/status`,
        { signal: AbortSignal.timeout(3000) }
      );

      if (res.ok) {
        // Real backend connected — parse and hydrate store
        const data = await res.json();
        data.forEach((a: { id: string; status: string; current_task?: string }) => {
          setAgentStatus(a.id as never, a.status as never, a.current_task);
        });
        setConnected(true);
      } else {
        throw new Error('Backend unavailable');
      }
    } catch {
      // Fall back to mock data for UI development
      const mock = getMockDashboardData();
      mock.agents.forEach((a) => setAgentStatus(a.id, a.status as never, a.current_task));

      // Only seed tasks once (when store is empty)
      if (tasks.length === 0) {
        mock.tasks.forEach((t) =>
          addTask({
            title:       t.title,
            agent:       t.agent,
            status:      t.status,
            provider:    t.provider,
            startedAt:   new Date(t.started_at),
            completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
            durationMs:  t.duration_ms,
            error:       t.error,
          })
        );
        mock.analytics.provider_stats.forEach((p) =>
          incrementProviderStat(p.provider, true, p.avg_latency_ms, p.tokens_used / Math.max(p.calls, 1))
        );
      }

      setConnected(false);
    }

    setLastRefresh(new Date());
    setLoading(false);
  }, [tasks.length, setAgentStatus, addTask, incrementProviderStat, setConnected, setLastRefresh]);

  // Initial load + polling
  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [loadData]);

  // Sync theme class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const TABS = [
    { id: 'agents',    label: 'Agent Fleet',  count: agents.filter(a => a.status === 'running').length },
    { id: 'tasks',     label: 'Task Feed',    count: tasks.filter(t => t.status === 'running').length },
    { id: 'analytics', label: 'Analytics',    count: null },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Top Nav ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link href="/chat" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              N
            </div>
            <span
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
            >
              Nexora
            </span>
          </Link>

          <span style={{ color: 'var(--border)' }}>/</span>

          <div className="flex items-center gap-1.5">
            <LayoutDashboard size={13} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Dashboard
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Connection badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{
              background: isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              color:       isConnected ? '#10b981' : '#f59e0b',
              border:      isConnected ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.25)',
              fontFamily:  'var(--font-mono)',
            }}
          >
            {isConnected
              ? <Wifi size={10} />
              : <WifiOff size={10} />}
            {isConnected ? 'Live' : 'Mock data'}
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'var(--elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ background: 'var(--elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Go to Chat */}
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff',
              boxShadow: '0 2px 10px rgba(99,102,241,0.3)',
            }}
          >
            <MessageSquare size={12} />
            Chat
          </Link>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <h1
            className="text-2xl font-extrabold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            Agent Control Center
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Monitor your AI agents, background tasks, and model usage in real time.
          </p>
        </motion.div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:    isActive ? 'var(--surface)' : 'transparent',
                  color:         isActive ? 'var(--text)' : 'var(--text-3)',
                  boxShadow:     isActive ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                  border:        isActive ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl shimmer"
                style={{ border: '1px solid var(--border)' }}
              />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'agents'    && <AgentCards agents={agents} />}
            {activeTab === 'tasks'     && <TaskFeed   tasks={tasks} />}
            {activeTab === 'analytics' && (
              <Analytics
                providerStats={providerStats}
                dailyUsage={dailyUsage}
                totalMessages={totalMessages}
                totalTokens={totalTokens}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}