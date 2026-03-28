import SupplyMap from '../map/SupplyMap'
// ❌ REMOVE THIS IMPORT
// import SimBar from '../simulation/SimBar'

import { useStore } from '../../store/useStore'

export default function CenterPannel() {
  const disruptions = useStore(s => s.disruptions)
  const activeDisruptionId = useStore(s => s.activeDisruptionId)
  const supplyNodes = useStore(s => s.supplyNodes)
  const supplyRoutes = useStore(s => s.supplyRoutes)

  const activeDisruption = disruptions.find(d => d.id === activeDisruptionId)
  const highlightNodes = activeDisruption?.affectedNodes || []

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      
      {/* Map legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '8px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg2)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>Legend</span>
        {[
          { color: '#ef4444', label: 'Disrupted' },
          { color: '#f59e0b', label: 'Delayed' },
          { color: '#22c55e', label: 'Active' },
          { color: '#14b8a6', label: 'Flow route' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SupplyMap 
          highlightNodes={highlightNodes} 
          nodes={supplyNodes} 
          routes={supplyRoutes} 
          disruption={activeDisruption}   
        />
      </div>

      {/* ❌ REMOVE THIS PART */}
      {/* <SimBar /> */}

    </main>
  )
}