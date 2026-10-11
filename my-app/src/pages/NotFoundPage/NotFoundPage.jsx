import { Link } from 'react-router-dom'
import '../HomePage/HomePage.css'

export default function NotFoundPage() {
  return (
    <main className="home-content">
      <p className="eyebrow">That path leads nowhere</p>
      <h1>Page not found</h1>
      <Link className="button button-play" to="/">
        Return home
      </Link>
    </main>
  )
}
