import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAgentRunner } from '../../hooks/useAgentRunner'
import { getScenarios } from '../../services/api'
import { useAuth } from '../../auth/AuthContext'

const FALLBACK_SCENARIOS = [
  { key: 'typhoon', label: 'Typhoon Affecting Port Operations' },
  { key: 'supplier_shutdown', label: 'Tier-1 Supplier Shutdown' },
  { key: 'port_strike', label: 'Labor Strike at Destination Port' },
]

export default function SimBar() {
  const triggerFlash = useStore(s => s.triggerFlash)
  const { runForScenario } = useAgentRunner()
  const { user } = useAuth()
  const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS)

  useEffect(() => {
    let cancelled = false

    async function loadScenarios() {
      if (!user?.id) return
      try {
        const payload = await getScenarios(user)
        if (!cancelled && Array.isArray(payload?.scenarios) && payload.scenarios.length) {
          setScenarios(payload.scenarios)
        }
      } catch {
        // fallback list already set
      }
    }

    loadScenarios()
    return () => {
      cancelled = true
    }
  }, [user])

  function handleSim(scenario) {
    triggerFlash()
    runForScenario(scenario.key, scenario.label)
  }

  return (
    <div style={{
      padding: '10px 16px', background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginRight: 4 }}>
        Trigger disruption
      </span>
      {scenarios.map((scenario) => (
        <SimBtn key={scenario.key} onClick={() => handleSim(scenario)}>
          {scenario.label}
        </SimBtn>
      ))}
    </div>
  )
}

function SimBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 4,
        border: '1px solid var(--border2)', background: 'var(--bg3)',
        color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--amber)'
        e.currentTarget.style.color = 'var(--amber)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.color = 'var(--text2)'
      }}
    >
      {children}
    </button>
  )
}
