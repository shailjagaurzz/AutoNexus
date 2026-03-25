import Badge from '../Badge'
import { useStore } from '../../store/useStore'

const TAG_COLORS = { teal: 'teal', blue: 'blue', amber: 'amber', green: 'green', red: 'red' }
const STATUS_TO_TAG = { executed: 'green', warning: 'amber', rejected: 'red' }
const STATUS_LABEL = { executed: 'Executed', warning: 'Warning', rejected: 'Rejected' }
const STATUS_ICON = { executed: '✅', warning: '⚠️', rejected: '⛔' }

function ActionCard({ action }) {
  const tag = action.tag || STATUS_TO_TAG[action.status] || 'teal'
  const icon = action.icon || STATUS_ICON[action.status] || '🧭'

  return (
    <div style={{
      margin: '6px 14px', padding: '10px 12px', borderRadius: 6,
      border: '1px solid var(--border2)', background: 'var(--bg3)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      animation: 'fadeUp 0.3s ease-out', cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
        background: tag === 'green' ? 'rgba(34,197,94,0.15)' :
                    tag === 'teal'  ? 'rgba(20,184,166,0.15)' :
                    tag === 'amber' ? 'rgba(245,158,11,0.15)' :
                    tag === 'red'   ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
          {action.title}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1.5 }}>
          {action.sub}
        </div>
        <div style={{ marginTop: 5 }}>
          <Badge color={TAG_COLORS[tag] || 'teal'}>{STATUS_LABEL[action.status] || 'Executed'}</Badge>
        </div>
      </div>
    </div>
  )
}

export default function ActionsList() {
  const actions = useStore(s => s.actions)

  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{
        padding: '14px 16px 10px', borderBottom: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text2)' }}>
          Actions Triggered
        </span>
        {actions.length > 0 && (
          <Badge color="green">{actions.length} actions</Badge>
        )}
      </div>
      <div style={{ maxHeight: 160, overflowY: 'auto' }}>
        {actions.length === 0 ? (
          <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)' }}>
            No actions yet
          </div>
        ) : (
          actions.slice(0, 4).map((a, i) => <ActionCard key={i} action={a} />)
        )}
      </div>
    </div>
  )
}
