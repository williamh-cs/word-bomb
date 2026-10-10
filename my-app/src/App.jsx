import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import GuestPage from './pages/GuestPage'
import HeroSelectPage from './pages/HeroSelectPage'
import GameBoardPage from './pages/GameBoardPage'
import ThreePlayerBoardPage from './pages/ThreePlayerBoardPage'
import FourPlayerBoardPage from './pages/FourPlayerBoardPage'
import SignInPage from './pages/SignInPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="guest" element={<GuestPage />} />
        <Route path="heroes" element={<HeroSelectPage />} />
        <Route path="game-board" element={<GameBoardPage />} />
        <Route path="game-board/3-players" element={<ThreePlayerBoardPage />} />
        <Route path="game-board/4-players" element={<FourPlayerBoardPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
