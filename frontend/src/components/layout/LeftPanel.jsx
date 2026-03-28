import { useStore } from '../../store/useStore'
import DisruptionCard from '../distruption/DisruptionCard'
import AgentPanel from './AgentPanel'

function KpiBox({ value, label, color }) {
  return (
    <div style={{ background: 'var(--bg2)', padding: '12px 14px', textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--display)',
        fontSize: 22,
        fontWeight: 800,
        color: `var(--${color})`
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 9,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'var(--text3)'
      }}>
        {label}
      </div>
    </div>
  )
}

export default function LeftPanel() {
  const disruptions = useStore(s => s.disruptions)
  const activeDisruptionId = useStore(s => s.activeDisruptionId)

  const setActiveDisruption = useStore(s => s.setActiveDisruption)
  const setSelectedDisruption = useStore(s => s.setSelectedDisruption)

  const activeDisruptions = disruptions.filter(d => d.status === 'active')

  const critCount = activeDisruptions.filter(d => d.severity >= 7).length

  const delayedShipments = new Set(
    activeDisruptions
      .filter(d => (d.delayDays || 0) > 0)
      .map(d => d.shipmentId)
  ).size

  function handleSelect(d) {
    setActiveDisruption(d.id)
    setSelectedDisruption(d)
  }

  return (
    <aside style={{
      width: 280,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* HEADER */}
      <div style={{
        padding: 14,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontFamily: 'var(--display)',
          fontSize: 11,
          letterSpacing: 1.5,
          textTransform: 'uppercase'
        }}>
          Disruption Feed
        </span>

        <span style={{
          fontSize: 10,
          color: 'var(--red)'
        }}>
          {critCount}
        </span>
      </div>

      {/* FEED */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {disruptions.map(d => (
          <DisruptionCard
            key={d.id}
            disruption={d}
            isActive={d.id === activeDisruptionId}
            onClick={() => handleSelect(d)}
          />
        ))}
      </div>

      {/* AGENT */}
      <div style={{
        borderTop: '1px solid var(--border)',
        maxHeight: 220,
        overflowY: 'auto'
      }}>
        <AgentPanel />
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderTop: '1px solid var(--border)'
      }}>
        <KpiBox value={activeDisruptions.length} label="Active" color="red" />
        <KpiBox value={delayedShipments} label="Delayed" color="amber" />
      </div>
    </aside>
  )
}