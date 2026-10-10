import { useRef, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import maleKnight from './male_knight.png'
import femaleKnight from './female_knight.png'
import maleMage from './male_mage.png'
import femaleMage from './female_mage.png'
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
