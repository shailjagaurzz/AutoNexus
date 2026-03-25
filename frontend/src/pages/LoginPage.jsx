import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/'

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue to your disruption command center."
      footer={
        <>
          New to AutoNexus?{' '}
          <Link to="/register" style={{ color: 'var(--amber2)' }}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <FieldLabel htmlFor="email">Work Email</FieldLabel>
        <TextInput
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <FieldLabel htmlFor="password">Password</FieldLabel>
        <TextInput
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error ? (
          <div
            style={{
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.1)',
              borderRadius: 8,
              padding: '8px 10px',
              color: 'var(--red)',
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: 8,
            border: '1px solid rgba(245,158,11,0.45)',
            borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(245,158,11,0.28), rgba(20,184,166,0.2))',
            color: 'var(--text)',
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: '11px 12px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthShell>
  )
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--text2)' }}>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        border: '1px solid var(--border2)',
        borderRadius: 10,
        background: 'var(--bg3)',
        color: 'var(--text)',
        padding: '11px 12px',
        outline: 'none',
      }}
    />
  )
}
