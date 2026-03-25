import { useStore } from '../../store/useStore'

export default function SuppliersView() {
  const supplyNodes = useStore(s => s.supplyNodes)
  const supplyRoutes = useStore(s => s.supplyRoutes)

  const getNodeTypeIcon = (nodeId) => {
    // Count connections to determine if it's a hub or supplier
    const outgoing = supplyRoutes.filter(r => r.fromNodeId === nodeId).length
    const incoming = supplyRoutes.filter(r => r.toNodeId === nodeId).length
    if (outgoing > 2 || incoming > 2) return '🏭' // Hub
    if (outgoing > incoming) return '🏗️' // Supplier
    return '📦' // Warehouse
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'var(--green)'
      case 'delayed': return 'var(--amber)'
      case 'disrupted': return 'var(--red)'
      default: return 'var(--text2)'
    }
  }

  const getUtilizationBar = (utilization) => {
    const percent = (utilization || 0) * 100
    const color = percent > 80 ? 'var(--red)' : percent > 60 ? 'var(--amber)' : 'var(--green)'
    return (
      <div style={{
        width: '100%',
        height: 4,
        background: 'var(--bg3)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 4,
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s',
        }} />
      </div>
    )
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
          Suppliers & Nodes
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          {supplyNodes.length} nodes in your supply chain network
        </p>
      </div>

      {supplyNodes.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text2)' }}>
          No nodes configured
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {supplyNodes.map(node => (
            <div
              key={node.id}
              style={{
                background: 'var(--bg2)',
                border: `1px solid var(--border)`,
                borderRadius: 8,
                padding: 12,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg3)'
                e.currentTarget.style.borderColor = getStatusColor(node.status)
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg2)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Header with name and status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 18 }}>{getNodeTypeIcon(node.id)}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>
                      {node.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>
                      {node.location || 'Not specified'}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '4px 8px',
                  background: getStatusColor(node.status),
                  color: 'var(--bg1)',
                  borderRadius: 3,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  {node.status.toUpperCase()}
                </span>
              </div>

              {/* Metrics row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: 12,
                fontSize: 10,
                marginBottom: 8,
              }}>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Capacity</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {node.capacityUnits?.toLocaleString() || 0} U
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Utilization</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {((node.utilizationRate || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Risk Score</span>
                  <div style={{
                    fontWeight: 600,
                    color: (node.riskScore || 0) > 0.7 ? 'var(--red)' : (node.riskScore || 0) > 0.4 ? 'var(--amber)' : 'var(--green)',
                  }}>
                    {((node.riskScore || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>Connections</span>
                  <div style={{ fontWeight: 600, color: 'var(--text1)' }}>
                    {supplyRoutes.filter(r => r.fromNodeId === node.id || r.toNodeId === node.id).length} routes
                  </div>
                </div>
              </div>

              {/* Utilization bar */}
              <div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>Utilization</div>
                {getUtilizationBar(node.utilizationRate)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
