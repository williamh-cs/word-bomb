import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const isSignIn = mode === 'signin'
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const endpoint = isSignIn ? '/api/auth/register' : '/api/auth/login'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      setUser(data.user)
      navigate('/multiplayer', { replace: true })
    } catch {
      setError('Could not reach the server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-content">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-panel-bar" aria-hidden="true">
          <span>WORD BOMB / ADVENTURER'S GUILD</span>
          <span>◆</span>
        </div>
        <p className="eyebrow">
          {isSignIn ? 'Begin your adventure' : 'Welcome back, adventurer'}
        </p>
        <h1 id="auth-heading">{isSignIn ? 'Sign in' : 'Log in'}</h1>
        <p className="auth-description">
          {isSignIn
            ? 'Create an account to save your progress and play with friends.'
            : 'Log in to continue your Word Bomb adventure.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder={isSignIn ? 'Choose a username' : 'Enter your username'}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignIn ? 'new-password' : 'current-password'}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-submit-auth"
            type="submit"
            disabled={submitting}
          >
            <span className="auth-button-arrow" aria-hidden="true">▶</span>
            {isSignIn ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignIn ? 'Already have an account?' : 'New to Word Bomb?'}{' '}
          <Link to={isSignIn ? '/login' : '/signin'}>
            {isSignIn ? 'Log in' : 'Sign in'}
          </Link>
        </p>
      </section>
    </main>
  )
}
