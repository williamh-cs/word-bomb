import { Link, Navigate, useOutletContext } from 'react-router-dom'

export default function UserPage() {
  const { user } = useOutletContext()
  if (!user) return <Navigate to="/login" replace />

  return (
    <main className="auth-content">
      <section className="auth-card user-profile" aria-labelledby="profile-heading">
        <div className="auth-panel-bar"><span>ADVENTURER'S PROFILE</span><span aria-hidden="true">◆</span></div>
        <span className="profile-circle profile-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
        <p className="eyebrow">Welcome, adventurer</p>
        <h1 id="profile-heading">{user.name}</h1>
        <p className="auth-description">{user.email}</p>
        <Link className="button button-submit-auth" to="/multiplayer">Play multiplayer</Link>
      </section>
    </main>
  )
}
