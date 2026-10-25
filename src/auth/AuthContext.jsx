import { useState, useEffect, useCallback, useMemo } from 'react'
import * as authApi from './mockAuthApi.js'
import { AuthContext } from './context.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the saved session on app start
  useEffect(() => {
    let cancelled = false
    authApi.getSession()
      .then(session => { if (!cancelled) setUser(session?.user ?? null) })
      .catch(() => { if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const session = await authApi.login(email, password)
    setUser(session.user)
  }, [])

  const signup = useCallback(async (email, password) => {
    const session = await authApi.signup(email, password)
    setUser(session.user)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, login, signup, logout, loading }),
    [user, login, signup, logout, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
