// Mock backend. Every auth call goes through this file so it can be swapped for a real API.
const USERS_KEY = 'omnifront.users'
const SESSION_KEY = 'omnifront.session'
const LATENCY_MS = 600

const delay = (ms = LATENCY_MS) => new Promise(resolve => setTimeout(resolve, ms))

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const normalizeEmail = (email) => email.trim().toLowerCase()

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

function createSession(email) {
  const token = `mock.${crypto.randomUUID()}`
  const session = { token, user: { email } }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function signup(email, password) {
  await delay()
  const key = normalizeEmail(email)
  const users = readJson(USERS_KEY, {})
  if (users[key]) throw new Error('An account with this email already exists.')
  users[key] = { passwordHash: await hashPassword(password) }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return createSession(key)
}

export async function login(email, password) {
  await delay()
  const key = normalizeEmail(email)
  const record = readJson(USERS_KEY, {})[key]
  if (!record || record.passwordHash !== await hashPassword(password)) {
    throw new Error('Invalid email or password.')
  }
  return createSession(key)
}

// Returns the saved session if it is still valid, otherwise null.
export async function getSession() {
  const session = readJson(SESSION_KEY, null)
  if (!session?.token || !session.user?.email) return null
  if (!readJson(USERS_KEY, {})[session.user.email]) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return session
}

export async function logout() {
  localStorage.removeItem(SESSION_KEY)
}
