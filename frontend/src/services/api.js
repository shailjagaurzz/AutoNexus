const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function userHeaders(user) {
  return {
    'Content-Type': 'application/json',
    'x-user-id': user?.id || '',
    'x-user-name': user?.name || '',
    'x-user-company': user?.companyName || '',
    'x-user-email': user?.email || '',
  }
}

async function request(path, { method = 'GET', body, user } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: userHeaders(user),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = `API error: ${res.status}`
    try {
      const payload = await res.json()
      if (payload?.error) message = payload.error
    } catch {
      // no-op
    }
    throw new Error(message)
  }

  return res.json()
}

export function getDashboard(user) {
  return request('/api/dashboard', { user })
}

export function getScenarios(user) {
  return request('/api/disruptions/scenarios', { user })
}

export function getDisruptions(user) {
  return request('/api/disruptions', { user })
}

export function createDisruption(user, disruption) {
  return request('/api/disruptions', {
    method: 'POST',
    body: disruption,
    user,
  })
}

export function startLiveStream(user) {
  return request('/api/live-stream/start', {
    method: 'POST',
    body: { userId: user?.id },
    user,
  })
}

export function stopLiveStream(user) {
  return request('/api/live-stream/stop', {
    method: 'POST',
    body: { userId: user?.id },
    user,
  })
}

export function getLiveStreamStatus(userId) {
  return request(`/api/live-stream/status/${userId}`)
}
