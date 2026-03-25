import { useRef } from 'react'
import { useStore } from '../../store/useStore'

const TYPE_COLOR = {
  ok:   'var(--teal)',
  warn: 'var(--amber)',
  info: 'var(--text2)',
}

export default function ActivityLog() {
  const logs = useStore(s => s.logs)
  const logRef = useRef(null)

  return (
    <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)' }}>
          Activity Log
        </span>
      </div>
      <div ref={logRef} style={{ maxHeight: 120, overflowY: 'auto', padding: '4px 0' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '10px 14px', color: 'var(--text3)', fontSize: 11 }}>
            No activity recorded yet.
          </div>
        ) : (
          logs.slice(0, 10).map((l, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '3px 14px',
              borderBottom: '1px solid rgba(30,42,53,0.5)',
              animation: i === 0 ? 'fadeUp 0.2s ease-out' : 'none',
            }}>
              <span style={{ color: 'var(--text3)', fontSize: 10, flexShrink: 0, width: 58, fontFamily: 'var(--mono)' }}>
                {l.t}
              </span>
              <span style={{ color: TYPE_COLOR[l.type] || 'var(--text2)', fontSize: 10, flex: 1, lineHeight: 1.5 }}>
                {l.msg}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
