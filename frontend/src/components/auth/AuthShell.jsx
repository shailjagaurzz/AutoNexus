export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div
      className="auth-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        background:
          'radial-gradient(circle at 10% 10%, rgba(245,158,11,0.18), transparent 45%), radial-gradient(circle at 85% 80%, rgba(20,184,166,0.16), transparent 40%), var(--bg)',
      }}
    >
      <section
        className="auth-shell-left"
        style={{
          borderRight: '1px solid var(--border)',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(145deg, rgba(13,19,24,0.95) 0%, rgba(8,12,16,0.9) 100%)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 800,
              fontSize: 34,
              letterSpacing: -0.8,
              color: 'var(--text)',
            }}
          >
            AutoNexus
          </div>
          <p
            style={{
              marginTop: 10,
              maxWidth: 360,
              color: 'var(--text2)',
              lineHeight: 1.5,
            }}
          >
            AI-driven disruption monitoring and response for global supply chains.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 12, maxWidth: 380 }}>
          <InfoLine label="Agent Network" value="3 autonomous agents active" />
          <InfoLine label="Coverage" value="312 monitored nodes" />
          <InfoLine label="Avg Mitigation Speed" value="6m 14s" />
        </div>
      </section>

      <section
        className="auth-shell-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div
          className="auth-shell-card"
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '28px 28px 18px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--display)',
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: -0.4,
              }}
            >
              {title}
            </h1>
            <p style={{ marginTop: 8, color: 'var(--text2)' }}>{subtitle}</p>
          </div>

          <div style={{ padding: 28 }}>{children}</div>

          <div
            style={{
              padding: '0 28px 24px',
              color: 'var(--text2)',
              fontSize: 12,
            }}
          >
            {footer}
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoLine({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--border)',
        background: 'var(--bg3)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1, color: 'var(--text3)' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
