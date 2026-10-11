import { Outlet } from 'react-router-dom'
import Header from './Header'
import PageTransition from './PageTransition'

export default function AppLayout() {
  return (
    <div className="home-page">
      <Header />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  )
}
