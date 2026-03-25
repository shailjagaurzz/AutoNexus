import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { startLiveStream, stopLiveStream } from '../../services/api'

export default function LiveStreamControl() {
  const { user } = useAuth()
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleStream = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      if (streaming) {
        await stopLiveStream(user)
      } else {
        await startLiveStream(user)
      }
      setStreaming(!streaming)
    } catch (error) {
      console.error('Error controlling stream:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      fontSize: 12,
    }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: streaming ? 'var(--green)' : 'var(--text2)',
        animation: streaming ? 'blink 1s ease-in-out infinite' : 'none',
      }} />
      <span style={{ color: streaming ? 'var(--green)' : 'var(--text2)' }}>
        {streaming ? 'Live' : 'Offline'}
      </span>
      <button
        onClick={toggleStream}
        disabled={loading}
        style={{
          background: streaming ? 'var(--red)' : 'var(--green)',
          color: '#fff',
          border: 'none',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? '...' : streaming ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
