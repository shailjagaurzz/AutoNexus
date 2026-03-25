import { useStore } from '../../store/useStore'
import DisruptionCard from '../distruption/DisruptionCard'

function KpiBox({ value, label, color }) {
  return (
    <div style={{ background: 'var(--bg2)', padding: '12px 14px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: `var(--${color})` }}>
        {value}
      </div>
      <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>
        {label}
      </div>
    </div>
  )
}

function HeatBar({ heatmap }) {
  const total = Math.max(1, (heatmap.high || 0) + (heatmap.medium || 0) + (heatmap.low || 0))

  return (
    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        Risk Heatmap
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border2)' }}>
        <div style={{ width: `${((heatmap.high || 0) / total) * 100}%`, background: 'var(--red)' }} />
        <div style={{ width: `${((heatmap.medium || 0) / total) * 100}%`, background: 'var(--amber)' }} />
        <div style={{ width: `${((heatmap.low || 0) / total) * 100}%`, background: 'var(--green)' }} />
      </div>
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text2)' }}>
        <span>H {(heatmap.high || 0)}</span>
        <span>M {(heatmap.medium || 0)}</span>
        <span>L {(heatmap.low || 0)}</span>
      </div>
    </div>
  )
}

export default function LeftPanel() {
  const disruptions = useStore(s => s.disruptions)
  const activeDisruptionId = useStore(s => s.activeDisruptionId)
  const setActive = useStore(s => s.setActiveDisruption)
  const kpis = useStore(s => s.kpis)

  const critCount = disruptions.filter(d => d.severity >= 7).length

  function handleSelect(d) {
    setActive(d.id)
  }

  return (
    <aside style={{
      width: 280, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)' }}>
          Disruption Feed
        </span>
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 10,
          background: 'rgba(239,68,68,0.15)', color: 'var(--red)',
          border: '1px solid rgba(239,68,68,0.3)', fontFamily: 'var(--mono)',
        }}>
          {critCount} critical
        </span>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {disruptions.length === 0 ? (
          <div style={{ padding: '16px', color: 'var(--text3)', fontSize: 11, lineHeight: 1.6 }}>
            No disruptions yet. Trigger one from the simulation controls below the map.
          </div>
        ) : (
          disruptions.map(d => (
            <DisruptionCard
              key={d.id}
              disruption={d}
              isActive={d.id === activeDisruptionId}
              onClick={() => handleSelect(d)}
            />
          ))
        )}
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 1, background: 'var(--border)',
        borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        <KpiBox value={kpis.activeDisruptionsCount} label="Active Disruptions" color="red" />
        <KpiBox value={kpis.delayedShipments} label="Delayed Shipments" color="amber" />
        <KpiBox value={`$${((kpis.estimatedFinancialImpact || 0) / 1000000).toFixed(2)}M`} label="Financial Impact" color="teal" />
        <KpiBox value={`${kpis.averageDelayTime || 0}d`} label="Average Delay" color="green" />
      </div>
      <HeatBar heatmap={kpis.riskHeatmap || { high: 0, medium: 0, low: 0 }} />
    </aside>
  )
}
