import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user } = useAuth()
  const username = user?.username ?? 'Guest'

  return (
    <header className="top-bar">
      <p className="top-bar-username" aria-label="Signed in as">
        {username}
      </p>
    </header>
  )
}
