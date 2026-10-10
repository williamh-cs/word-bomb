import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { AuthProvider } from './context/AuthContext'
import FourPlayerBoardPage from './pages/FourPlayerBoardPage'
import GameBoardPage from './pages/GameBoardPage'
import HeroSelectPage from './pages/HeroSelectPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MultiplayerPage from './pages/MultiplayerPage'
import NotFoundPage from './pages/NotFoundPage'
import SignInPage from './pages/SignInPage'
import ThreePlayerBoardPage from './pages/ThreePlayerBoardPage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="multiplayer" element={<MultiplayerPage />} />
          <Route path="waitingroom" element={<WaitingRoomPage />} />
          <Route path="guest" element={<Navigate to="/multiplayer" replace />} />
          <Route path="heroes" element={<HeroSelectPage />} />
          <Route path="game-board" element={<GameBoardPage />} />
          <Route path="game-board/3-players" element={<ThreePlayerBoardPage />} />
          <Route path="game-board/4-players" element={<FourPlayerBoardPage />} />
          <Route path="signup" element={<SignInPage />} />
          <Route path="signin" element={<Navigate to="/signup" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
