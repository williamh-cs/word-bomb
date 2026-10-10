import { useNavigate } from 'react-router-dom'
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
      <button
        type="button"
        className="top-bar-username"
        aria-label={user ? `Signed in as ${username}. Sign out` : 'Guest. Go to log in'}
        onClick={handleUsernameClick}
      >
        {username}
      </button>
    </header>
  )
}
