import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [showInstructions, setShowInstructions] = useState(false)
  const instructionsRef = useRef(null)

  return (
    <main className="home-content">
      <section className="home-hero" aria-labelledby="home-heading">
        <button
          className="how-to-play-symbol"
          type="button"
          aria-label="How to play"
          aria-expanded={showInstructions}
          aria-haspopup="dialog"
          aria-controls="how-to-play"
          onClick={() => {
            instructionsRef.current.showModal()
            setShowInstructions(true)
          }}
        >
          <span aria-hidden="true">?</span>
        </button>

        <div className="home-hero-copy">
          <p className="eyebrow">Think fast</p>
          <h1 id="home-heading">WORD BOMB</h1>
          <div className="home-hero-actions">
            <Link className="button button-play" to="/multiplayer">
              Play
            </Link>
            <Link className="button button-login" to="/login">
              Login
            </Link>
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
            <li>Form a new word that starts with the last letters of the previous word.</li>
            <li>Submit your word before the time limit runs out.</li>
            <li>Keep the chain going: each new word becomes the starting point for the next turn!</li>
          </ol>
        </dialog>
      </section>
    </main>
  )
}
