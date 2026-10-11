import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { once } from 'node:events'
import { test } from 'node:test'
import { Server } from 'socket.io'
import { registerRoomSocketHandlers } from '../roomSocketHandlers.js'
import { expireTurn } from '../rooms.js'
import { getCountdownLabel } from '../../my-app/src/data/gameCountdown.js'
import { getEggFlightPoint } from '../../my-app/src/data/eggFlight.js'
import wordList from 'an-array-of-english-words' with { type: 'json' }

const requireClient = createRequire(new URL('../../my-app/package.json', import.meta.url))
const { io: connect } = requireClient('socket.io-client')

function request(socket, event, payload) {
  return new Promise((resolve, reject) => {
    const callback = (error, result) => error ? reject(error) : resolve(result)
    if (payload === undefined) socket.timeout(2000).emit(event, callback)
    else socket.timeout(2000).emit(event, payload, callback)
  })
}

for (const isPrivate of [false, true]) {
  test(`${isPrivate ? 'private' : 'public'} room updates its host and starts both players`, { timeout: 10000 }, async () => {
    const httpServer = createServer()
    const server = new Server(httpServer)
    registerRoomSocketHandlers(server)
    httpServer.listen(0, '127.0.0.1')
    await once(httpServer, 'listening')
    const url = `http://127.0.0.1:${httpServer.address().port}`
    const host = connect(url, { transports: ['websocket'], forceNew: true })
    const guest = connect(url, { transports: ['websocket'], forceNew: true })
    try {
      await Promise.all([once(host, 'connect'), once(guest, 'connect')])
      const created = await request(host, 'room:create', {
        capacity: 3, isPrivate, password: isPrivate ? 'secret' : '',
        hostName: 'Host', character: 'female-mage',
      })
      assert.equal(created.room.hostSocketId, host.id)
      assert.match((await request(host, 'room:start')).error, /other player/)
      if (isPrivate) {
        assert.equal((await request(guest, 'room:join', { code: created.room.code, password: 'wrong' })).error, 'Incorrect password.')
      }
      const hostUpdate = once(host, 'room:updated')
      const joined = await request(guest, 'room:join', {
        code: created.room.code, password: isPrivate ? 'secret' : '',
        playerName: 'Guest 1234', character: 'guest-player',
      })
      const [updated] = await hostUpdate
      assert.deepEqual(updated.playerNames, ['Host', 'Guest 1234'])
      assert.equal(updated.players, 2)
      assert.deepEqual(updated.playerCharacters, ['female-mage', 'guest-player'])
      assert.notEqual(joined.room.hostSocketId, guest.id)
      assert.equal((await request(guest, 'room:start')).error, 'Only the host can start the game.')
      const hostLeaveUpdate = once(host, 'room:updated')
      guest.emit('room:leave')
      assert.deepEqual((await hostLeaveUpdate)[0].playerNames, ['Host'])
      await request(guest, 'room:join', {
        code: created.room.code, password: isPrivate ? 'secret' : '',
        playerName: 'Guest 1234', character: 'guest-player',
      })
      const hostStarted = once(host, 'room:started')
      const guestStarted = once(guest, 'room:started')
      const result = await request(host, 'room:start')
      assert.equal(result.room.status, 'Started')
      const [[hostRoom], [guestRoom]] = await Promise.all([hostStarted, guestStarted])
      assert.deepEqual(hostRoom, guestRoom)
      assert.equal(typeof hostRoom.startedAt, 'number')
      assert.equal(typeof hostRoom.turnEndsAt, 'number')
      assert.match(hostRoom.currentWord, /^[a-z]{3,}$/)
      assert.deepEqual(hostRoom.playerLives, [3, 3])
      assert.equal(hostRoom.currentTurnPlayerId, host.id)
      assert.equal((await request(host, 'room:start')).error, 'This game has already started.')
      assert.deepEqual(guestRoom.playerNames, ['Host', 'Guest 1234'])
      assert.deepEqual((await request(guest, 'room:state')).room, guestRoom)
    } finally {
      host.disconnect()
      guest.disconnect()
      await new Promise((resolve) => server.close(resolve))
    }
  })
}

test('countdown displays Ready, 3, 2, 1 and ends after four seconds', () => {
  const start = 10000
  for (const [elapsed, label] of [[0, 'Ready'], [999, 'Ready'], [1000, '3'], [2000, '2'], [3000, '1'], [3999, '1'], [4000, null], [5000, null]]) {
    assert.equal(getCountdownLabel(start, start + elapsed), label)
  }
  assert.equal(getCountdownLabel(null, start), null)
})

test('players submit chained words, pause for the egg, and lose lives until one is eliminated', { timeout: 16000 }, async () => {
  const httpServer = createServer()
  const server = new Server(httpServer)
  registerRoomSocketHandlers(server)
  httpServer.listen(0, '127.0.0.1')
  await once(httpServer, 'listening')
  const url = `http://127.0.0.1:${httpServer.address().port}`
  const host = connect(url, { transports: ['websocket'], forceNew: true })
  const guest = connect(url, { transports: ['websocket'], forceNew: true })
  try {
    await Promise.all([once(host, 'connect'), once(guest, 'connect')])
    const created = await request(host, 'room:create', {
      capacity: 2, hostName: 'Host', character: 'male-knight',
    })
    await request(guest, 'room:join', {
      code: created.room.code, playerName: 'Guest', character: 'female-mage',
    })
    const started = await request(host, 'room:start')
    assert.match((await request(host, 'room:return')).error, /finish first/)
    const openingWord = started.room.currentWord
    const answer = wordList.find((candidate) =>
      candidate.length >= 3
      && candidate.includes(openingWord.slice(-2))
      && candidate !== openingWord)
    assert.ok(answer, `No answer found for opening word ${openingWord}`)
    assert.match((await request(host, 'game:word', { word: answer })).error, /still starting/)

    await new Promise((resolve) => setTimeout(resolve, 4100))
    const guestHandoffUpdate = once(guest, 'room:updated')
    const submitted = await request(host, 'game:word', { word: answer })
    assert.equal(submitted.room.currentWord, answer)
    assert.equal(submitted.room.currentTurnPlayerId, guest.id)
    assert.deepEqual(submitted.room.playerLives, [3, 3])
    assert.deepEqual((await guestHandoffUpdate)[0].handoff, submitted.room.handoff)
    assert.equal(submitted.room.handoff.fromPlayerId, host.id)
    assert.equal(submitted.room.handoff.toPlayerId, guest.id)
    assert.equal(submitted.room.handoff.reason, 'word')
    assert.equal(submitted.room.handoff.endsAt - submitted.room.handoff.startedAt, 3000)
    assert.equal(submitted.room.turnStartsAt, submitted.room.handoff.endsAt)
    assert.equal(submitted.room.turnEndsAt - submitted.room.turnStartsAt, 15000)
    assert.match((await request(guest, 'game:word', { word: 'notaword' })).error, /egg to arrive/)
    await new Promise((resolve) => setTimeout(resolve, 3100))
    assert.match((await request(guest, 'game:word', { word: 'notaword' })).error, /not in the game dictionary/)
    assert.match((await request(guest, 'game:word', { word: answer.toUpperCase() })).error, /already been used/)
    assert.match((await request(guest, 'game:word', { word: openingWord })).error, /already been used/)

    let game = submitted.room
    for (let i = 0; i < 5; i += 1) {
      game = expireTurn(created.room.code, game.turnEndsAt)
      assert.ok(game)
      if (game.status === 'Started') {
        assert.equal(game.handoff.reason, 'timeout')
        assert.equal(game.handoff.endsAt - game.handoff.startedAt, 3000)
        assert.equal(game.turnEndsAt - game.turnStartsAt, 15000)
      }
    }
    assert.equal(game.status, 'Finished')
    assert.deepEqual(game.playerLives, [1, 0])
    assert.equal(game.winnerSocketId, host.id)
    assert.equal(game.handoff, null)
    assert.match((await request(guest, 'room:return')).error, /Only the host/)
    const hostReturned = once(host, 'room:waiting')
    const guestReturned = once(guest, 'room:waiting')
    const reset = await request(host, 'room:return')
    const [[hostWaiting], [guestWaiting]] = await Promise.all([hostReturned, guestReturned])
    assert.deepEqual(hostWaiting, guestWaiting)
    assert.deepEqual(reset.room, guestWaiting)
    assert.equal(reset.room.code, created.room.code)
    assert.equal(reset.room.status, 'Waiting for players')
    assert.deepEqual(reset.room.playerIds, [host.id, guest.id])
    assert.deepEqual(reset.room.playerCharacters, ['male-knight', 'female-mage'])
    assert.deepEqual(reset.room.playerLives, [3, 3])
    for (const field of ['startedAt', 'currentWord', 'currentTurnPlayerId', 'turnStartsAt', 'turnEndsAt', 'handoff', 'winnerSocketId', 'lastAction']) {
      assert.equal(reset.room[field], null, field)
    }
    assert.equal((await request(host, 'room:start')).room.status, 'Started')
  } finally {
    host.disconnect()
    guest.disconnect()
    await new Promise((resolve) => server.close(resolve))
  }
})

test('egg trajectory has exact hand endpoints and a shallow parabolic arc in either direction', () => {
  const from = { x: 100, y: 150 }
  const to = { x: 500, y: 170 }
  assert.deepEqual(getEggFlightPoint(from, to, 0, 48), from)
  assert.deepEqual(getEggFlightPoint(from, to, 1, 48), to)
  assert.deepEqual(getEggFlightPoint(from, to, 0.5, 48), { x: 300, y: 112 })
  assert.deepEqual(getEggFlightPoint(to, from, 0.5, 48), { x: 300, y: 112 })
  assert.deepEqual(getEggFlightPoint(from, to, -1, 48), from)
  assert.deepEqual(getEggFlightPoint(from, to, 2, 48), to)
})

test('hero selection updates the server roster before the host can start', { timeout: 10000 }, async () => {
  const httpServer = createServer()
  const server = new Server(httpServer)
  registerRoomSocketHandlers(server)
  httpServer.listen(0, '127.0.0.1')
  await once(httpServer, 'listening')
  const url = `http://127.0.0.1:${httpServer.address().port}`
  const host = connect(url, { transports: ['websocket'], forceNew: true })
  const player = connect(url, { transports: ['websocket'], forceNew: true })
  try {
    await Promise.all([once(host, 'connect'), once(player, 'connect')])
    const created = await request(host, 'room:create', { capacity: 2, hostName: 'Host', character: 'male-knight' })
    await request(player, 'room:join', { code: created.room.code, playerName: 'Player' })
    assert.match((await request(host, 'room:start')).error, /select a hero/)
    const hostUpdate = once(host, 'room:updated')
    await request(player, 'room:character', { character: 'female-mage' })
    assert.deepEqual((await hostUpdate)[0].playerCharacters, ['male-knight', 'female-mage'])
    assert.equal((await request(host, 'room:start')).room.status, 'Started')
  } finally {
    host.disconnect()
    player.disconnect()
    await new Promise((resolve) => server.close(resolve))
  }
})
