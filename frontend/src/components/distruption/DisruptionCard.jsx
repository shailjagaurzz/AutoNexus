import Badge from '../Badge'

const SEV_COLORS = { red: '#ef4444', amber: '#f59e0b', green: '#22c55e' }

export default function DisruptionCard({ disruption, isActive, onClick }) {
  const { type, location, severity, age, color, probability, confidence, delayedShipments, averageDelayDays } = disruption
  const col = SEV_COLORS[color] || SEV_COLORS.amber
  const label = severity >= 8 ? 'CRITICAL' : severity >= 5 ? 'HIGH' : 'MEDIUM'

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: isActive ? 'var(--bg3)' : 'transparent',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.15s',
        animation: 'slideIn 0.35s ease-out',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg3)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 2, background: 'var(--amber)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
          {type}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{age}</span>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
        📍 {location}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
        <span style={{ color: col, minWidth: 40 }}>SEV {severity}</span>
        <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${severity * 10}%`, height: '100%', background: col, borderRadius: 2, transition: 'width 0.5s' }} />
        </div>
        <Badge color={color}>{label}</Badge>
      </div>

      <div style={{ marginTop: 7, fontSize: 10, color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>P {(Number(probability || 0) * 100).toFixed(0)}%</span>
        <span>C {(Number(confidence || 0) * 100).toFixed(0)}%</span>
        <span>{delayedShipments || 0} delayed</span>
        <span>{averageDelayDays || 0}d avg</span>
      </div>
    </div>
  )
}
