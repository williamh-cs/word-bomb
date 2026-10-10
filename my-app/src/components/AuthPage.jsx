import { Link, useNavigate, useOutletContext } from 'react-router-dom'

export default function AuthPage({ mode }) {
  const isSignIn = mode === 'signin'
  const navigate = useNavigate()
  const { signIn } = useOutletContext()

  function handleSubmit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim()
    const name = isSignIn ? String(data.get('username')).trim() : email.split('@')[0]
    signIn({ name: name || 'Adventurer', email })
    navigate('/multiplayer', { replace: true })
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

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {isSignIn && (
            <>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                required
              />
            </>
          )}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignIn ? 'new-password' : 'current-password'}
            placeholder="Enter your password"
            required
          />
          <button className="button button-submit-auth" type="submit">
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
