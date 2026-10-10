const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const rooms = new Map()
const socketToRoom = new Map()

function createRoomCode() {
  let code = ''
  do {
    code = ''
    for (let i = 0; i < 6; i += 1) {
      code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
    }
  } while (rooms.has(code))

  return code
}

function toPublicRoom(room) {
  return {
    code: room.code,
    name: room.name,
    players: room.memberIds.size,
    capacity: room.capacity,
    isPrivate: room.isPrivate,
    hostName: room.hostName,
  }
}

export function listPublicRooms() {
  return [...rooms.values()].map(toPublicRoom)
}

function leaveRoom(socket) {
  const roomCode = socketToRoom.get(socket.id)
  if (!roomCode) return null

  const room = rooms.get(roomCode)
  socketToRoom.delete(socket.id)
  socket.leave(`room:${roomCode}`)

  if (!room) return null

  room.memberIds.delete(socket.id)

  if (room.memberIds.size === 0) {
    rooms.delete(roomCode)
  }

  return roomCode
}

export function createRoom(socket, payload = {}) {
  const capacity = Number(payload.capacity)
  const hostName =
    typeof payload.hostName === 'string' && payload.hostName.trim()
      ? payload.hostName.trim().slice(0, 40)
      : 'Guest'
  const isPrivate = payload.isPrivate === true
  const password =
    typeof payload.password === 'string' ? payload.password.trim() : ''

  if (![2, 3, 4].includes(capacity)) {
    return { error: 'Max players must be 2, 3, or 4.' }
  }

  if (isPrivate && !password) {
    return { error: 'Set a password for private rooms.' }
  }

  leaveRoom(socket)

  const code = createRoomCode()
  const room = {
    code,
    name: `${hostName}'s room`,
    capacity,
    isPrivate,
    password: isPrivate ? password : '',
    hostName,
    hostSocketId: socket.id,
    memberIds: new Set([socket.id]),
  }

  rooms.set(code, room)
  socketToRoom.set(socket.id, code)
  socket.join(`room:${code}`)

  return { room: toPublicRoom(room) }
}

export function joinRoom(socket, payload = {}) {
  const code = typeof payload.code === 'string' ? payload.code.trim().toUpperCase() : ''
  const password =
    typeof payload.password === 'string' ? payload.password.trim() : ''

  const room = rooms.get(code)
  if (!room) {
    return { error: 'That room no longer exists.' }
  }

  if (socketToRoom.get(socket.id) === code) {
    return { room: toPublicRoom(room) }
  }

  if (room.memberIds.size >= room.capacity) {
    return { error: 'That room is full.' }
  }

  if (room.isPrivate && password !== room.password) {
    return { error: 'Incorrect password.' }
  }

  leaveRoom(socket)

  room.memberIds.add(socket.id)
  socketToRoom.set(socket.id, code)
  socket.join(`room:${code}`)

  return { room: toPublicRoom(room) }
}

export function handleDisconnect(socket) {
  return leaveRoom(socket)
}
