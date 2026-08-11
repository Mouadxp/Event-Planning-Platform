import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7137'

function getErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (payload.errors) {
    if (Array.isArray(payload.errors)) {
      return payload.errors.join(' ')
    }

    if (typeof payload.errors === 'object') {
      const fieldErrors = Object.values(payload.errors).flat().join(' ')
      if (fieldErrors) {
        return fieldErrors
      }
    }
  }

  if (typeof payload.title === 'string' && payload.title.trim()) {
    return payload.title
  }

  return fallbackMessage
}

function LandingPage({ onGoToLogin, onGoToRegister }) {
  return (
    <section className="landing-page">
      <p className="badge">Event Planning Platform</p>
      <h1>Create, discover, and manage events in your local area</h1>
      <p className="lead">
        Built around your backend resources: <strong>Events</strong>, <strong>Venues</strong>, and <strong>Attendees</strong>.
      </p>

      <div className="cta-group">
        <button type="button" className="btn btn-primary" onClick={onGoToRegister}>
          Get Started
        </button>
        <button type="button" className="btn btn-secondary" onClick={onGoToLogin}>
          Login
        </button>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <h2>For registered users</h2>
          <ul>
            <li>RSVP to upcoming events</li>
            <li>View local events</li>
            <li>Create your own events</li>
          </ul>
        </article>
        <article className="feature-card">
          <h2>For admins</h2>
          <ul>
            <li>Manage event categories</li>
            <li>Moderate submissions</li>
            <li>Keep event quality high</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

function AuthPage({ mode, onSwitchMode, onBackToHome }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setErrorMessage('')
    setSuccessMessage('')
  }, [mode])

  const endpoint = useMemo(
    () => (mode === 'register' ? '/api/auth/register' : '/api/auth/login'),
    [mode]
  )

  const title = mode === 'register' ? 'Create an account' : 'Welcome back'
  const submitLabel = mode === 'register' ? 'Register' : 'Login'
  const switchPrompt = mode === 'register' ? 'Already have an account?' : "Don't have an account?"
  const switchLabel = mode === 'register' ? 'Go to Login' : 'Go to Register'

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(getErrorMessage(payload, 'Authentication failed. Please try again.'))
        return
      }

      const token = payload?.token
      if (token) {
        localStorage.setItem('eventPlannerToken', token)
      }

      setSuccessMessage(
        mode === 'register'
          ? 'Registration successful. Your token has been saved locally.'
          : 'Login successful. Your token has been saved locally.'
      )
      setPassword('')
    } catch {
      setErrorMessage('Could not reach the API. Confirm your backend is running and CORS is enabled.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <button type="button" className="back-link" onClick={onBackToHome}>
        ← Back to landing page
      </button>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{title}</h1>
        <p className="subtle">
          Endpoint: <code>{endpoint}</code>
        </p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            minLength={mode === 'register' ? 6 : undefined}
            placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Your password'}
          />
        </label>

        {errorMessage ? <p className="message error">{errorMessage}</p> : null}
        {successMessage ? <p className="message success">{successMessage}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Submitting...' : submitLabel}
        </button>

        <p className="switch-row">
          <span>{switchPrompt}</span>
          <button type="button" className="text-button" onClick={onSwitchMode}>
            {switchLabel}
          </button>
        </p>
      </form>
    </section>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    function handleLocationChange() {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  function navigate(nextPath) {
    if (nextPath === window.location.pathname) return
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  if (path === '/login' || path === '/register') {
    return (
      <AuthPage
        mode={path === '/register' ? 'register' : 'login'}
        onSwitchMode={() => navigate(path === '/register' ? '/login' : '/register')}
        onBackToHome={() => navigate('/')}
      />
    )
  }

  if (path !== '/') {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <h1>Page not found</h1>
          <p className="subtle">The page you requested does not exist.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
            Go to landing page
          </button>
        </div>
      </section>
    )
  }

  return (
    <LandingPage
      onGoToLogin={() => navigate('/login')}
      onGoToRegister={() => navigate('/register')}
    />
  )
}

export default App
