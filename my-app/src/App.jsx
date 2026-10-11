import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'
import FourPlayerBoardPage from './pages/FourPlayerBoardPage/FourPlayerBoardPage'
import GameBoardPage from './pages/GameBoardPage/GameBoardPage'
import HeroSelectPage from './pages/HeroSelectPage/HeroSelectPage'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import MultiplayerPage from './pages/MultiplayerPage/MultiplayerPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import SignInPage from './pages/SignInPage/SignInPage'
import ThreePlayerBoardPage from './pages/ThreePlayerBoardPage/ThreePlayerBoardPage'
import WaitingRoomPage from './pages/WaitingRoomPage/WaitingRoomPage'
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
