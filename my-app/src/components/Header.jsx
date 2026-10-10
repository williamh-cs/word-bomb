import { Link } from 'react-router-dom'

export default function Header({ user }) {
  return (
    <header className="top-bar">
      <Link className="brand" to="/" aria-label="Word Bomb home">
        Word Bomb
      </Link>

      <nav className="top-bar-actions" aria-label="Account">
        {user ? (
          <>
            <Link className="profile-circle" to="/profile" aria-label={`${user.name}'s player profile`}>
              {user.name.slice(0, 1).toUpperCase()}
            </Link>
            <Link className="button button-guest user-nav-button" to="/shop">Shop</Link>
            <Link className="button button-sign-in user-nav-button" to="/heroes">Select hero</Link>
          </>
        ) : (
          <>
        <Link className="button button-guest" to="/multiplayer" state={{ playAsGuest: true }}>
          Play as guest
        </Link>
        <Link className="button button-sign-in" to="/signin">
          Sign in
        </Link>
        <Link className="button button-login" to="/login">
          Log in
        </Link>
          </>
        )}
      </nav>
    </header>
  )
}
