import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { lobbySocket } from '../../lib/lobbySocket'
import './WaitingRoomPage.css'

export default function WaitingRoomPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [room, setRoom] = useState(state?.room ?? null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [connected, setConnected] = useState(lobbySocket.connected)
  const roomCode = state?.room?.code
  const isHost = connected && room?.hostSocketId === lobbySocket.id

  useEffect(() => {
    if (!roomCode) return
    function showGame(nextRoom) {
      if (nextRoom.code !== roomCode) return
      const path = nextRoom.capacity === 2 ? '/game-board' : `/game-board/${nextRoom.capacity}-players`
      navigate(path, { replace: true, state: { room: nextRoom } })
    }
    function onRoom(nextRoom) {
      if (nextRoom.code !== roomCode) return
      setRoom(nextRoom)
      if (nextRoom.status === 'Started') showGame(nextRoom)
    }
    function syncRoom() {
      setConnected(true)
      lobbySocket.timeout(8000).emit('room:state', (requestError, result) => {
        if (requestError || result?.error || result?.room?.code !== roomCode) {
          setError(result?.error || 'Could not load this room. Return to the lobby to join again.')
          return
        }
        setError('')
        onRoom(result.room)
      })
    }
    function onDisconnect() {
      setConnected(false)
      setStarting(false)
      setError('Connection lost. Reconnecting…')
    }
    lobbySocket.on('room:updated', onRoom)
    lobbySocket.on('room:started', showGame)
    lobbySocket.on('connect', syncRoom)
    lobbySocket.on('disconnect', onDisconnect)
    if (lobbySocket.connected) syncRoom()
    else lobbySocket.connect()
    return () => {
      lobbySocket.off('room:updated', onRoom)
      lobbySocket.off('room:started', showGame)
      lobbySocket.off('connect', syncRoom)
      lobbySocket.off('disconnect', onDisconnect)
    }
  }, [roomCode, navigate])

  if (!room) {
    return (
      <main className="guest-content waiting-room-page">
        <section className="guest-welcome waiting-room">
          <h1>Waiting Room</h1>
          <p>Host a room to gather your party.</p>
          <Link className="button button-host" to="/multiplayer">Host a room</Link>
        </section>
      </main>
    )
  }

  const players = room.playerNames ?? [room.hostName]

  function startGame() {
    if (!isHost || starting) return
    setStarting(true)
    setError('')
    lobbySocket.timeout(8000).emit('room:start', (requestError, result) => {
      setStarting(false)
      if (requestError || result?.error) setError(result?.error || 'Could not start the game. Please try again.')
    })
  }

  return (
    <main className="guest-content waiting-room-page">
      <section className="guest-welcome waiting-room" aria-labelledby="waiting-room-heading">
        <h1 id="waiting-room-heading">{room.name}</h1>
        <dl className="waiting-room-details">
          <div><dt>Room code</dt><dd>{room.code}</dd></div>
          <div><dt>Visibility</dt><dd>{room.isPrivate ? 'Private' : 'Public'}</dd></div>
          <div><dt>Status</dt><dd role="status">{room.status}</dd></div>
          <div><dt>Players</dt><dd>{players.length} / {room.capacity}</dd></div>
        </dl>
        <section className="waiting-room-players" aria-labelledby="players-heading">
          <h2 id="players-heading">Players ({players.length})</h2>
          <ul>
            {players.map((name, index) => (
              <li key={`${name}-${index}`}>
                <span>{name}</span>
                <span>{room.playerIds?.[index] === room.hostSocketId ? 'Host' : 'Player'}</span>
              </li>
            ))}
            {Array.from({ length: Math.max(0, room.capacity - players.length) }, (_, index) => (
              <li className="waiting-room-empty" key={`empty-${index}`}>Waiting for player…</li>
            ))}
          </ul>
        </section>
        <section className="waiting-room-start" aria-labelledby="start-heading">
          {isHost ? <>
            <p>{players.length < 2 ? 'Wait for another player to join your room.' : 'Your party is here. Start the game when you are ready.'}</p>
            <button className="button button-host" type="button" onClick={startGame} disabled={starting || players.length < 2}>{starting ? 'Starting…' : 'Start Game'}</button>
          </> : <p id="start-heading" role="status">Waiting for the host to start the game.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
        </section>
        <Link className="button button-how-to-play" to="/multiplayer" onClick={() => lobbySocket.emit('room:leave')}>Leave room</Link>
      </section>
    </main>
  )
}
