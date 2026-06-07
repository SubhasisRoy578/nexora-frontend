'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

interface WorkspaceLayoutProps {
  children: React.ReactNode
  rightPanel?: React.ReactNode
  leftPanel?: React.ReactNode
  topbarExtras?: React.ReactNode
  title?: string
  tag?: string
}

const NAV_ITEMS = [
  { icon: 'ti-message-2',  label: 'Chat',        href: '/chat' },
  { icon: 'ti-robot',      label: 'Agents',      href: '/dashboard', badge: true },
  { icon: 'ti-files',      label: 'Documents',   href: '/documents' },
  { icon: 'ti-database',   label: 'Knowledge',   href: '/knowledge' },
  { icon: 'ti-code',       label: 'Code',        href: '/code' },
  { icon: 'ti-chart-line', label: 'Analytics',   href: '/analytics' },
]

export default function WorkspaceLayout({
  children, rightPanel, leftPanel, topbarExtras, title = 'Workspace', tag,
}: WorkspaceLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarHover, setSidebarHover] = useState(false)

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      background: 'var(--nx-bg)', overflow: 'hidden',
      fontFamily: 'var(--nx-display)',
    }}>
      {/* ── Icon Sidebar ── */}
      <nav
        style={{
          width: 56, background: 'var(--nx-surface)',
          borderRight: '1px solid var(--nx-border)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '12px 0', gap: 6,
          flexShrink: 0, zIndex: 50,
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 14, fontWeight: 800,
            color: '#fff', marginBottom: 10, cursor: 'pointer',
            letterSpacing: -1,
          }}
          onClick={() => router.push('/chat')}
          title="Nexora"
        >N</div>

        {NAV_ITEMS.slice(0, 4).map((item) => (
          <NavButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            badge={item.badge}
            onClick={() => router.push(item.href)}
          />
        ))}

        <div style={{ width: 28, height: 1, background: 'var(--nx-border)', margin: '4px 0' }} />

        {NAV_ITEMS.slice(4).map((item) => (
          <NavButton
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
            onClick={() => router.push(item.href)}
          />
        ))}

        <div style={{ width: 28, height: 1, background: 'var(--nx-border)', margin: '4px 0' }} />

        <NavButton icon="ti-settings" label="Settings" onClick={() => router.push('/settings')} />

        {/* User avatar */}
        <div style={{ marginTop: 'auto' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: 30, height: 30, borderRadius: '50%' },
              },
            }}
          />
        </div>
      </nav>

      {/* ── Main column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          height: 44, background: 'var(--nx-surface)',
          borderBottom: '1px solid var(--nx-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 14px', gap: 10, flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            color: 'var(--nx-text-muted)', textTransform: 'uppercase',
          }}>{title}</span>
          {tag && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.22)',
              color: 'var(--nx-accent)',
              fontFamily: 'var(--nx-mono)', letterSpacing: '0.04em',
            }}>{tag}</span>
          )}
          {topbarExtras}
        </div>

        {/* Content row */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {leftPanel}
          {children}
          {rightPanel}
        </div>
      </div>
    </div>
  )
}

function NavButton({
  icon, label, active = false, badge = false, onClick,
}: {
  icon: string; label: string; href?: string; active?: boolean; badge?: boolean; onClick?: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={label}
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 36, height: 36, borderRadius: 8, border: 'none',
        background: active
          ? 'rgba(59,130,246,0.18)'
          : hover ? 'rgba(59,130,246,0.09)' : 'transparent',
        color: active ? 'var(--nx-accent)' : hover ? 'var(--nx-text)' : 'var(--nx-text-muted)',
        cursor: 'pointer', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
      {badge && (
        <span style={{
          position: 'absolute', top: 4, right: 4, width: 7, height: 7,
          borderRadius: '50%', background: 'var(--nx-green)',
          border: '1.5px solid var(--nx-surface)',
        }} />
      )}
    </button>
  )
}