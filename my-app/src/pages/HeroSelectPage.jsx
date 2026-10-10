import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { heroes } from '../data/heroes'
import { useAuth } from '../context/AuthContext'
import useSelectedHero from '../hooks/useSelectedHero'

export default function HeroSelectPage() {
  const { user, loading } = useAuth()
  const { heroId, saveHero } = useSelectedHero()
  const [chosenId, setChosenId] = useState(null)
  const [error, setError] = useState('')
  const selectedHero = heroes.find((hero) => hero.id === (chosenId ?? heroId))
  const { state } = useLocation()
  const navigate = useNavigate()

  if (loading) return <main className="guest-content"><p role="status">Loading your account…</p></main>
  if (!user) return <Navigate to="/multiplayer" replace />

  function confirmHero() {
    if (!selectedHero) return
    if (!saveHero(selectedHero.id)) {
      setError('Could not save your hero. Please allow browser storage and try again.')
      return
    }
    const pending = state?.pendingWaitingRoom
    if (pending?.room) {
      const characters = [...pending.room.playerCharacters]
      characters[pending.currentPlayerIndex] = selectedHero.id
      navigate('/waitingroom', {
        replace: true,
        state: { ...pending, room: { ...pending.room, playerCharacters: characters } },
      })
    } else {
      navigate('/multiplayer')
    }
  }

  return (
    <main className="guest-content hero-select-content">
      <section className="guest-welcome" aria-labelledby="hero-heading">
        <div className="auth-panel-bar" aria-hidden="true">
          <span>WORD BOMB / HERO SELECTION</span>
          <span>◆</span>
        </div>
        <p className="eyebrow">
          {state?.mode === 'host' ? 'Gather your party' : 'Join the adventure'}
        </p>
        <h1 id="hero-heading">Choose your hero</h1>
        <p className="hero-select-description">Four adventurers. Your next chapter. Pick your hero.</p>
      </section>
      <div className="hero-grid" role="group" aria-label="Choose a hero">
        {heroes.map((hero) => (
          <button
            key={hero.id}
            type="button"
            className={`hero-card${selectedHero?.id === hero.id ? ' hero-card-selected' : ''}`}
            aria-pressed={selectedHero?.id === hero.id}
            onClick={() => {
              setChosenId(hero.id)
              setError('')
            }}
          >
            <span className="hero-class">{hero.name}</span>
            <span className="hero-portrait">
              <span className="hero-sprite" style={{ backgroundImage: `url(${hero.image})` }} aria-hidden="true" />
            </span>
            <span className="hero-name">{hero.title}</span>
            <span className="hero-card-status">
              {selectedHero?.id === hero.id ? 'Selected' : 'Choose hero'}
            </span>
          </button>
        ))}
      </div>
      <p className="hero-selection-status" role="status">
        {selectedHero ? `${selectedHero.title} is ready for adventure!` : 'Select Your Hero.'}
      </p>
      {selectedHero && (
        <div className="hero-confirm">
          <button className="button button-submit-auth" type="button" onClick={confirmHero}>
            Confirm
          </button>
        </div>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
      <Link className="button button-how-to-play hero-back" to="/multiplayer">Back to game options</Link>
    </main>
  )
}
