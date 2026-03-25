const COLORS = {
  red:   { bg: 'rgba(239,68,68,0.15)',   text: 'var(--red)',   border: 'rgba(239,68,68,0.3)' },
  amber: { bg: 'rgba(245,158,11,0.15)',  text: 'var(--amber)', border: 'rgba(245,158,11,0.3)' },
  green: { bg: 'rgba(34,197,94,0.15)',   text: 'var(--green)', border: 'rgba(34,197,94,0.3)' },
  teal:  { bg: 'rgba(20,184,166,0.15)',  text: 'var(--teal)',  border: 'rgba(20,184,166,0.3)' },
  blue:  { bg: 'rgba(59,130,246,0.15)',  text: 'var(--blue)',  border: 'rgba(59,130,246,0.3)' },
}

export default function Badge({ color = 'amber', children, style = {} }) {
  const c = COLORS[color] || COLORS.amber
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 10,
      fontFamily: 'var(--mono)', fontWeight: 500,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      ...style,
    }}>
      {children}
    </span>
  )
}
