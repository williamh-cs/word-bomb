import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const [showInstructions, setShowInstructions] = useState(false)
  const instructionsRef = useRef(null)

  return (
    <main className="home-content">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-hero-copy">
          <p className="eyebrow">Think fast</p>
          <h1 id="home-heading">DRAGON'S EGG</h1>
          <div className="home-hero-actions">
            <Link className="button button-play" to="/multiplayer" state={{ playAsGuest: !user }}>
              {user ? 'Play' : 'Play as Guest'}
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
              How to Play
            </button>
          </div>
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
              if (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
              ) {
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
            <li>On your turn, form a new English word containing the last two letters of the current word anywhere, together and in the same order. For example, forest → faster uses ST.</li>
            <li>No word can be repeated during the game, including the starting word.</li>
            <li>Keep it respectful. Slurs are not allowed.</li>
            <li>You have 15 seconds to submit a valid word. If time runs out, you lose a life.</li>
            <li>Each player has 3 lives. Lose all 3 and you are out of the game.</li>
            <li>Each submitted word becomes the new word for the next player's turn.</li>
          </ol>
        </dialog>
      </section>
    </main>
  )
}
