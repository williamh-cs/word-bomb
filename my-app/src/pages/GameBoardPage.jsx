import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { gameBackgrounds } from '../data/gameBackgrounds'
import guestPlayer from '../assets/guest_player.png'
import { heroes } from '../data/heroes'
import BoardCharacter from '../components/BoardCharacter'
import { getCountdownLabel } from '../data/gameCountdown'
import { lobbySocket } from '../lib/lobbySocket'
import PlayerHearts from '../components/PlayerHearts'
import EggHandoff from '../components/EggHandoff'
import WordEntry from '../components/WordEntry'

export default function GameBoardPage({ playerCount = 2 }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const room = state?.room
  const [gameRoom, setGameRoom] = useState(room ?? null)
  const [word, setWord] = useState('')
  const [error, setError] = useState('')
  const [returning, setReturning] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const sceneRef = useRef(null)
  const currentRoom = gameRoom
  const startedAt = currentRoom?.status === 'Started' ? currentRoom.startedAt : null
  const countdownLabel = getCountdownLabel(startedAt, now)

  useEffect(() => {
    if (!currentRoom?.code) return

    function updateRoom(nextRoom) {
      if (nextRoom.code !== currentRoom.code) return
      if (nextRoom.status === 'Waiting for players') {
        navigate('/waitingroom', {
          replace: true,
          state: {
            room: nextRoom,
            isHost: nextRoom.hostSocketId === lobbySocket.id,
            currentPlayerIndex: nextRoom.playerIds.indexOf(lobbySocket.id),
          },
        })
        return
      }
      setGameRoom(nextRoom)
    }

    function syncRoom() {
      lobbySocket.timeout(8000).emit('room:state', (requestError, result) => {
        if (requestError || result?.error) {
          setError(result?.error || 'Could not reconnect to the game.')
          return
        }
        updateRoom(result.room)
        setError('')
      })
    }

    lobbySocket.on('room:updated', updateRoom)
    lobbySocket.on('room:started', updateRoom)
    lobbySocket.on('room:waiting', updateRoom)
    lobbySocket.on('connect', syncRoom)
    if (lobbySocket.connected) syncRoom()
    else lobbySocket.connect()

    return () => {
      lobbySocket.off('room:updated', updateRoom)
      lobbySocket.off('room:started', updateRoom)
      lobbySocket.off('room:waiting', updateRoom)
      lobbySocket.off('connect', syncRoom)
    }
  }, [currentRoom?.code, navigate])

  useEffect(() => {
    if (currentRoom?.status !== 'Started') return
    const timer = window.setInterval(() => setNow(Date.now()), 50)
    return () => window.clearInterval(timer)
  }, [currentRoom?.status])

  function submitAnswer(event) {
    event.preventDefault()
    if (!currentRoom || !lobbySocket.connected) {
      setError('Not connected to the game server.')
      return
    }

    setError('')
    lobbySocket.timeout(8000).emit('game:word', { word }, (requestError, result) => {
      if (requestError || result?.error) {
        setError(result?.error || 'Could not submit your word. Please try again.')
        return
      }
      setGameRoom(result.room)
      setWord('')
    })
  }

  function returnToWaitingRoom() {
    if (returning || currentRoom?.hostSocketId !== lobbySocket.id) return
    if (!lobbySocket.connected) { setError('Not connected to the game server.'); return }
    setReturning(true)
    setError('')
    lobbySocket.timeout(8000).emit('room:return', (requestError, result) => {
      setReturning(false)
      if (requestError || result?.error) setError(result?.error || 'Could not return to the waiting room. Please try again.')
    })
  }

  const count = [2, 3, 4].includes(playerCount) ? playerCount : 2
  const hostIndex = Math.max(0, currentRoom?.playerIds?.indexOf(currentRoom.hostSocketId) ?? 0)
  const islandPositions = count === 3 ? [19.2, 50, 80.8] : count === 4 ? [12.2, 37.5, 62.5, 88] : null
  const currentTurnIndex = currentRoom?.playerIds?.indexOf(currentRoom.currentTurnPlayerId) ?? -1
  const currentTurnName = currentTurnIndex >= 0 ? currentRoom.playerNames[currentTurnIndex] : null
  const isMyTurn = currentRoom?.currentTurnPlayerId === lobbySocket.id
  const handoff = currentRoom?.handoff
  const isPassingEgg = Boolean(handoff && now < handoff.endsAt && currentRoom?.status === 'Started')
  const receivingIndex = currentRoom?.playerIds?.indexOf(handoff?.toPlayerId) ?? -1
  const secondsLeft = currentRoom?.turnEndsAt
    ? Math.max(0, Math.ceil((currentRoom.turnEndsAt - now) / 1000))
    : 0
  const turnStarted = Number.isFinite(startedAt) && now >= startedAt + 4000
  const canSubmit = currentRoom?.status === 'Started'
    && isMyTurn
    && turnStarted
    && !isPassingEgg
    && now >= (currentRoom?.turnStartsAt ?? 0)
    && secondsLeft > 0
  const winnerIndex = currentRoom?.playerIds?.indexOf(currentRoom.winnerSocketId) ?? -1
  const winnerName = winnerIndex >= 0 ? currentRoom.playerNames[winnerIndex] : null

  return (
    <main className="game-board-page">
      <div className="game-board-toolbar">
        <div>
          <p className="eyebrow">The word arena</p>
          <h1>Game board</h1>
        </div>
        <Link className="button button-how-to-play hero-back" to="/">Back to home</Link>
      </div>
      <section
        ref={sceneRef}
        className={`game-board-scene game-board-scene-${count}`}
        style={{ backgroundImage: `url(${gameBackgrounds[count]})` }}
        aria-label={`${count}-player game board`}
      >
        <div className="board-player-slots" aria-label="Player slots">
          {Array.from({ length: count }, (_, index) => {
            const name = currentRoom?.playerNames?.[index] ?? `Player ${index + 1}`
            const characterId = currentRoom?.playerCharacters?.[index]
            const isGuest = characterId === 'guest-player'
              || !characterId
            const hero = heroes.find((entry) => entry.id === characterId)
              ?? heroes[0]
            const isOccupied = !currentRoom || Boolean(currentRoom.playerNames?.[index])
            const image = isGuest ? guestPlayer : hero.image
            const characterName = isGuest ? 'Guest player' : hero.title
            const playerId = currentRoom?.playerIds?.[index]
            const lives = currentRoom?.playerLives?.[index] ?? 3
            const isEliminated = lives === 0
            const isThrowing = isPassingEgg && handoff.reason === 'word' && handoff.fromPlayerId === playerId
            const pose = isThrowing ? 'throwing' : playerId === currentRoom?.currentTurnPlayerId && turnStarted && !isPassingEgg && currentRoom?.status === 'Started' ? 'holding' : 'idle'
            const facing = isThrowing
              ? (receivingIndex > index ? 'right' : 'left')
              : (index > hostIndex || (index === hostIndex && hostIndex === count - 1) ? 'left' : 'right')

            return (
            <div
              className={`board-player-slot${playerId === currentRoom?.currentTurnPlayerId ? ' is-current-turn' : ''}${isEliminated ? ' is-eliminated' : ''}`}
              key={playerId ?? index}
              data-player-id={playerId}
              style={islandPositions ? { left: `${islandPositions[index]}%` } : undefined}
            >
              {isOccupied && (
                <BoardCharacter
                  image={image}
                  grounded={Boolean(islandPositions)}
                  facing={facing}
                  pose={pose}
                  actionStartedAt={isThrowing ? handoff.startedAt : null}
                  label={`${name}'s character: ${characterName}`}
                />
              )}
              <span className="board-player-name">{isOccupied ? name : 'Waiting for player'}</span>
              {isOccupied && <PlayerHearts lives={lives} />}
            </div>
            )
          })}
        </div>
        {isPassingEgg && <EggHandoff handoff={handoff} sceneRef={sceneRef} />}
        {currentRoom?.status === 'Started' && !countdownLabel && (
          <div className="board-timer" role="timer" aria-label={isPassingEgg ? 'Timer paused during egg handoff' : `${secondsLeft} seconds remaining`}>
            <span className="board-timer-label">{isPassingEgg ? 'Next turn' : 'Time left'}</span>
            <span className={`board-timer-number${!isPassingEgg && secondsLeft <= 5 ? ' is-urgent' : ''}`}>
              {isPassingEgg ? '—' : secondsLeft}<span className="board-timer-unit">{isPassingEgg ? '' : 's'}</span>
            </span>
          </div>
        )}
        <div className="board-word-panel">
          <p className="eyebrow">{currentRoom?.status === 'Finished' ? 'Game over' : 'Word chain'}</p>
          <h2>{currentRoom?.currentWord ? <>{currentRoom.currentWord.slice(0, -2)}<span>{currentRoom.currentWord.slice(-2)}</span></> : 'Waiting'}</h2>
          {currentRoom?.status === 'Finished' ? (
            <p>{currentRoom.winnerSocketId
              ? `${currentRoom.playerNames[currentRoom.playerIds.indexOf(currentRoom.winnerSocketId)]} wins!`
              : 'No winner.'}</p>
          ) : currentRoom?.status === 'Started' ? (
            <>
              <p>Next word contains <strong>{currentRoom.currentWord?.slice(-2).toUpperCase()}</strong>. No repeats!</p>
              {countdownLabel ? (
                <span className="board-waiting">Get ready…</span>
              ) : (
                <>
                  <span className="board-waiting">
                    {isPassingEgg ? `Passing the egg to ${currentTurnName ?? 'the next player'}…` : isMyTurn ? 'Your turn' : `${currentTurnName ?? 'Next player'}’s turn`}
                  </span>
                  {currentRoom.lastAction?.type === 'timeout' && (
                    <p className="board-last-action">
                      {currentRoom.playerNames[currentRoom.playerIds.indexOf(currentRoom.lastAction.playerId)]} ran out of time and lost a life.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <span className="board-waiting">Waiting for players</span>
          )}
        </div>
        {countdownLabel && (
          <div className="board-countdown" role="status" aria-live="assertive" aria-atomic="true">
            <span className="board-countdown-value" key={countdownLabel}>{countdownLabel}</span>
          </div>
        )}
        {currentRoom?.status === 'Finished' && (
          <section className="board-game-over" aria-labelledby="game-winner-heading">
            <div className="board-winner-content">
              <p className="eyebrow">The word arena has a champion</p>
              <h2 id="game-winner-heading">{winnerName ? `${winnerName} wins!` : 'Game over'}</h2>
              <p>{winnerName ? 'The last adventurer standing.' : 'This game has ended.'}</p>
              {currentRoom.hostSocketId === lobbySocket.id ? (
                <button className="button button-host" type="button" onClick={returnToWaitingRoom} disabled={returning}>
                  {returning ? 'Returning…' : 'Return to Waiting Room'}
                </button>
              ) : <p className="board-winner-waiting">Waiting for the host to return everyone to the waiting room.</p>}
              {error && <p className="board-word-error" role="alert">{error}</p>}
            </div>
          </section>
        )}
      </section>
      {currentRoom?.status === 'Started' && !countdownLabel && (
        <WordEntry
          word={word}
          onChange={setWord}
          onSubmit={submitAnswer}
          enabled={canSubmit}
          error={error}
          hint={isPassingEgg ? 'The egg is on its way…' : isMyTurn ? 'Type your word · press Enter to send' : `Waiting for ${currentTurnName ?? 'the next player'} to play`}
        />
      )}
    </main>
  )
}
