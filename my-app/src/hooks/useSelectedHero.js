import { useSyncExternalStore } from 'react'
import { useAuth } from '../context/AuthContext'
import { heroes } from '../data/heroes'

function subscribe(callback) {
  window.addEventListener('storage', callback)
  window.addEventListener('wordbomb-hero-changed', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('wordbomb-hero-changed', callback)
  }
}

export default function useSelectedHero() {
  const { user } = useAuth()
  const key = user?.id ? `wordbomb:hero:${user.id}` : null
  const heroId = useSyncExternalStore(subscribe, () => {
    if (!key) return null
    try {
      const saved = localStorage.getItem(key)
      return heroes.some((hero) => hero.id === saved) ? saved : null
    } catch {
      return null
    }
  }, () => null)

  function saveHero(id) {
    if (!key || !heroes.some((hero) => hero.id === id)) return false
    try {
      localStorage.setItem(key, id)
      window.dispatchEvent(new Event('wordbomb-hero-changed'))
      return true
    } catch {
      return false
    }
  }

  return { heroId, saveHero }
}
