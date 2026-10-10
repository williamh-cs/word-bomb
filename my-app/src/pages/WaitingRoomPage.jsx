import { Link, useLocation, useNavigate } from 'react-router-dom'
import guestPlayer from '../assets/guest_player.png'

export default function WaitingRoomPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const room = state?.room

  if (!room) {
    return (
      <main className="guest-content">
        <section className="guest-welcome">
          <h1>Waiting Room</h1>
          <p>Host a room to gather your party.</p>
          <Link className="button button-host" to="/multiplayer">Host a room</Link>
        </section>
      </main>
    )
  }

  const players = room.playerNames ?? [room.hostName]

  function startGame() {
    const path = room.capacity === 2 ? '/game-board' : `/game-board/${room.capacity}-players`
    navigate(path, { state: { room: { ...room, status: 'Started' } } })
  }

  return (
    <main className="guest-content">
      <section className="guest-welcome waiting-room" aria-labelledby="waiting-room-heading">
        <p className="eyebrow">Gather your party</p>
        <h1 id="waiting-room-heading">Waiting Room</h1>
        <p className="guest-name">{room.name}</p>
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
                {room.playerCharacters?.[index] === 'guest-player' && (
                  <span className="guest-player-avatar" style={{ backgroundImage: `url(${guestPlayer})` }} role="img" aria-label="Guest player character" />
                )}
                <span>{name}</span>
                <span>{index === 0 ? 'Host' : 'Player'}</span>
              </li>
            ))}
            {Array.from({ length: Math.max(0, room.capacity - players.length) }, (_, index) => (
              <li className="waiting-room-empty" key={`empty-${index}`}>Waiting for player…</li>
            ))}
          </ul>
        </section>
        <section className="waiting-room-start" aria-labelledby="start-heading">
          <h2 id="start-heading">Start your game</h2>
          <p>{state?.isHost === false ? 'Waiting for the host to start the game.' : `You are the host. Open the ${room.capacity}-player board when you’re ready.`}</p>
          <button className="button button-host" type="button" onClick={startGame} disabled={state?.isHost === false}>Start Game</button>
        </section>
        <Link className="button button-how-to-play" to="/multiplayer">Leave room</Link>
      </section>
    </main>
  )
}
