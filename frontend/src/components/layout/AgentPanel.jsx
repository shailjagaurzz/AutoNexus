import { useStore } from '../../store/useStore'

export default function AgentPanel() {
  const steps = useStore(s => s.reasoningSteps)
  const status = useStore(s => s.agentStatus)
  const selectedDisruption = useStore(s => s.selectedDisruption)

  return (
    <div style={{ padding: 12 }}>
      
      {/* HEADER */}
      <h3 style={{ marginBottom: 10 }}>🤖Need Help!</h3>

      {/* ✅ SELECTED DISRUPTION CONTEXT (MISSING BEFORE) */}
      {!selectedDisruption ? (
        <div style={{ color: 'var(--text3)', fontSize: 12 }}>
          Click a disruption to analyze route impact
        </div>
      ) : (
        <div style={{
          marginBottom: 12,
          padding: 10,
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--bg2)'
        }}>
          <div><b>Route:</b> {selectedDisruption.route}</div>
          <div><b>Status:</b> {selectedDisruption.status}</div>
          <div><b>Severity:</b> {selectedDisruption.severity}</div>
        </div>
      )}

      {/* STATUS */}
      
      {/* REASONING STEPS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps?.length ? steps.map((step, i) => (
          <div
            key={i}
            style={{
              padding: 8,
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--bg2)'
            }}
          >
            <b>{step.agent}</b>
            <div style={{ fontSize: 12 }}>{step.text}</div>
          </div>
        )) : (
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            
          </div>
        )}
      </div>
    </div>
  )
}