import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../auth/AuthContext'
import LiveStreamControl from '../common/LiveStreamControl'

const tabs = ['Control Tower', 'Routes', 'Suppliers', 'Analytics']

export default function TopBar() {
  const { user, logout } = useAuth()
  const activeTab = useStore(s => s.activeTab)
  const setActiveTab = useStore(s => s.setActiveTab)
  const [time, setTime] = useState('')
  const disruptions = useStore(s => s.disruptions)
  const kpis = useStore(s => s.kpis)
  const alertFlash = useStore(s => s.alertFlash)

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const critCount = kpis.activeDisruptionsCount || disruptions.filter(d => d.severity >= 7).length
  const trackedCount = Array.isArray(user?.trackedSupplies) ? user.trackedSupplies.length : 0

  return (
    <>
      {/* Alert flash overlay */}
      {alertFlash && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          border: '2px solid var(--red)', zIndex: 9999,
          animation: 'flashBorder 0.7s ease-out forwards',
        }} />
      )}

      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52, background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
        position: 'relative',
      }}>
        {/* Gradient line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--amber) 30%, var(--teal) 70%, transparent)',
          opacity: 0.4,
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
          <div style={{
            width: 28, height: 28, border: '1.5px solid var(--amber)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: 10, height: 10, background: 'var(--amber)', borderRadius: '50%',
              animation: 'blink 2s ease-in-out infinite',
            }} />
          </div>
          Supply<span style={{ color: 'var(--amber)' }}>Mind</span> AI
        </div>

        {/* Nav tabs */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '6px 16px', borderRadius: 4, cursor: 'pointer', background: 'none',
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase',
              border: activeTab === tab ? '1px solid var(--border)' : '1px solid transparent',
              color: activeTab === tab ? 'var(--amber)' : 'var(--text2)',
              background: activeTab === tab ? 'var(--bg3)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {tab}
            </button>
          ))}
        </nav>

        {/* Right status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>
            {(user?.name || 'Operator') + (user?.companyName ? ` • ${user.companyName}` : '')}
          </span>
          <LiveStreamControl />
          <StatusPill color="green" label="Detection/Impact/Decision online" />
          <StatusPill color="amber" label={`${critCount} active alerts`} blink />
          <StatusPill color="blue" label={`${trackedCount} supplies tracked`} />
          <span style={{ fontSize: 12, color: 'var(--text2)', letterSpacing: 0.5, fontFamily: 'var(--mono)' }}>
            {time}
          </span>
          <button
            onClick={logout}
            style={{
              border: '1px solid var(--border2)',
              background: 'var(--bg3)',
              color: 'var(--text2)',
              padding: '5px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontSize: 10,
            }}
          >
            Logout
          </button>
        </div>
      </header>
    </>
  )
}

function StatusPill({ color, label, blink }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
      color: 'var(--text2)', padding: '4px 10px', background: 'var(--bg3)',
      border: '1px solid var(--border)', borderRadius: 20,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: `var(--${color})`,
        boxShadow: `0 0 6px var(--${color})`,
        animation: blink ? 'blink 1.2s ease-in-out infinite' : 'none',
      }} />
      {label}
    </div>
  )
}
