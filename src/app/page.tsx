'use client'
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) router.replace('/chat')
  }, [isSignedIn, router])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--nx-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--nx-accent) 1px, transparent 1px), linear-gradient(90deg, var(--nx-accent) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, position: 'relative' }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -1,
        }}>N</div>
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--nx-display)' }}>
          nexora
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1.1,
        textAlign: 'center',
        maxWidth: 640,
        marginBottom: 18,
        fontFamily: 'var(--nx-display)',
        position: 'relative',
      }}>
        The AI Operating
        <br />
        <span style={{ color: 'var(--nx-accent)' }}>System</span> for teams
      </h1>

      <p style={{
        fontSize: 16, color: 'var(--nx-text-muted)', textAlign: 'center',
        maxWidth: 440, lineHeight: 1.6, marginBottom: 36,
        position: 'relative',
      }}>
        Chat with AI, run autonomous agents, manage knowledge, and monitor execution — all in one unified workspace.
      </p>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
        <SignUpButton mode="modal">
          <button style={{
            height: 44, padding: '0 24px',
            background: 'var(--nx-accent)',
            border: 'none', borderRadius: 'var(--nx-radius)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            fontFamily: 'var(--nx-display)', cursor: 'pointer',
            letterSpacing: '0.02em',
          }}>
            Get started free →
          </button>
        </SignUpButton>
        <SignInButton mode="modal">
          <button style={{
            height: 44, padding: '0 24px',
            background: 'transparent',
            border: '1px solid var(--nx-border-hover)',
            borderRadius: 'var(--nx-radius)',
            color: 'var(--nx-text)', fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--nx-display)', cursor: 'pointer',
          }}>
            Sign in
          </button>
        </SignInButton>
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
        marginTop: 48, position: 'relative', maxWidth: 500,
      }}>
        {['Multi-agent execution', 'RAG + knowledge base', 'Real-time transparency', 'Document chat', 'Code intelligence'].map(f => (
          <span key={f} style={{
            fontSize: 11, padding: '4px 12px', borderRadius: 20,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)',
            color: 'var(--nx-text-muted)',
            fontFamily: 'var(--nx-mono)',
          }}>{f}</span>
        ))}
      </div>
    </main>
  )
}