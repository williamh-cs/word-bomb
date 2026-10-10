import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import MultiplayerPage from './pages/MultiplayerPage'
import HeroSelectPage from './pages/HeroSelectPage'
import GameBoardPage from './pages/GameBoardPage'
import ThreePlayerBoardPage from './pages/ThreePlayerBoardPage'
import FourPlayerBoardPage from './pages/FourPlayerBoardPage'
import SignInPage from './pages/SignInPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import UserPage from './pages/UserPage'
import ShopPage from './pages/ShopPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="multiplayer" element={<MultiplayerPage />} />
        <Route path="guest" element={<Navigate to="/multiplayer" replace />} />
        <Route path="heroes" element={<HeroSelectPage />} />
        <Route path="game-board" element={<GameBoardPage />} />
        <Route path="game-board/3-players" element={<ThreePlayerBoardPage />} />
        <Route path="game-board/4-players" element={<FourPlayerBoardPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="profile" element={<UserPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
