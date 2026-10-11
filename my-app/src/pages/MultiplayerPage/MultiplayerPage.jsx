import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useSelectedHero from '../../hooks/useSelectedHero'
import { heroes } from '../../data/heroes'
import { lobbySocket } from '../../lib/lobbySocket'
import './MultiplayerPage.css'

export default function MultiplayerPage() {
  const { user, loading } = useAuth()
  const { heroId } = useSelectedHero()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [guestNumber] = useState(() => Math.floor(1000 + Math.random() * 9000))
  const [rooms, setRooms] = useState([])
  const [connected, setConnected] = useState(lobbySocket.connected)
  const [connectionError, setConnectionError] = useState('')
  const [lobbyError, setLobbyError] = useState('')
  const [filter, setFilter] = useState('all')
  const [capacity, setCapacity] = useState(2)
  const [visibility, setVisibility] = useState('public')
  const [hostPassword, setHostPassword] = useState('')
  const [hostError, setHostError] = useState('')
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [pendingRoom, setPendingRoom] = useState(null)
  const [joinPassword, setJoinPassword] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joiningRoom, setJoiningRoom] = useState(false)
  const hostDialogRef = useRef(null)
  const passwordDialogRef = useRef(null)
  const hostHeadingId = useId()
  const passwordHeadingId = useId()
  const isGuest = state?.playAsGuest === true || !user
  const displayName = isGuest ? `Wandering Guest ${guestNumber}` : user.username
  const character = isGuest ? 'guest-player' : heroId
  const selectedHero = heroes.find((hero) => hero.id === heroId)
  const visibleRooms = rooms.filter((room) => filter === 'all' || (filter === 'private' ? room.isPrivate : !room.isPrivate))
  const busy = creatingRoom || joiningRoom

  useEffect(() => {
    function onConnect() {
      setConnected(true)
      setConnectionError('')
      lobbySocket.emit('rooms:list')
    }
    function onError() {
      setConnected(false)
      setConnectionError('Unable to connect. We’re trying again automatically.')
    }
    function onDisconnect() { setConnected(false) }
    function onRooms(nextRooms) { setRooms(Array.isArray(nextRooms) ? nextRooms : []) }
    lobbySocket.on('connect', onConnect)
    lobbySocket.on('connect_error', onError)
    lobbySocket.on('disconnect', onDisconnect)
    lobbySocket.on('rooms:updated', onRooms)
    if (lobbySocket.connected) onConnect()
    else lobbySocket.connect()
    return () => {
      lobbySocket.off('connect', onConnect)
      lobbySocket.off('connect_error', onError)
      lobbySocket.off('disconnect', onDisconnect)
      lobbySocket.off('rooms:updated', onRooms)
    }
  }, [])

  function openWaitingRoom(room, isHost) {
    const waitingState = {
      isHost,
      currentPlayerIndex: isHost ? 0 : room.playerNames.length - 1,
      room,
    }
    if (!isGuest && !heroId) {
      navigate('/heroes', { state: { pendingWaitingRoom: waitingState } })
      return
    }
    navigate('/waitingroom', { state: waitingState })
  }

  function openHostDialog() {
    setCapacity(2)
    setVisibility('public')
    setHostPassword('')
    setHostError('')
    hostDialogRef.current?.showModal()
  }

  function closeHostDialog() {
    if (!creatingRoom) hostDialogRef.current?.close()
  }

  function closePasswordDialog() {
    if (joiningRoom) return
    passwordDialogRef.current?.close()
    setPendingRoom(null)
    setJoinPassword('')
    setJoinError('')
  }

  function requestJoin(room, password = '', { privateJoin = false } = {}) {
    if (busy) return
    const setError = privateJoin ? setJoinError : setLobbyError
    setError('')
    if (!lobbySocket.connected) { setError('Not connected to the server. Please try again.'); return }
    setJoiningRoom(true)
    lobbySocket.timeout(8000).emit('room:join', { code: room.code, password, playerName: displayName, character }, (error, result) => {
      setJoiningRoom(false)
      if (error || !result?.room || result.error) {
        setError(result?.error || 'Could not join the room. Please try again.')
        return
      }
      passwordDialogRef.current?.close()
      openWaitingRoom(result.room, false)
    })
  }

  function handleCreateRoom(event) {
    event.preventDefault()
    if (busy) return
    if (visibility === 'private' && !hostPassword.trim()) { setHostError('Set a password for private rooms.'); return }
    if (!lobbySocket.connected) { setHostError('Not connected to the server. Please try again.'); return }
    setCreatingRoom(true)
    setHostError('')
    lobbySocket.timeout(8000).emit('room:create', {
      capacity, isPrivate: visibility === 'private',
      password: visibility === 'private' ? hostPassword.trim() : '',
      hostName: displayName, character,
    }, (error, result) => {
      setCreatingRoom(false)
      if (error || !result?.room || result.error) {
        setHostError(result?.error || 'Could not create the room. Please try again.')
        return
      }
      hostDialogRef.current?.close()
      openWaitingRoom(result.room, true)
    })
  }

  function handleRoomClick(room) {
    if (busy || room.players >= room.capacity) return
    if (room.isPrivate) {
      setPendingRoom(room)
      setJoinPassword('')
      setJoinError('')
      passwordDialogRef.current?.showModal()
    } else requestJoin(room)
  }

  function handlePasswordJoin(event) {
    event.preventDefault()
    if (pendingRoom) requestJoin(pendingRoom, joinPassword, { privateJoin: true })
  }

  return (
    <main className="guest-content multiplayer-page">
      <header className="multiplayer-heading">
        <span className={`lobby-connection${connected ? ' lobby-connection-online' : ''}`} role="status">
          <span aria-hidden="true" />{connected ? 'Connected' : 'Connecting…'}
        </span>
      </header>
      <div className="multiplayer-layout">
      <section className="game-options multiplayer-rooms" aria-label="Game options">
        <div className="game-option">
          <div className="lobby-section-heading">
            <h2>Open rooms</h2>
            <span className="lobby-room-count">{rooms.length} rooms</span>
          </div>
          <div className="lobby-filters" role="group" aria-label="Filter rooms">
            {['all', 'public', 'private'].map((value) => (
              <button className="lobby-filter" key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {value === 'all' ? 'All rooms' : value === 'public' ? 'Public' : 'Private'}
              </button>
            ))}
          </div>
          {(connectionError || lobbyError) && (
            <p className="auth-error" role="alert">
              {connectionError || lobbyError}
            </p>
          )}
          <div className="public-room-list" aria-label="Open rooms" aria-busy={joiningRoom}>
            {visibleRooms.length === 0 ? (
              <div className="lobby-empty">
                <span className="lobby-empty-symbol" aria-hidden="true">◇</span>
                <p>{connected ? (rooms.length ? 'No rooms match this filter. Try All rooms or host your own.' : 'No rooms yet. Host a game and invite your friends.') : 'Rooms will appear once the server connects.'}</p>
              </div>
            ) : (
              visibleRooms.map((room) => {
                const isFull = room.players >= room.capacity

                return (
                  <button
                    key={room.code}
                    className="public-room-card"
                    type="button"
                    disabled={isFull || busy || !connected || loading}
                    onClick={() => handleRoomClick(room)}
                  >
                    <span className="public-room-name">{room.name}</span>
                    <span className="public-room-details">
                      <span>
                        {room.players}/{room.capacity} players
                      </span>
                      <span className="lobby-room-badge">
                        {isFull
                            ? 'Full'
                            : room.isPrivate
                              ? 'Private'
                              : 'Public'}
                      </span>
                    </span>
                    <span className="lobby-room-action">{isFull ? 'Room full' : room.isPrivate ? 'Join with password →' : 'Join room →'}</span>
                  </button>
                )
              })
            )}
          </div>

        </div>
      </section>
      <aside className="lobby-sidebar" aria-label="Your party">
        <section className="lobby-profile">
          <p className="eyebrow">Playing as</p>
          <h2>{loading ? 'Loading…' : displayName}</h2>
          <p>{isGuest ? 'Guest adventurer' : selectedHero ? `${selectedHero.title} · ${selectedHero.name}` : 'Choose a hero before entering your room.'}</p>
          {!isGuest && <Link className="lobby-text-link" to="/heroes">{selectedHero ? 'Change hero' : 'Select hero'} →</Link>}
        </section>
        <section className="lobby-host-panel">
          <p className="eyebrow">Make it your game</p>
          <h2>Host a room</h2>
          <p>Gather 2–4 players in a public room, or set a password for a private party.</p>
          <button className="button button-host" type="button" disabled={!connected || busy || loading} onClick={openHostDialog}>Host game →</button>
        </section>
      </aside>
      </div>

      <dialog
        ref={hostDialogRef}
        className="room-dialog"
        aria-labelledby={hostHeadingId}
        onCancel={(event) => { if (creatingRoom) event.preventDefault() }}
        onClose={() => {
          setHostError('')
          setHostPassword('')
        }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
            closeHostDialog()
          }
        }}
      >
        <form method="dialog" className="room-dialog-close">
          <button className="button" type="submit" aria-label="Close host settings" disabled={creatingRoom}>
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
                onChange={() => {
                  setVisibility('public')
                  setHostPassword('')
                  setHostError('')
                }}
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
          <p className="lobby-dialog-hint">{visibility === 'private' ? 'Friends will need your password to join.' : 'Anyone in the lobby can join your room.'}</p>

          <button className="button button-host" type="submit" disabled={creatingRoom || !connected}>
            <span className="auth-button-arrow" aria-hidden="true">
              →
            </span>
            {creatingRoom ? 'Creating…' : 'Create room'}
          </button>
        </form>
      </dialog>

      <dialog
        ref={passwordDialogRef}
        className="room-dialog"
        aria-labelledby={passwordHeadingId}
        onCancel={(event) => { if (joiningRoom) event.preventDefault() }}
        onClose={() => {
          setPendingRoom(null)
          setJoinPassword('')
          setJoinError('')
        }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
            closePasswordDialog()
          }
        }}
      >
        <form method="dialog" className="room-dialog-close">
          <button className="button" type="submit" aria-label="Close password prompt" disabled={joiningRoom}>
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
          <button className="button button-join" type="submit" disabled={joiningRoom || !connected}>
            <span className="auth-button-arrow" aria-hidden="true">
              →
            </span>
            {joiningRoom ? 'Joining…' : 'Join room'}
          </button>
        </form>
      </dialog>
    </main>
  )
}
