import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const username = user?.username ?? 'Guest'

  async function handleUsernameClick() {
    if (!user) {
      navigate('/login')
      return
    }

    const shouldSignOut = window.confirm(
      'Do you want to sign out and return to the home page?',
    )

    if (!shouldSignOut) return

    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Still clear local session if the request fails.
    }

    setUser(null)
    navigate('/', { replace: true })
  }

  return (
    <header className="top-bar">
      <Link className="top-bar-brand" to="/" aria-label="Word Bomb home">
        <span>WORD BOMB</span>
      </Link>
      {user ? <button
        type="button"
        className="top-bar-username"
        aria-label={`Signed in as ${username}. Sign out`}
        onClick={handleUsernameClick}
      >
        {username}
      </button> : null}
      {!user && (
        <nav className="top-bar-auth" aria-label="Account">
          <Link className="button button-login" to="/login">
            Log In
          </Link>
          <Link className="button button-sign-in" to="/signup">
            Sign Up
          </Link>
        </nav>
      )}
    </header>
  )
}
