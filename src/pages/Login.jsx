// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, loginUser } from '../firebase/services'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'

export default function Login() {
  const [tab,  setTab]  = useState('login')
  const [lf,   setLf]   = useState({ email: '', password: '' })
  const [sf,   setSf]   = useState({ name: '', email: '', password: '', confirm: '' })
  const [err,  setErr]   = useState('')
  const [busy, setBusy]  = useState(false)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Already logged in? Redirect
  if (user) {
    navigate(isAdmin ? '/admin' : '/dashboard', { replace: true })
    return null
  }

  const login = async () => {
    setErr('')
    if (!lf.email || !lf.password) return setErr('Please enter email and password.')
    setBusy(true)
    try {
      await loginUser({ email: lf.email, password: lf.password })
      toast.success('Welcome back! 👋')
      // Auth context will redirect via useEffect in App
    } catch (e) {
      setErr(e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found'
        ? 'Invalid email or password. Please try again.'
        : 'Login failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  const signup = async () => {
    setErr('')
    if (!sf.name.trim())  return setErr('Please enter your name.')
    if (!sf.email.trim()) return setErr('Please enter your email.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sf.email)) return setErr('Please enter a valid email.')
    if (sf.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (sf.password !== sf.confirm) return setErr('Passwords do not match.')
    setBusy(true)
    try {
      await registerUser({ name: sf.name.trim(), email: sf.email.trim(), password: sf.password })
      toast.success(`Welcome, ${sf.name}! 🎉`)
    } catch (e) {
      setErr(e.code === 'auth/email-already-in-use'
        ? 'An account already exists with this email.'
        : 'Sign-up failed: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="card auth-card">
        <div className="auth-logo">
          <img src={logo} alt="CodeNest Dev" />
          <h2>CodeNest Dev</h2>
          <p>Smart Web Development · Client Portal</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setErr('') }}>
            Login
          </button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setErr('') }}>
            Sign Up
          </button>
        </div>

        {err && <div className="alert alert-error">⚠️ {err}</div>}

        {tab === 'login' ? (
          <>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@email.com"
                value={lf.email} onChange={e => setLf({ ...lf, email: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && login()} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={lf.password} onChange={e => setLf({ ...lf, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && login()} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={login} disabled={busy}>
              {busy ? '⏳ Signing in...' : 'Login →'}
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="Your Name"
                value={sf.name} onChange={e => setSf({ ...sf, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@email.com"
                value={sf.email} onChange={e => setSf({ ...sf, email: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="Min 6 chars"
                  value={sf.password} onChange={e => setSf({ ...sf, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input className="form-control" type="password" placeholder="Re-enter"
                  value={sf.confirm} onChange={e => setSf({ ...sf, confirm: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && signup()} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={signup} disabled={busy}>
              {busy ? '⏳ Creating...' : 'Create Account 🚀'}
            </button>
          </>
        )}

        <div className="auth-back">
          <a href="/" onClick={e => { e.preventDefault(); navigate('/') }}>← Back to Website</a>
        </div>
        <div className="auth-hint">

        </div>
      </div>
    </div>
  )
}
