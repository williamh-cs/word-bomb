import { Link } from 'react-router-dom'

export default function Header() {
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
