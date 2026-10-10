import { Link } from 'react-router-dom'

export default function ShopPage() {
  return (
    <main className="auth-content">
      <section className="auth-card" aria-labelledby="shop-heading">
        <div className="auth-panel-bar"><span>THE GUILD MARKET</span><span aria-hidden="true">◆</span></div>
        <p className="eyebrow">Treasures await</p>
        <h1 id="shop-heading">Shop</h1>
        <p className="auth-description">The shop is coming soon. Check back for new treasures!</p>
        <Link className="button button-submit-auth" to="/multiplayer">Back to multiplayer</Link>
      </section>
    </main>
  )
}
