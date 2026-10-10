import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GuestPage() {
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
