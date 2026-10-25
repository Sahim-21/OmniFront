import { Navigate } from 'react-router-dom'
import { Cpu } from 'lucide-react'
import { useAuth } from './useAuth.js'

function AuthLoading() {
  return (
    <div className="w-screen h-screen bg-[var(--bg)] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--logo-from)] to-[var(--logo-to)] flex items-center justify-center animate-pulse">
        <Cpu className="w-5 h-5 text-[var(--text)]" />
      </div>
    </div>
  )
}

// No session -> /login
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Logged-in users skip the login page -> /
export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <AuthLoading />
  if (user) return <Navigate to="/" replace />
  return children
}
