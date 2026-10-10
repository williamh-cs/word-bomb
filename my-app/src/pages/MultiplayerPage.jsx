import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function createRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

export default function MultiplayerPage() {
  const { user } = useAuth()
  const { state } = useLocation()
  const [guestNumber] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [rooms, setRooms] = useState([])
  const [currentRoomCode, setCurrentRoomCode] = useState(null)

  const [capacity, setCapacity] = useState(2)
  const [visibility, setVisibility] = useState('public')
  const [hostPassword, setHostPassword] = useState('')
  const [hostError, setHostError] = useState('')

  const [pendingRoom, setPendingRoom] = useState(null)
  const [joinPassword, setJoinPassword] = useState('')
  const [joinError, setJoinError] = useState('')

  const hostDialogRef = useRef(null)
  const passwordDialogRef = useRef(null)
  const hostHeadingId = useId()
  const passwordHeadingId = useId()
  const displayName = user?.username ?? `Guest ${guestNumber}`

  useEffect(() => {
    if (visibility === 'public') {
      setHostPassword('')
      setHostError('')
    }
  }, [visibility])

  function openHostDialog() {
    setCapacity(2)
    setVisibility('public')
    setHostPassword('')
    setHostError('')
    hostDialogRef.current?.showModal()
  }

  function closeHostDialog() {
    hostDialogRef.current?.close()
  }

  function closePasswordDialog() {
    passwordDialogRef.current?.close()
    setPendingRoom(null)
    setJoinPassword('')
    setJoinError('')
  }

  function withPlayerLeft(roomList, roomCode) {
    if (!roomCode) return roomList

    return roomList
      .map((room) =>
        room.code === roomCode
          ? { ...room, players: Math.max(0, room.players - 1) }
          : room,
      )
      .filter((room) => room.players > 0)
  }

  function enterRoom(room, roomList = rooms) {
    const updatedRooms = withPlayerLeft(roomList, currentRoomCode).map((entry) =>
      entry.code === room.code
        ? { ...entry, players: Math.min(entry.capacity, entry.players + 1) }
        : entry,
    )

    setRooms(updatedRooms)
    setCurrentRoomCode(room.code)
  }

  function handleCreateRoom(event) {
    event.preventDefault()

    if (visibility === 'private' && !hostPassword.trim()) {
      setHostError('Set a password for private rooms.')
      return
    }

    const room = {
      code: createRoomCode(),
      name: `${displayName}'s room`,
      players: 1,
      capacity,
      isPrivate: visibility === 'private',
      password: visibility === 'private' ? hostPassword.trim() : '',
      hostName: displayName,
    }

    setRooms([room, ...withPlayerLeft(rooms, currentRoomCode)])
    setCurrentRoomCode(room.code)
    closeHostDialog()
  }

  function handleRoomClick(room) {
    if (room.code === currentRoomCode) return

    if (room.players >= room.capacity) return

    if (room.isPrivate) {
      setPendingRoom(room)
      setJoinPassword('')
      setJoinError('')
      passwordDialogRef.current?.showModal()
      return
    }

    enterRoom(room)
  }

  function handlePasswordJoin(event) {
    event.preventDefault()

    if (!pendingRoom) return

    if (joinPassword !== pendingRoom.password) {
      setJoinError('Incorrect password.')
      return
    }

    enterRoom(pendingRoom)
    closePasswordDialog()
  }

  return (
    <main className="guest-content">
      {state?.playAsGuest === true && (
        <p className="multiplayer-guest-greeting">
          Welcome, Wandering Guest {guestNumber}!
        </p>
      )}

      <section className="game-options" aria-label="Game options">
        <div className="game-option">
          <p className="eyebrow">Find your party</p>
          <h2>Open rooms</h2>
          <p>Pick a room to join, or host your own game.</p>
          <div className="public-room-list" role="list" aria-label="Open rooms">
            {rooms.length === 0 ? (
              <p className="public-room-empty">No open rooms right now.</p>
            ) : (
              rooms.map((room) => {
                const isCurrent = room.code === currentRoomCode
                const isFull = room.players >= room.capacity

                return (
                  <button
                    key={room.code}
                    className={`public-room-card${isCurrent ? ' public-room-card-joined' : ''}`}
                    type="button"
                    role="listitem"
                    disabled={isFull && !isCurrent}
                    aria-current={isCurrent ? 'true' : undefined}
                    onClick={() => handleRoomClick(room)}
                  >
                    <span className="public-room-name">{room.name}</span>
                    <span className="public-room-details">
                      <span>
                        {room.players}/{room.capacity} players
                      </span>
                      <span>
                        {isCurrent
                          ? 'In room'
                          : isFull
                            ? 'Full'
                            : room.isPrivate
                              ? 'Private'
                              : 'Public'}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
          <button className="button button-host" type="button" onClick={openHostDialog}>
            <span className="auth-button-arrow" aria-hidden="true">
              ▶
            </span>
            Host game
          </button>
        </div>
      </section>

      <dialog
        ref={hostDialogRef}
        className="room-dialog"
        aria-labelledby={hostHeadingId}
        onClose={() => {
          setHostError('')
          setHostPassword('')
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeHostDialog()
          }
        }}
      >
        <form method="dialog" className="room-dialog-close">
          <button className="button" type="submit" aria-label="Close host settings">
            <span aria-hidden="true">×</span>
          </button>
        </form>
        <h2 id={hostHeadingId}>Host a game</h2>
        <p className="room-dialog-description">
          Choose your room settings, then create the lobby.
        </p>
        <form className="room-dialog-form" onSubmit={handleCreateRoom}>
          <label htmlFor="player-count">Max players</label>
          <select
            id="player-count"
            value={capacity}
            onChange={(event) => setCapacity(Number(event.target.value))}
          >
            <option value={2}>2 players</option>
            <option value={3}>3 players</option>
            <option value={4}>4 players</option>
          </select>

          <fieldset className="room-visibility">
            <legend>Visibility</legend>
            <label className="room-radio">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              />
              Public
            </label>
            <label className="room-radio">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              />
              Private
            </label>
          </fieldset>

          {visibility === 'private' && (
            <>
              <label htmlFor="room-password">Room password</label>
              <input
                id="room-password"
                type="password"
                autoComplete="new-password"
                placeholder="Set a password"
                value={hostPassword}
                onChange={(event) => {
                  setHostPassword(event.target.value)
                  setHostError('')
                }}
                required
              />
            </>
          )}

          {hostError && (
            <p className="auth-error" role="alert">
              {hostError}
            </p>
          )}

          <button className="button button-host" type="submit">
            <span className="auth-button-arrow" aria-hidden="true">
              ▶
            </span>
            Create room
          </button>
        </form>
      </dialog>

      <dialog
        ref={passwordDialogRef}
        className="room-dialog"
        aria-labelledby={passwordHeadingId}
        onClose={() => {
          setPendingRoom(null)
          setJoinPassword('')
          setJoinError('')
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePasswordDialog()
          }
        }}
      >
        <form method="dialog" className="room-dialog-close">
          <button className="button" type="submit" aria-label="Close password prompt">
            <span aria-hidden="true">×</span>
          </button>
        </form>
        <h2 id={passwordHeadingId}>Private room</h2>
        <p className="room-dialog-description">
          Enter the password set by {pendingRoom?.hostName ?? 'the host'} to join
          {pendingRoom ? ` ${pendingRoom.name}` : ''}.
        </p>
        <form className="room-dialog-form" onSubmit={handlePasswordJoin}>
          <label htmlFor="join-password">Password</label>
          <input
            id="join-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter room password"
            value={joinPassword}
            onChange={(event) => {
              setJoinPassword(event.target.value)
              setJoinError('')
            }}
            required
          />
          {joinError && (
            <p className="auth-error" role="alert">
              {joinError}
            </p>
          )}
          <button className="button button-join" type="submit">
            <span className="auth-button-arrow" aria-hidden="true">
              ▶
            </span>
            Join room
          </button>
        </form>
      </dialog>
    </main>
  )
}
