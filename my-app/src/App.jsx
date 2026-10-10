import './App.css'

function App() {
  return (
    <div className="home-page">
      <header className="top-bar">
        <a className="brand" href="/" aria-label="Word Bomb home">
          Word Bomb
        </a>

        <nav className="top-bar-actions" aria-label="Account">
          <button className="button button-guest" type="button">
            Play as guest
          </button>
          <button className="button button-sign-in" type="button">
            Sign in
          </button>
        </nav>
      </header>
    </div>
  )
}

export default App
