import { useStore } from '../../store/useStore'

import ReasoningStream from '../agents/ReasoningStream'
import ActionsList from '../agents/ActionList'
import ActivityLog from '../agents/ActivityLog'

export default function RightPanel() {
  const selectedDisruption = useStore(s => s.selectedDisruption)

  return (
    <aside
      style={{
        width: 320,
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >

      {/* CONTEXT HEADER */}
      <div
        style={{
          padding: 10,
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        {selectedDisruption ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 700 }}>
              {selectedDisruption.title || 'Disruption Context'}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text3)' }}>
              Route: {selectedDisruption.routeName || 'N/A'}
            </div>

            <div style={{ fontSize: 10, color: 'var(--text3)' }}>
              Severity: {selectedDisruption.severity}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            No disruption selected
          </div>
        )}
      </div>

      {/* CORE AGENT MODULES */}
      <ReasoningStream disruption={selectedDisruption} />
      <ActionsList disruption={selectedDisruption} />
      <ActivityLog disruption={selectedDisruption} />

    </aside>
  )
}