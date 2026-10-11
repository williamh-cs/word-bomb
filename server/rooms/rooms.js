import { chooseStartingWord, getWordValidationError } from '../game/wordGame.js'

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const START_COUNTDOWN_MS = 4000
const TURN_DURATION_MS = 15000
const HANDOFF_DURATION_MS = 3000

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
    hostSocketId: room.hostSocketId,
    playerIds: [...room.members.keys()],
    playerNames: [...room.members.values()].map((member) => member.name),
    playerCharacters: [...room.members.values()].map((member) => member.character),
    playerLives: [...room.members.values()].map((member) => member.lives ?? 3),
    status: room.status,
    startedAt: room.startedAt ?? null,
    currentWord: room.currentWord ?? null,
    currentTurnPlayerId: room.currentTurnPlayerId ?? null,
    turnEndsAt: room.turnEndsAt ?? null,
    turnStartsAt: room.turnStartsAt ?? null,
    handoff: room.handoff ?? null,
    winnerSocketId: room.winnerSocketId ?? null,
    lastAction: room.lastAction ?? null,
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

  const previousPlayerOrder = [...room.members.keys()]
  const wasCurrentPlayer = room.currentTurnPlayerId === socket.id
  const wasInGame = room.status === 'Started'
  room.memberIds.delete(socket.id)
  room.members.delete(socket.id)

  if (room.memberIds.size === 0) {
    rooms.delete(roomCode)
  } else {
    if (room.hostSocketId === socket.id) {
      room.hostSocketId = room.memberIds.values().next().value
      room.hostName = room.members.get(room.hostSocketId).name
    }
    if (wasInGame) {
      room.lastAction = { type: 'left', playerId: socket.id }
      if (wasCurrentPlayer) moveToNextTurn(room, socket.id, previousPlayerOrder)
      else finishIfOnePlayerLeft(room)
    }
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
    status: 'Waiting for players',
    memberIds: new Set([socket.id]),
    members: new Map([[socket.id, { name: hostName, character: payload.character ?? null }]]),
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

  if (room.status !== 'Waiting for players') return { error: 'That game has already started.' }

  if (room.memberIds.size >= room.capacity) {
    return { error: 'That room is full.' }
  }

  if (room.isPrivate && password !== room.password) {
    return { error: 'Incorrect password.' }
  }

  leaveRoom(socket)

  room.memberIds.add(socket.id)
  room.members.set(socket.id, {
    name: typeof payload.playerName === 'string' && payload.playerName.trim()
      ? payload.playerName.trim().slice(0, 40) : 'Guest',
    character: payload.character ?? null,
  })
  socketToRoom.set(socket.id, code)
  socket.join(`room:${code}`)

  return { room: toPublicRoom(room) }
}

export function handleDisconnect(socket) {
  return leaveRoom(socket)
}

export function getCurrentRoom(socket) {
  const room = rooms.get(socketToRoom.get(socket.id))
  return room ? { room: toPublicRoom(room) } : { error: 'You are no longer in this room. Return to the lobby to join again.' }
}

export function startGame(socket) {
  const room = rooms.get(socketToRoom.get(socket.id))
  if (!room) return { error: 'That room no longer exists.' }
  if (room.hostSocketId !== socket.id) return { error: 'Only the host can start the game.' }
  if (room.memberIds.size < 2) return { error: 'Wait for at least one other player to join.' }
  if ([...room.members.values()].some((member) => !member.character)) {
    return { error: 'Wait for every player to select a hero.' }
  }
  if (room.status !== 'Waiting for players') return { error: 'This game has already started.' }

  const now = Date.now()
  room.status = 'Started'
  room.startedAt = now
  room.currentWord = chooseStartingWord()
  room.usedWords = new Set([room.currentWord])
  room.currentTurnPlayerId = room.memberIds.values().next().value
  room.turnStartsAt = now + START_COUNTDOWN_MS
  room.turnEndsAt = now + START_COUNTDOWN_MS + TURN_DURATION_MS
  room.handoff = null
  room.winnerSocketId = null
  room.lastAction = null
  for (const member of room.members.values()) member.lives = 3

  return { room: toPublicRoom(room) }
}

function finishIfOnePlayerLeft(room) {
  const playersWithLives = [...room.members.entries()]
    .filter(([, member]) => member.lives > 0)
    .map(([playerId]) => playerId)
  if (playersWithLives.length > 1) return false

  room.status = 'Finished'
  room.currentTurnPlayerId = null
  room.turnEndsAt = null
  room.turnStartsAt = null
  room.handoff = null
  room.winnerSocketId = playersWithLives[0] ?? null
  return true
}

function moveToNextTurn(room, afterPlayerId, previousPlayerOrder = [...room.members.keys()], now = Date.now()) {
  const playerIds = previousPlayerOrder
  const previousIndex = playerIds.indexOf(afterPlayerId)
  if (finishIfOnePlayerLeft(room)) return

  for (let offset = 1; offset <= playerIds.length; offset += 1) {
    const nextPlayerId = playerIds[(previousIndex + offset + playerIds.length) % playerIds.length]
    if (room.members.get(nextPlayerId)?.lives > 0) {
      room.currentTurnPlayerId = nextPlayerId
      room.turnStartsAt = now + HANDOFF_DURATION_MS
      room.turnEndsAt = room.turnStartsAt + TURN_DURATION_MS
      room.handoff = {
        fromPlayerId: afterPlayerId,
        toPlayerId: nextPlayerId,
        startedAt: now,
        endsAt: room.turnStartsAt,
        reason: room.lastAction?.type ?? 'left',
      }
      return
    }
  }
}

export function expireTurn(roomCode, now = Date.now()) {
  const room = rooms.get(roomCode)
  if (
    !room
    || room.status !== 'Started'
    || !room.turnEndsAt
    || now < room.turnEndsAt
  ) return null

  const timedOutPlayerId = room.currentTurnPlayerId
  const member = room.members.get(timedOutPlayerId)
  if (!member) return null

  member.lives -= 1
  room.lastAction = { type: 'timeout', playerId: timedOutPlayerId }
  moveToNextTurn(room, timedOutPlayerId, [...room.members.keys()], now)
  return toPublicRoom(room)
}

export function submitWord(socket, payload = {}) {
  const room = rooms.get(socketToRoom.get(socket.id))
  if (!room) return { error: 'You are no longer in this room.' }
  if (room.status !== 'Started') return { error: 'The game is not in progress.' }
  if (room.currentTurnPlayerId !== socket.id) return { error: 'It is not your turn.' }
  if (Date.now() < room.startedAt + START_COUNTDOWN_MS) {
    return { error: 'The game is still starting.' }
  }
  if (Date.now() >= room.turnEndsAt) {
    const updatedRoom = expireTurn(room.code)
    return { error: 'Time is up. You lost a life.', room: updatedRoom, expired: true }
  }

  if (Date.now() < room.turnStartsAt) {
    return { error: 'Wait for the egg to arrive before playing your word.' }
  }

  const word = typeof payload?.word === 'string' ? payload.word.trim().toLowerCase() : ''
  const validationError = getWordValidationError(word, room.currentWord, room.usedWords)
  if (validationError) return { error: validationError }

  room.currentWord = word
  room.usedWords.add(word)
  room.lastAction = { type: 'word', playerId: socket.id, word }
  moveToNextTurn(room, socket.id)
  return { room: toPublicRoom(room) }
}

export function updateCharacter(socket, payload = {}) {
  const room = rooms.get(socketToRoom.get(socket.id))
  if (!room) return { error: 'You are no longer in this room.' }
  if (room.status === 'Started') return { error: 'The game has already started.' }
  if (!['guest-player', 'male-knight', 'female-knight', 'male-mage', 'female-mage'].includes(payload.character)) {
    return { error: 'Select a valid hero.' }
  }
  room.members.get(socket.id).character = payload.character
  return { room: toPublicRoom(room) }
}

export function returnToWaitingRoom(socket) {
  const room = rooms.get(socketToRoom.get(socket.id))
  if (!room) return { error: 'You are no longer in this room.' }
  if (room.hostSocketId !== socket.id) return { error: 'Only the host can return everyone to the waiting room.' }
  if (room.status !== 'Finished') return { error: 'Wait for the game to finish first.' }
  room.status = 'Waiting for players'
  room.startedAt = null
  room.currentWord = null
  room.usedWords = new Set()
  room.currentTurnPlayerId = null
  room.turnStartsAt = null
  room.turnEndsAt = null
  room.handoff = null
  room.winnerSocketId = null
  room.lastAction = null
  for (const member of room.members.values()) member.lives = 3
  return { room: toPublicRoom(room) }
}
