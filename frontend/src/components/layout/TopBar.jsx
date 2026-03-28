import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../auth/AuthContext'

const tabs = ['Control Tower', 'Routes', 'Suppliers', 'Analytics']

export default function TopBar() {
  const { user, logout } = useAuth()

  const activeTab = useStore(s => s.activeTab)
  const setActiveTab = useStore(s => s.setActiveTab)

  const [time, setTime] = useState('')

  // ✅ Clean UTC time clock
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
        }) + ' IST'
      )
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 52,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Gradient line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent, var(--amber) 30%, var(--teal) 70%, transparent)',
          opacity: 0.4,
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--display)',
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: -0.5,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: '1.5px solid var(--amber)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: 'var(--amber)',
              borderRadius: '50%',
            }}
          />
        </div>

        AUTO<span style={{ color: 'var(--amber)' }}>NEXUS</span>
      </div>

      {/* Nav tabs */}
      <nav style={{ display: 'flex', gap: 2 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 16px',
              borderRadius: 4,
              cursor: 'pointer',
              background: 'none',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              border:
                activeTab === tab
                  ? '1px solid var(--border)'
                  : '1px solid transparent',
              color:
                activeTab === tab ? 'var(--amber)' : 'var(--text2)',
              background:
                activeTab === tab ? 'var(--bg3)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Right side (cleaned) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text2)',
          }}
        >
          {(user?.name || 'Operator') +
            (user?.companyName
              ? ` • ${user.companyName}`
              : '')}
        </span>

        {/* Time */}
        <span
          style={{
            fontSize: 12,
            color: 'var(--text2)',
            fontFamily: 'var(--mono)',
          }}
        >
          {time}
        </span>

        {/* Logout */}
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
  )
}