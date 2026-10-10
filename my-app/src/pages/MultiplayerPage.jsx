import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Sample rooms until live multiplayer room discovery is connected.
const openRooms = [
  { code: 'FOREST', name: 'Forest clearing', players: 1, capacity: 2 },
  { code: 'TAVERN', name: 'The wandering tavern', players: 2, capacity: 3 },
  { code: 'CASTLE', name: 'Castle courtyard', players: 2, capacity: 4 },
  { code: 'FOREST', name: 'Forest clearing', players: 1, capacity: 2 },
  { code: 'TAVERN', name: 'The wandering tavern', players: 2, capacity: 3 },
  { code: 'CASTLE', name: 'Castle courtyard', players: 2, capacity: 4 }
]

export default function MultiplayerPage() {
  const [guestNumber] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [gameCode, setGameCode] = useState('')
  const [publicRoom, setPublicRoom] = useState('')
  const navigate = useNavigate()
  const { state } = useLocation()

  function chooseHero(mode, code = gameCode.trim()) {
    navigate('/heroes', { state: { mode, gameCode: code, guestNumber } })
  }

  return (
    <main className="guest-content">
      {state?.playAsGuest === true && (
        <p className="multiplayer-guest-greeting">Welcome, Wandering Guest {guestNumber}!</p>
      )}

      <section className="game-options" aria-label="Game options">
        <div className="game-option">
          <p className="eyebrow">Find your party</p>
          <h2>Join public game</h2>
          <p>Meet other adventurers in an open room.</p>
          <p className="game-code-label" id="public-rooms-heading">Open rooms (preview)</p>
          <div className="public-room-list" role="group" aria-labelledby="public-rooms-heading" tabIndex={0}>
            {openRooms.map((room) => (
              <button
                key={room.code}
                className="public-room-card"
                type="button"
                aria-pressed={publicRoom === room.code}
                onClick={() => setPublicRoom(room.code)}
              >
                <span className="public-room-name">{room.name}</span>
                <span className="public-room-details">
                  <span>{room.players}/{room.capacity} players</span>
                  <span>{publicRoom === room.code ? 'Selected' : 'Open'}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            className="button button-join"
            type="button"
            disabled={!publicRoom}
            onClick={() => chooseHero('join', publicRoom)}
          >
            <span className="auth-button-arrow" aria-hidden="true">▶</span>
            Join public game
          </button>
          <p className="public-room-note">Sample rooms for now. Live rooms are coming later.</p>
        </div>

        <div className="game-option game-option-join">
          <p className="eyebrow">Join the adventure</p>
          <h2>Join a game</h2>
          <p>Enter the game code shared by your host.</p>
          <label className="game-code-label" htmlFor="game-code">Game code</label>
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

          <div className="multiplayer-host">
            <p className="eyebrow">Gather your party</p>
            <h2>Host a game</h2>
            <p>Create a room and invite your friends to join.</p>
            <button className="button button-host" type="button" onClick={() => chooseHero('host', '')}>
              <span className="auth-button-arrow" aria-hidden="true">▶</span>
              Host game
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
