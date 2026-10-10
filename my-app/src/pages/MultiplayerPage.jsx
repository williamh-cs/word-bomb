import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export default function MultiplayerPage() {
  const { user } = useAuth()
  const { state } = useLocation()
  const [guestNumber] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [rooms, setRooms] = useState([])
  const [currentRoomCode, setCurrentRoomCode] = useState(null)
  const [connectionError, setConnectionError] = useState('')
  const [lobbyError, setLobbyError] = useState('')

  const [capacity, setCapacity] = useState(2)
  const [visibility, setVisibility] = useState('public')
  const [hostPassword, setHostPassword] = useState('')
  const [hostError, setHostError] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)

  const [pendingRoom, setPendingRoom] = useState(null)
  const [joinPassword, setJoinPassword] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joiningRoom, setJoiningRoom] = useState(false)

  const socketRef = useRef(null)
  const hostDialogRef = useRef(null)
  const passwordDialogRef = useRef(null)
  const hostHeadingId = useId()
  const passwordHeadingId = useId()
  const displayName = user?.username ?? `Guest ${guestNumber}`

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnectionError('')
    })

    socket.on('connect_error', () => {
      setConnectionError('Could not connect to multiplayer server.')
    })

    socket.on('rooms:updated', (nextRooms) => {
      setRooms(Array.isArray(nextRooms) ? nextRooms : [])
    })

    socket.on('disconnect', () => {
      setCurrentRoomCode(null)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    if (visibility === 'public') {
      setHostPassword('')
      setHostError('')
    }
  }, [visibility])

  useEffect(() => {
    if (
      currentRoomCode &&
      !rooms.some((room) => room.code === currentRoomCode)
    ) {
      setCurrentRoomCode(null)
    }
  }, [rooms, currentRoomCode])

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

  function requestJoin(room, password = '', { privateJoin = false } = {}) {
    const socket = socketRef.current
    if (!socket?.connected) {
      const message = 'Not connected to the server.'
      if (privateJoin) setJoinError(message)
      else setLobbyError(message)
      return
    }

    setJoiningRoom(true)
    socket.emit('room:join', { code: room.code, password }, (result) => {
      setJoiningRoom(false)

      if (!result || result.error) {
        const message = result?.error || 'Could not join that room.'
        if (privateJoin) setJoinError(message)
        else setLobbyError(message)
        return
      }

      setCurrentRoomCode(result.room.code)
      setJoinError('')
      setLobbyError('')
      if (privateJoin) closePasswordDialog()
    })
  }

  function handleCreateRoom(event) {
    event.preventDefault()

    if (visibility === 'private' && !hostPassword.trim()) {
      setHostError('Set a password for private rooms.')
      return
    }

    const socket = socketRef.current
    if (!socket?.connected) {
      setHostError('Not connected to the server.')
      return
    }

    setCreatingRoom(true)
    socket.emit(
      'room:create',
      {
        capacity,
        isPrivate: visibility === 'private',
        password: visibility === 'private' ? hostPassword.trim() : '',
        hostName: displayName,
      },
      (result) => {
        setCreatingRoom(false)

        if (!result || result.error) {
          setHostError(result?.error || 'Could not create room.')
          return
        }

        setCurrentRoomCode(result.room.code)
        closeHostDialog()
      },
    )
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

    setLobbyError('')
    requestJoin(room)
  }

  function handlePasswordJoin(event) {
    event.preventDefault()

    if (!pendingRoom) return
    requestJoin(pendingRoom, joinPassword, { privateJoin: true })
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
          {(connectionError || lobbyError) && (
            <p className="auth-error" role="alert">
              {connectionError || lobbyError}
            </p>
          )}
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

          <button className="button button-host" type="submit" disabled={creatingRoom}>
            <span className="auth-button-arrow" aria-hidden="true">
              ▶
            </span>
            {creatingRoom ? 'Creating…' : 'Create room'}
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
          <button className="button button-join" type="submit" disabled={joiningRoom}>
            <span className="auth-button-arrow" aria-hidden="true">
              ▶
            </span>
            {joiningRoom ? 'Joining…' : 'Join room'}
          </button>
        </form>
      </dialog>
    </main>
  )
}
