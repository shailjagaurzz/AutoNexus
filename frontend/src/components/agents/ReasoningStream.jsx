import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

const AGENT_STYLES = {
  Detection: { bg: 'rgba(239,68,68,0.2)',  border: 'rgba(239,68,68,0.4)',  text: 'var(--red)' },
  Impact:    { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.4)', text: 'var(--amber)' },
  Decision:  { bg: 'rgba(20,184,166,0.2)', border: 'rgba(20,184,166,0.4)', text: 'var(--teal)' },
  Action:    { bg: 'rgba(34,197,94,0.2)',  border: 'rgba(34,197,94,0.4)',  text: 'var(--green)' },
}

function AgentStep({ step, isLast }) {
  const s = AGENT_STYLES[step.agent] || AGENT_STYLES.Detection

  // Highlight keywords in text
  const highlighted = step.text
    .replace(/✓ (.+)/g, '<span style="color:var(--green)">✓ $1</span>')
    .replace(/ALERT:|SIGNAL:|NEWS SIGNAL:|REGULATORY:/g, m => `<span style="color:var(--red)">${m}</span>`)

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, animation: 'fadeUp 0.3s ease-out' }}>
      {/* Icon */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 8, fontWeight: 700, marginTop: 2,
        background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      }}>
        {step.icon}
      </div>
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>
          {step.agent} Agent
        </div>
        <div
          style={{ color: 'var(--text)', fontSize: 11, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        {/* Blinking cursor on last step if not done */}
        {isLast && !step.done && (
          <span style={{
            display: 'inline-block', width: 6, height: 11,
            background: 'var(--amber)', verticalAlign: 'middle',
            animation: 'cursorBlink 0.9s step-end infinite', marginLeft: 3,
          }} />
        )}
      </div>
    </div>
  )
}

export default function ReasoningStream() {
  const steps       = useStore(s => s.reasoningSteps)
  const agentStatus = useStore(s => s.agentStatus)
  const streamRef   = useRef(null)

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [steps])

  const statusBadge = {
    monitoring: { label: 'Monitoring', color: 'var(--text3)', border: 'var(--border)' },
    analyzing:  { label: 'Analyzing…', color: 'var(--amber)', border: 'rgba(245,158,11,0.4)' },
    done:       { label: 'Action taken', color: 'var(--green)', border: 'rgba(34,197,94,0.4)' },
  }[agentStatus] || {}

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)' }}>
          Agent Reasoning
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 10,
          color: statusBadge.color, border: `1px solid ${statusBadge.border}`,
          background: 'transparent', fontFamily: 'var(--mono)',
          animation: agentStatus === 'analyzing' ? 'blink 1.5s ease-in-out infinite' : 'none',
        }}>
          {statusBadge.label}
        </span>
      </div>

      {/* Stream */}
      <div ref={streamRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {steps.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 11, textAlign: 'center', marginTop: 24, lineHeight: 2 }}>
            All systems nominal<br />Awaiting disruption signals…
          </div>
        ) : (
          steps.map((step, i) => (
            <AgentStep key={i} step={step} isLast={i === steps.length - 1} />
          ))
        )}
      </div>
    </div>
  )
}
