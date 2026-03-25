import { useState } from 'react'

const STATUS_COLOR = {
  active: '#22c55e',
  delayed: '#f59e0b',
  disrupted: '#ef4444',
}

const ROUTE_COLOR = {
  active: '#14b8a6',
  delayed: '#f59e0b',
  disrupted: '#ef4444',
}

export default function SupplyMap({ highlightNodes = [], nodes = [], routes = [] }) {
  const [tooltip, setTooltip] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  function handleNodeEnter(node, e) {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    const scaleX = rect.width / 800
    const scaleY = rect.height / 420
    setTooltipPos({ x: node.x * scaleX + 12, y: node.y * scaleY - 50 })
    setTooltip(node)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox="0 0 800 420"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2530" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="800" height="420" fill="url(#grid)" />

        <path d="M0,120 Q100,80 200,110 Q300,140 400,100 Q500,60 600,90 Q700,120 800,100" fill="none" stroke="#1e2a35" strokeWidth="1" />
        <path d="M0,200 Q80,180 160,220 Q240,260 320,230 Q400,200 480,240 Q560,280 640,260 Q720,240 800,260" fill="none" stroke="#1e2a35" strokeWidth="1" />

        {routes.map((route) => {
          const from = nodes.find((node) => node.id === route.from)
          const to = nodes.find((node) => node.id === route.to)
          if (!from || !to) return null

          const color = ROUTE_COLOR[route.status] || '#1e2a35'
          const dash = route.mode === 'air' ? '5 3' : route.status === 'disrupted' ? '4 4' : 'none'
          const opacity = route.status === 'disrupted' ? 0.95 : route.status === 'delayed' ? 0.85 : 0.45

          const cx = (from.x + to.x) / 2
          const cy = (from.y + to.y) / 2 - 18

          return (
            <path
              key={route.id}
              d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
              fill="none"
              stroke={color}
              strokeWidth={route.mode === 'air' ? 1.4 : 0.95}
              strokeDasharray={dash}
              opacity={opacity}
            />
          )
        })}

        {nodes.map((node) => {
          const color = STATUS_COLOR[node.status] || STATUS_COLOR.active
          const isHighlighted = highlightNodes.includes(node.id)
          const isPort = node.type === 'port'
          const isHub = node.type === 'hub'
          const r = isPort ? 8 : isHub ? 7 : 6

          return (
            <g
              key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(event) => handleNodeEnter(node, event)}
              onMouseLeave={() => setTooltip(null)}
            >
              {(node.status === 'disrupted' || isHighlighted) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.5"
                  style={{ animation: 'pulseRing 2s ease-out infinite' }}
                />
              )}
              <circle cx={node.x} cy={node.y} r={r} fill={color + '22'} stroke={color} strokeWidth="1" />
              <circle cx={node.x} cy={node.y} r="3" fill={color} />
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x,
          top: tooltipPos.y,
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 11,
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 180,
        }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
            {tooltip.name}
          </div>
          <TooltipRow label="Type" value={tooltip.type} />
          <TooltipRow label="Region" value={tooltip.region} />
          <TooltipRow label="Status" value={tooltip.status.toUpperCase()} valueColor={STATUS_COLOR[tooltip.status]} />
          <TooltipRow label="Capacity" value={`${tooltip.capacity || 0} units`} />
          <TooltipRow label="Risk" value={`${((tooltip.riskScore || 0) * 100).toFixed(0)}%`} />
        </div>
      )}
    </div>
  )
}

function TooltipRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 2 }}>
      <span style={{ color: 'var(--text3)', fontSize: 10 }}>{label}</span>
      <span style={{ color: valueColor || 'var(--text2)', fontSize: 10 }}>{value}</span>
    </div>
  )
}
