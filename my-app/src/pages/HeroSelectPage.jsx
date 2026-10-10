import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { heroes } from '../data/heroes'

export default function HeroSelectPage() {
  const [selectedHero, setSelectedHero] = useState(null)
  const { state } = useLocation()

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
            onClick={() => setSelectedHero(hero)}
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
          <button className="button button-submit-auth" type="button">
            Confirm
          </button>
        </div>
      )}
      <Link className="button button-how-to-play hero-back" to="/multiplayer">Back to game options</Link>
    </main>
  )
}
