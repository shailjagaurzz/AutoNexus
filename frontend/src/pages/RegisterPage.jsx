import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import { useAuth } from '../auth/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    role: '',
    phone: '',
    supplyRegion: '',
    trackedSupplies: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: form.name,
        companyName: form.companyName,
        role: form.role,
        phone: form.phone,
        supplyRegion: form.supplyRegion,
        trackedSupplies: form.trackedSupplies,
        email: form.email,
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create Account"
      subtitle="Register your team member account to access AutoNexus."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--amber2)' }}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <FieldLabel htmlFor="name">Full Name</FieldLabel>
        <TextInput
          id="name"
          type="text"
          placeholder="Alex Johnson"
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
          autoComplete="name"
          required
        />

        <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
        <TextInput
          id="companyName"
          type="text"
          placeholder="Nexus Logistics"
          value={form.companyName}
          onChange={(event) => setField('companyName', event.target.value)}
          required
        />

        <FieldLabel htmlFor="role">Role</FieldLabel>
        <TextInput
          id="role"
          type="text"
          placeholder="Supply Chain Manager"
          value={form.role}
          onChange={(event) => setField('role', event.target.value)}
          required
        />

        <FieldLabel htmlFor="phone">Phone</FieldLabel>
        <TextInput
          id="phone"
          type="tel"
          placeholder="+1 555 012 3312"
          value={form.phone}
          onChange={(event) => setField('phone', event.target.value)}
        />

        <FieldLabel htmlFor="supplyRegion">Primary Supply Region</FieldLabel>
        <TextInput
          id="supplyRegion"
          type="text"
          placeholder="North America"
          value={form.supplyRegion}
          onChange={(event) => setField('supplyRegion', event.target.value)}
        />

        <FieldLabel htmlFor="trackedSupplies">Supplies To Track</FieldLabel>
        <TextInput
          id="trackedSupplies"
          type="text"
          placeholder="Copper, Lithium, Engine Control Units"
          value={form.trackedSupplies}
          onChange={(event) => setField('trackedSupplies', event.target.value)}
          required
        />

        <FieldLabel htmlFor="email">Work Email</FieldLabel>
        <TextInput
          id="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
          autoComplete="email"
          required
        />

        <FieldLabel htmlFor="password">Password</FieldLabel>
        <TextInput
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(event) => setField('password', event.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
        />

        <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
        <TextInput
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          autoComplete="new-password"
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
            border: '1px solid rgba(20,184,166,0.45)',
            borderRadius: 10,
            background: 'linear-gradient(90deg, rgba(20,184,166,0.26), rgba(59,130,246,0.2))',
            color: 'var(--text)',
            fontWeight: 700,
            letterSpacing: 0.4,
            padding: '11px 12px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
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
