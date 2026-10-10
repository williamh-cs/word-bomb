import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import PageTransition from './PageTransition'

export default function AppLayout() {
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('word-bomb-user'))
      return typeof saved?.name === 'string' ? saved : null
    } catch {
      return null
    }
  })

  function signIn(profile) {
    setUser(profile)
    try {
      sessionStorage.setItem('word-bomb-user', JSON.stringify(profile))
    } catch { /* The in-memory profile still works if storage is unavailable. */ }
  }

  return (
    <div className="home-page">
      <Header user={user} />
      <PageTransition>
        <Outlet context={{ user, signIn }} />
      </PageTransition>
    </div>
  )
}
