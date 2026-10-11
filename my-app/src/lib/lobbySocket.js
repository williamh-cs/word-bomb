import { io } from 'socket.io-client'

export const lobbySocket = io({
  path: '/socket.io',
  autoConnect: false,
  transports: ['websocket', 'polling'],
})
