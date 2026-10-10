import { useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import maleKnight from './assets/male_knight.png'
import femaleKnight from './assets/female_knight.png'
import maleMage from './assets/male_mage.png'
import femaleMage from './assets/female_mage.png'
import './App.css'

function Header() {
  return (
    <header className="top-bar">
      <Link className="brand" to="/" aria-label="Word Bomb home">
        Word Bomb
      </Link>

      <nav className="top-bar-actions" aria-label="Account">
        <Link className="button button-guest" to="/guest">
          Play as guest
        </Link>
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
  const [showInstructions, setShowInstructions] = useState(false)
  const instructionsRef = useRef(null)

  return (
    <main className="home-content">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-hero-copy">
          <p className="eyebrow">Think fast</p>
          <h1 id="home-heading">WORD BOMB</h1>
          <div className="home-hero-actions">
            <Link className="button button-play" to="/guest">
              Play as guest
            </Link>
            <button
              className="button button-how-to-play"
              type="button"
              aria-expanded={showInstructions}
              aria-haspopup="dialog"
              aria-controls="how-to-play"
              onClick={() => {
                instructionsRef.current.showModal()
                setShowInstructions(true)
              }}
            >
              <span className="help-icon" aria-hidden="true">?</span>
              How to play
            </button>
          </div>
            <dialog
              ref={instructionsRef}
              className="how-to-play"
              id="how-to-play"
              aria-labelledby="how-to-play-heading"
              onClose={() => setShowInstructions(false)}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  const bounds = event.currentTarget.getBoundingClientRect()
                  if (event.clientX < bounds.left || event.clientX > bounds.right ||
                      event.clientY < bounds.top || event.clientY > bounds.bottom) {
                    event.currentTarget.close()
                  }
                }
              }}
            >
              <form method="dialog" className="how-to-play-close">
                <button className="button" type="submit" aria-label="Close how to play">
                  <span aria-hidden="true">×</span>
                </button>
              </form>
              <h2 id="how-to-play-heading">How to play</h2>
              <ol>
                <li>The game generates a starting word.</li>
                <li>Form a new word that starts with the last letters of the previous word.</li>
                <li>Submit your word before the time limit runs out.</li>
                <li>Keep the chain going: each new word becomes the starting point for the next turn!</li>
              </ol>
            </dialog>
        </div>
      </section>
    </main>
  )
}

function GuestPage() {
  const [guestNumber] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [gameCode, setGameCode] = useState('')
  const navigate = useNavigate()

  function chooseHero(mode) {
    navigate('/heroes', { state: { mode, gameCode: gameCode.trim(), guestNumber } })
  }

  return (
    <main className="guest-content">
      <section className="guest-welcome" aria-labelledby="guest-heading">
        <div className="auth-panel-bar" aria-hidden="true">
          <span>WORD BOMB / ADVENTURER'S GUILD</span>
          <span>◆</span>
        </div>
        <p className="eyebrow">Your adventure begins here</p>
        <h1 id="guest-heading">Welcome!</h1>
        <p className="guest-name">Wandering Guest {guestNumber}</p>
      </section>

      <section className="game-options" aria-label="Game options">
        <div className="game-option">
          <p className="eyebrow">Gather your party</p>
          <h2>Host a game</h2>
          <p>Create a room and invite your friends to join.</p>
          <button className="button button-host" type="button" onClick={() => chooseHero('host')}>
            <span className="auth-button-arrow" aria-hidden="true">▶</span>
            Host game
          </button>
        </div>

        <div className="game-option game-option-join">
          <p className="eyebrow">Join the adventure</p>
          <h2>Join a game</h2>
          <p>Enter the game code shared by your host.</p>
          <label className="game-code-label" htmlFor="game-code">
            Game code
          </label>
          <input
            id="game-code"
            className="game-code-input"
            type="text"
            placeholder="Enter game code"
            autoComplete="off"
            value={gameCode}
            onChange={(event) => setGameCode(event.target.value)}
          />
          <button className="button button-join" type="button" onClick={() => chooseHero('join')}>
            <span className="auth-button-arrow" aria-hidden="true">▶</span>
            Join game
          </button>
        </div>
      </section>
    </main>
  )
}

const heroes = [
  { id: 'male-knight', name: 'Knight', title: 'Wylder', image: maleKnight },
  { id: 'female-knight', name: 'Knight', title: 'Duchess', image: femaleKnight },
  { id: 'male-mage', name: 'Mage', title: 'Scholar', image: maleMage },
  { id: 'female-mage', name: 'Mage', title: 'Recluse', image: femaleMage },
]

function HeroSelectPage() {
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
      <Link className="button button-how-to-play hero-back" to="/guest">Back to game options</Link>
    </main>
  )
}

function AuthPage({ mode }) {
  const isSignIn = mode === 'signin'

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

function PageTransition({ children }) {
  const location = useLocation()

  return (
    <div className="page-transition" key={location.pathname}>
      <div className="page-magic" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => (
          <span
            className="magic-sparkle"
            key={index}
            style={{
              '--x': `${(index * 37 + 11) % 100}%`,
              '--y': `${(index * 23 + 7) % 100}%`,
              '--delay': `${(index % 6) * 45}ms`,
              '--size': `${8 + (index % 4) * 4}px`,
              '--drift': `${(index % 2 === 0 ? 1 : -1) * (18 + index % 5 * 8)}px`,
            }}
          />
        ))}
      </div>
      <div className="page-transition-content">{children}</div>
    </div>
  )
}

function App() {
  return (
    <div className="home-page">
      <Header />
      <PageTransition>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/heroes" element={<HeroSelectPage />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>
    </div>
  )
}

export default App
