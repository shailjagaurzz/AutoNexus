const USERS_KEY = 'autonexus_users_v1'
const SESSION_KEY = 'autonexus_session_v1'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function parseTrackedSupplies(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    companyName: user.companyName || '',
    role: user.role || '',
    phone: user.phone || '',
    supplyRegion: user.supplyRegion || '',
    trackedSupplies: Array.isArray(user.trackedSupplies) ? user.trackedSupplies : [],
  }
}

export function getUsers() {
  return readJson(USERS_KEY, [])
}

export function getSessionUser() {
  const user = readJson(SESSION_KEY, null)
  return user || null
}

export function registerUser({
  name,
  email,
  password,
  companyName,
  role,
  phone,
  supplyRegion,
  trackedSupplies,
}) {
  const users = getUsers()
  const normalizedEmail = normalizeEmail(email)
  const parsedSupplies = parseTrackedSupplies(trackedSupplies)

  if (!name?.trim()) {
    throw new Error('Name is required')
  }

  if (!companyName?.trim()) {
    throw new Error('Company name is required')
  }

  if (!normalizedEmail) {
    throw new Error('Email is required')
  }

  if (!role?.trim()) {
    throw new Error('Role is required')
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  if (!parsedSupplies.length) {
    throw new Error('Add at least one supply item to track')
  }

  const exists = users.some((u) => normalizeEmail(u.email) === normalizedEmail)
  if (exists) {
    throw new Error('An account with this email already exists')
  }

  const created = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    companyName: companyName.trim(),
    role: role.trim(),
    phone: String(phone || '').trim(),
    supplyRegion: String(supplyRegion || '').trim(),
    trackedSupplies: parsedSupplies,
    password,
  }

  writeJson(USERS_KEY, [created, ...users])
  const sessionUser = sanitizeUser(created)
  writeJson(SESSION_KEY, sessionUser)
  return sessionUser
}

export function loginUser({ email, password }) {
  const users = getUsers()
  const normalizedEmail = normalizeEmail(email)

  const found = users.find(
    (u) => normalizeEmail(u.email) === normalizedEmail && u.password === password
  )

  if (!found) {
    throw new Error('Invalid email or password')
  }

  const sessionUser = sanitizeUser(found)
  writeJson(SESSION_KEY, sessionUser)
  return sessionUser
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}
