import { useState } from 'react'
import { Cpu, Loader2 } from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'
import { useToast } from '../toast/useToast.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email, password) {
  const errors = {}
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.'
  if (password.length < 6) errors.password = 'Password must be at least 6 characters.'
  return errors
}

function Login() {
  const { login, signup } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(email, password)
  const isSignup = mode === 'signup'

  const switchMode = (next) => {
    setMode(next)
    setSubmitError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setTouched({ email: true, password: true })
    setSubmitError('')
    if (errors.email || errors.password) return

    setSubmitting(true)
    try {
      await (isSignup ? signup : login)(email, password)
    } catch (err) {
      const message = err.message || 'Something went wrong. Please try again.'
      setSubmitError(message)
      toast.error(message)
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full bg-[var(--chip-fill)] border rounded-xl px-3.5 min-h-11 py-2.5 text-base sm:text-xs text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--accent-ring-20)] ${
      touched[field] && errors[field]
        ? 'border-[var(--danger)]'
        : 'border-[var(--border-subtle)] focus:border-[var(--accent-border-40)]'
    }`

  const tabClass = (active) =>
    `flex-1 min-h-11 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer border ${
      active
        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border-25)]'
        : 'text-[var(--text-muted)] hover:text-[var(--text)] border-transparent'
    }`

  return (
    <div className="fixed inset-0 bg-[var(--bg)] overflow-y-auto overflow-x-hidden text-[var(--text)]">
      <div className="min-h-full flex items-center justify-center p-4 relative">
      <div className="fixed top-10 left-10 w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full blur-[80px] md:blur-[130px] pointer-events-none ambient-glow-1"></div>
      <div className="fixed bottom-10 right-10 w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full blur-[80px] md:blur-[130px] pointer-events-none ambient-glow-2"></div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative z-10 w-full max-w-sm bg-[var(--surface-glass-45)] backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl rounded-3xl p-5 sm:p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--logo-from)] to-[var(--logo-to)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow-5)]">
            <Cpu className="w-4.5 h-4.5 text-[var(--text)]" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-wide">OmniRAG</span>
            <span className="block text-[10px] text-[var(--success-muted)] font-mono tracking-wider font-semibold">LOCAL ENGINE</span>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-[var(--surface-glass-60)] border border-[var(--border-subtle)] rounded-2xl p-1">
          <button type="button" aria-pressed={!isSignup} onClick={() => switchMode('login')} className={tabClass(!isSignup)}>Login</button>
          <button type="button" aria-pressed={isSignup} onClick={() => switchMode('signup')} className={tabClass(isSignup)}>Sign up</button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              placeholder="you@example.com"
              aria-invalid={!!(touched.email && errors.email)}
              className={inputClass('email')}
            />
            {touched.email && errors.email && (
              <p className="mt-1.5 text-[11px] text-[var(--danger)]">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              placeholder="At least 6 characters"
              aria-invalid={!!(touched.password && errors.password)}
              className={inputClass('password')}
            />
            {touched.password && errors.password && (
              <p className="mt-1.5 text-[11px] text-[var(--danger)]">{errors.password}</p>
            )}
          </div>
        </div>

        {submitError && (
          <p role="alert" className="mt-4 px-3 py-2 rounded-xl bg-[var(--danger-soft)] border border-[var(--danger)] text-[11px] text-[var(--danger)]">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full min-h-11 py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-70 disabled:cursor-not-allowed text-[var(--text)] text-xs font-semibold tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_var(--accent-glow-15)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create account' : 'Login')}
        </button>
      </form>
      </div>
    </div>
  )
}

export default Login
