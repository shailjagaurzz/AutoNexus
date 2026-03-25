import { useStore } from '../../store/useStore'

export default function AnalyticsView() {
  const kpis = useStore(s => s.kpis)
  const disruptions = useStore(s => s.disruptions)
  const actions = useStore(s => s.actions)
  const supplyNodes = useStore(s => s.supplyNodes)

  // Calculate metrics
  const openDisruptions = disruptions.filter(d => d.status === 'open').length
  const resolvedDisruptions = disruptions.filter(d => d.status === 'resolved').length
  const totalDisruptions = openDisruptions + resolvedDisruptions

  // Risk distribution
  const highRiskNodes = supplyNodes.filter(n => n.riskScore > 0.7).length
  const mediumRiskNodes = supplyNodes.filter(n => n.riskScore > 0.4 && n.riskScore <= 0.7).length
  const lowRiskNodes = supplyNodes.filter(n => n.riskScore <= 0.4).length

  // Action statistics
  const approvedActions = actions.filter(a => a.guardrailResult === 'APPROVED').length
  const blockedActions = actions.filter(a => a.guardrailResult === 'BLOCKED').length

  const MetricCard = ({ label, value, unit = '', color = 'var(--text1)', trend = null }) => (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 16,
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>
          {typeof value === 'number' && value > 1000 ? (value / 1000).toFixed(1) + 'k' : value}
        </span>
        {unit && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ fontSize: 11, marginTop: 6, color: trend > 0 ? 'var(--amber)' : 'var(--green)' }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
        </div>
      )}
    </div>
  )

  const RiskBar = ({ high, medium, low }) => {
    const total = high + medium + low || 1
    return (
      <div style={{ display: 'flex', gap: 2, height: 24, borderRadius: 4, overflow: 'hidden' }}>
        {high > 0 && (
          <div
            style={{
              flex: high / total,
              background: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: 'white',
              fontWeight: 600,
            }}
            title={`${high} high risk`}
          >
            {high}
          </div>
        )}
        {medium > 0 && (
          <div
            style={{
              flex: medium / total,
              background: 'var(--amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#000',
              fontWeight: 600,
            }}
            title={`${medium} medium risk`}
          >
            {medium}
          </div>
        )}
        {low > 0 && (
          <div
            style={{
              flex: low / total,
              background: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#000',
              fontWeight: 600,
            }}
            title={`${low} low risk`}
          >
            {low}
          </div>
        )}
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
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'var(--text1)' }}>
          Analytics Dashboard
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          Real-time supply chain performance metrics
        </p>
      </div>

      {/* Top-level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        <MetricCard
          label="Active Disruptions"
          value={kpis.activeDisruptionsCount || 0}
          color={kpis.activeDisruptionsCount > 0 ? 'var(--red)' : 'var(--green)'}
        />
        <MetricCard
          label="Delayed Shipments"
          value={kpis.delayedShipments || 0}
          unit="units"
          color={kpis.delayedShipments > 500 ? 'var(--red)' : 'var(--amber)'}
        />
        <MetricCard
          label="Financial Impact"
          value={((kpis.estimatedFinancialImpact || 0) / 1_000_000).toFixed(1)}
          unit="M"
          color="var(--teal)"
        />
        <MetricCard
          label="Average Delay"
          value={(kpis.averageDelayTime || 0).toFixed(1)}
          unit="days"
          color={kpis.averageDelayTime > 5 ? 'var(--amber)' : 'var(--green)'}
        />
      </div>

      {/* Disruption Stats */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text1)' }}>
          Disruption Statistics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Total Events</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text1)' }}>
              {disruptions.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Open</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>
              {openDisruptions}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Resolved</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
              {resolvedDisruptions}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Heatmap */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text1)' }}>
          Network Risk Distribution
        </h3>
        <div style={{ marginBottom: 12 }}>
          <RiskBar high={highRiskNodes} medium={mediumRiskNodes} low={lowRiskNodes} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--text2)' }}>High Risk</span>
            <div style={{ fontWeight: 600, color: 'var(--red)' }}>{highRiskNodes} nodes</div>
          </div>
          <div>
            <span style={{ color: 'var(--text2)' }}>Medium Risk</span>
            <div style={{ fontWeight: 600, color: 'var(--amber)' }}>{mediumRiskNodes} nodes</div>
          </div>
          <div>
            <span style={{ color: 'var(--text2)' }}>Low Risk</span>
            <div style={{ fontWeight: 600, color: 'var(--green)' }}>{lowRiskNodes} nodes</div>
          </div>
        </div>
      </div>

      {/* Action Effectiveness */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text1)' }}>
          Action Effectiveness
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11 }}>
          <div>
            <div style={{ color: 'var(--text2)', marginBottom: 6 }}>Approved Actions</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>
              {approvedActions}
              {actions.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 6 }}>
                  ({((approvedActions / actions.length) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text2)', marginBottom: 6 }}>Blocked Actions</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>
              {blockedActions}
              {actions.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text2)', marginLeft: 6 }}>
                  ({((blockedActions / actions.length) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text1)' }}>
          Key Insights
        </h3>
        <ul style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6, paddingLeft: 16 }}>
          {highRiskNodes > 0 && (
            <li style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>{highRiskNodes} high-risk nodes</span> require immediate attention
            </li>
          )}
          {kpis.activeDisruptionsCount > 0 && (
            <li style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{kpis.activeDisruptionsCount} active disruptions</span> affecting {kpis.delayedShipments} shipments
            </li>
          )}
          {approvedActions > blockedActions && (
            <li style={{ marginBottom: 4 }}>
              Actions have <span style={{ color: 'var(--green)', fontWeight: 600 }}>high approval rate</span> ({((approvedActions / (actions.length || 1)) * 100).toFixed(0)}%)
            </li>
          )}
          {lowRiskNodes > mediumRiskNodes && (
            <li>
              Network health is <span style={{ color: 'var(--green)', fontWeight: 600 }}>stable</span> with majority low-risk nodes
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
