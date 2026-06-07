import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import WorkspaceLayout from '@/components/layout/WorkspaceLayout'
import LeftPanel from '@/components/layout/LeftPanel'
import RightPanel from '@/components/layout/RightPanel'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'

export default async function ChatPage() {
  const { userId } = await auth()
  if (!userId) redirect('/')

  return (
    <WorkspaceLayout
      title="Workspace"
      tag="RESEARCH_001"
      leftPanel={<LeftPanel />}
      rightPanel={<RightPanel />}
      topbarExtras={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
          <i className="ti ti-brain" style={{ fontSize: 13, color: 'var(--nx-accent2)' }} aria-hidden="true" />
          <span style={{ fontSize: 11, color: 'var(--nx-text-muted)' }}>Multi-agent · 3 active</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nx-green)', boxShadow: '0 0 6px var(--nx-green)', display: 'inline-block' }} />
            <span style={{ fontSize: 9, color: 'var(--nx-green)', fontFamily: 'var(--nx-mono)' }}>SYSTEM NOMINAL</span>
          </div>
        </div>
      }
    >
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <ChatWindow />
        <ChatInput />
      </section>
    </WorkspaceLayout>
  )
}