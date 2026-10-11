import { io } from 'socket.io-client'

// Keep room membership alive while navigating from the lobby to the board.
export const lobbySocket = io({
  path: '/socket.io',
  autoConnect: false,
  transports: ['websocket', 'polling'],
})
