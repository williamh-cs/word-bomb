import {
  createRoom,
  expireTurn,
  getCurrentRoom,
  handleDisconnect,
  joinRoom,
  listPublicRooms,
  returnToWaitingRoom,
  startGame,
  submitWord,
  updateCharacter,
} from './rooms.js'

export function registerRoomSocketHandlers(io) {
  const turnTimers = new Map()

  function broadcastRooms() {
    const rooms = listPublicRooms()
    io.emit('rooms:updated', rooms.filter((room) => room.status === 'Waiting for players'))
    for (const room of rooms) io.to(`room:${room.code}`).emit('room:updated', room)
  }

  function scheduleTurnExpiry(room) {
    const previousTimer = turnTimers.get(room.code)
    if (previousTimer) clearTimeout(previousTimer)
    turnTimers.delete(room.code)
    if (room.status !== 'Started' || !room.turnEndsAt) return

    const delay = Math.max(0, room.turnEndsAt - Date.now())
    const timer = setTimeout(() => {
      const updatedRoom = expireTurn(room.code)
      if (updatedRoom) {
        io.to(`room:${room.code}`).emit('room:updated', updatedRoom)
        scheduleTurnExpiry(updatedRoom)
        return
      }

      const currentRoom = listPublicRooms().find((entry) => entry.code === room.code)
      if (currentRoom?.status === 'Started') scheduleTurnExpiry(currentRoom)
    }, delay)
    timer.unref()
    turnTimers.set(room.code, timer)
  }

  function removePlayerFromRoom(socket) {
    const roomCode = handleDisconnect(socket)
    if (!roomCode) return

    broadcastRooms()
    const room = listPublicRooms().find((entry) => entry.code === roomCode)
    if (room) scheduleTurnExpiry(room)
    else {
      const timer = turnTimers.get(roomCode)
      if (timer) clearTimeout(timer)
      turnTimers.delete(roomCode)
    }
  }

  io.on('connection', (socket) => {
    const sendRooms = () => socket.emit('rooms:updated', listPublicRooms().filter((room) => room.status === 'Waiting for players'))
    sendRooms()
    socket.on('rooms:list', sendRooms)
    socket.on('room:state', (acknowledge) => {
      if (typeof acknowledge === 'function') acknowledge(getCurrentRoom(socket))
    })
    socket.on('room:leave', () => removePlayerFromRoom(socket))
    for (const [event, action] of [['room:create', createRoom], ['room:join', joinRoom], ['room:character', updateCharacter]]) {
      socket.on(event, (payload, acknowledge) => {
        const result = action(socket, payload)
        if (typeof acknowledge === 'function') acknowledge(result)
        if (!result.error) broadcastRooms()
      })
    }
    socket.on('room:start', (acknowledge) => {
      const result = startGame(socket)
      if (typeof acknowledge === 'function') acknowledge(result)
      if (!result.error) {
        io.to(`room:${result.room.code}`).emit('room:started', result.room)
        broadcastRooms()
        scheduleTurnExpiry(result.room)
      }
    })
    socket.on('game:word', (payload, acknowledge) => {
      const result = submitWord(socket, payload)
      if (typeof acknowledge === 'function') acknowledge(result.error ? { error: result.error } : result)
      if (result.room) {
        io.to(`room:${result.room.code}`).emit('room:updated', result.room)
        scheduleTurnExpiry(result.room)
      } else if (!result.error) {
        broadcastRooms()
        scheduleTurnExpiry(result.room)
      }
    })
    socket.on('room:return', (acknowledge) => {
      const result = returnToWaitingRoom(socket)
      if (typeof acknowledge === 'function') acknowledge(result)
      if (!result.error) {
        scheduleTurnExpiry(result.room)
        io.to(`room:${result.room.code}`).emit('room:waiting', result.room)
        broadcastRooms()
      }
    })
    socket.on('disconnect', () => {
      removePlayerFromRoom(socket)
    })
  })
}
