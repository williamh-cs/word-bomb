import { Link, useLocation } from 'react-router-dom'
import { gameBackgrounds } from '../data/gameBackgrounds'
import guestPlayer from '../assets/guest_player.png'
import { heroes } from '../data/heroes'
import BoardCharacter from '../components/BoardCharacter'

export default function GameBoardPage({ playerCount = 2 }) {
  const { state } = useLocation()
  const room = state?.room
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
          {Array.from({ length: count }, (_, index) => {
            const name = room?.playerNames?.[index] ?? `Player ${index + 1}`
            const characterId = room?.playerCharacters?.[index]
            const isGuest = characterId === 'guest-player'
              || /^Guest\b/i.test(name)
              || !characterId
            const hero = heroes.find((entry) => entry.id === characterId)
              ?? heroes[0]
            const isOccupied = !room || Boolean(room.playerNames?.[index])
            const image = isGuest ? guestPlayer : hero.image
            const characterName = isGuest ? 'Guest player' : hero.title

            return (
            <div className="board-player-slot" key={index}>
              {isOccupied && (
                <BoardCharacter image={image} label={`${name}'s character: ${characterName}`} />
              )}
              <span className="board-player-name">{isOccupied ? name : 'Waiting for player'}</span>
            </div>
            )
          })}
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
