import { useStore } from '../../store/useStore'

export default function RoutesView() {
  const supplyRoutes = useStore(s => s.supplyRoutes)
  const supplyNodes = useStore(s => s.supplyNodes)

  const getNodeName = (nodeId) => {
    const node = supplyNodes.find(n => n.id === nodeId)
    return node?.name || 'Unknown'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--green)'
      case 'delayed': return 'var(--amber)'
      case 'disrupted': return 'var(--red)'
      default: return 'var(--text2)'
    }
  }

  const getModeIcon = (mode) => {
    const icons = { ocean: '🌊', air: '✈️', rail: '🚂', truck: '🚚' }
    return icons[mode] || '📦'
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 20,
      overflow: 'auto',
      background: 'var(--bg1)',
      height: '100%',
    }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text1)' }}>
          Supply Routes
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          {supplyRoutes.length} active routes across your supply network
        </p>
      </div>

      {supplyRoutes.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text2)' }}>
          No routes configured
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {supplyRoutes.map(route => (
            <div
              key={route.id}
              style={{
                background: 'var(--bg2)',
                border: `1px solid var(--border)`,
                borderRadius: 8,
                padding: 12,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg3)'
                e.currentTarget.style.borderColor = getStatusColor(route.status)
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg2)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Header with mode and status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{getModeIcon(route.mode)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text1)' }}>
                    {route.mode}
                  </span>
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '3px 6px',
                  background: getStatusColor(route.status),
                  color: 'var(--bg1)',
                  borderRadius: 3,
                  fontWeight: 600,
                }}>
                  {route.status.toUpperCase()}
                </span>
              </div>

              {/* Route path */}
              <div style={{ fontSize: 11, marginBottom: 8, color: 'var(--text2)' }}>
                <strong>{getNodeName(route.fromNodeId)}</strong> → <strong>{getNodeName(route.toNodeId)}</strong>
              </div>

              {/* Metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Capacity</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {route.weeklyCapacityTeu || 0} TEU
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Transit</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {route.avgTransitDays || 0} days
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Flow</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {((route.flowPercent || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Risk</span>
                  <div style={{ fontWeight: 600, color: getStatusColor(route.status) }}>
                    {((route.riskScore || 0) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Delay indicator */}
              {route.delayDays > 0 && (
                <div style={{
                  marginTop: 8,
                  padding: 6,
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid var(--amber)',
                  borderRadius: 4,
                  fontSize: 10,
                  color: 'var(--amber)',
                }}>
                  ⚠️ {route.delayDays} day delay
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
