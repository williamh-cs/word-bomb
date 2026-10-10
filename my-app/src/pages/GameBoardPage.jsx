import { Link, useLocation } from 'react-router-dom'
import { gameBackgrounds } from '../data/gameBackgrounds'
import guestPlayer from '../guest_player.png'

export default function GameBoardPage({ playerCount = 2 }) {
  const { state } = useLocation()
  const hasGuest = state?.playAsGuest === true && state?.heroId === 'guest_player'
  const count = [2, 3, 4].includes(playerCount) ? playerCount : 2

  return (
    <main className="game-board-page">
      <div className="game-board-toolbar">
        <div>
          <p className="eyebrow">The word arena</p>
          <h1>Game board</h1>
        </div>
        <Link className="button button-how-to-play hero-back" to="/">Back to home</Link>
      </div>
      <section
        className={`game-board-scene game-board-scene-${count}`}
        style={{ backgroundImage: `url(${gameBackgrounds[count]})` }}
        aria-label={`${count}-player game board preview`}
      >
        <div className="board-preview-label">BOARD PREVIEW / {count} PLAYERS</div>
        <div className="board-player-slots" aria-label="Player slots">
          {Array.from({ length: count }, (_, index) => (
            <div className="board-player-slot" key={index}>
              {index === 0 && hasGuest ? (
                <>
                  <span className="board-guest-portrait" role="img" aria-label="Guest character">
                    <span className="hero-sprite" style={{ backgroundImage: `url(${guestPlayer})` }} />
                  </span>
                  <span>Wandering Guest {state.guestNumber}</span>
                  <span className="board-player-status">Guest adventurer</span>
                </>
              ) : (
                <>
                  <span className="board-player-number" aria-hidden="true">P{index + 1}</span>
                  <span>Player {index + 1}</span>
                  <span className="board-player-status">Waiting for hero</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="board-word-panel">
          <p className="eyebrow">Starting word</p>
          <h2>FORE<span>ST</span></h2>
          <p>Form a word starting with <strong>ST</strong></p>
          <span className="board-waiting">Waiting for players</span>
        </div>
      </section>
      <p className="board-preview-note">A glimpse of the arena. The word chain begins when your party is ready.</p>
    </main>
  )
}
