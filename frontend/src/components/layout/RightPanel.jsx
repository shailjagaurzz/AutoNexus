import ReasoningStream from '../agents/ReasoningStream'
import ActionsList from '../agents/ActionList'
import ActivityLog from '../agents/ActivityLog'

export default function RightPanel() {
  return (
    <aside style={{
      width: 320, background: 'var(--bg2)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <ReasoningStream />
      <ActionsList />
      <ActivityLog />
    </aside>
  )
}
