export default function Header() {
  const username = 'Guest'

  return (
    <header className="top-bar">
      <p className="top-bar-username" aria-label="Signed in as">
        {username}
      </p>
    </header>
  )
}
