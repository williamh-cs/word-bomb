import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

function Header() {
  return (
    <header className="top-bar">
      <Link className="brand" to="/" aria-label="Word Bomb home">
        Word Bomb
      </Link>

      <nav className="top-bar-actions" aria-label="Account">
        <button className="button button-guest" type="button">
          Play as guest
        </button>
        <Link className="button button-sign-in" to="/signin">
          Sign in
        </Link>
        <Link className="button button-login" to="/login">
          Log in
        </Link>
      </nav>
    </header>
  )
}

function HomePage() {
  return (
    <main className="home-content">

    </main>
  )
}

function AuthPage({ mode }) {
  const isSignIn = mode === 'signin'

  return (
    <main className="auth-content">
      <section className="auth-card" aria-labelledby="auth-heading">
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
          onSubmit={(event) => event.preventDefault()}
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

function NotFoundPage() {
  return (
    <main className="home-content">
      <p className="eyebrow">That path leads nowhere</p>
      <h1>Page not found</h1>
      <Link className="button button-play" to="/">
        Return home
      </Link>
    </main>
  )
}

function App() {
  return (
    <div className="home-page">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
