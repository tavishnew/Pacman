import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import './GameScreen.css'

import { API_URL } from '../config'

const BOARD_WIDTH = 19
const BOARD_HEIGHT = 21
const START_POSITION = { x: 9, y: 15 }

// Per-ghost speed variation (ms) - adds life to ghost movement
const GHOST_SPEEDS = {
  blinky: 330,  // aggressive
  pinky: 360,   // balanced
  inky: 390,    // cautious
  clyde: 410    // slow
}

const GHOST_STARTS = [
  { id: 'blinky', x: 9, y: 9, color: 'red' },
  { id: 'pinky', x: 8, y: 9, color: 'pink' },
  { id: 'inky', x: 10, y: 9, color: 'cyan' },
  { id: 'clyde', x: 9, y: 11, color: 'orange' }
]

const initialBoard = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,2,1,1,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

const cloneBoard = () => initialBoard.map(row => [...row])
const countDots = board => board.flat().filter(cell => cell === 0).length
const cloneGhosts = () => GHOST_STARTS.map(ghost => ({ ...ghost }))
const isSamePosition = (first, second) => first.x === second.x && first.y === second.y
const getDistance = (first, second) => Math.abs(first.x - second.x) + Math.abs(first.y - second.y)
const getOpenNeighbors = (position, canMoveTo) => [
  { x: position.x + 1, y: position.y },
  { x: position.x - 1, y: position.y },
  { x: position.x, y: position.y + 1 },
  { x: position.x, y: position.y - 1 }
].filter(move => canMoveTo(move.x, move.y))

const getDirectionVector = direction => {
  const vectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }

  return vectors[direction] || vectors.right
}

const getNearestOpenTarget = (target, canMoveTo) => {
  if (canMoveTo(target.x, target.y)) return target

  const queue = [target]
  const visited = new Set([`${target.x},${target.y}`])

  while (queue.length > 0) {
    const current = queue.shift()
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ].filter(next => (
      next.x >= 0 &&
      next.x < BOARD_WIDTH &&
      next.y >= 0 &&
      next.y < BOARD_HEIGHT
    ))

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`
      if (visited.has(key)) continue
      if (canMoveTo(neighbor.x, neighbor.y)) return neighbor
      visited.add(key)
      queue.push(neighbor)
    }
  }

  return target
}

const getGhostTarget = (ghost, pacmanPos, direction, canMoveTo) => {
  const directionVector = getDirectionVector(direction)
  const rawTargets = {
    blinky: pacmanPos,
    pinky: {
      x: pacmanPos.x + directionVector.x * 4,
      y: pacmanPos.y + directionVector.y * 4
    },
    inky: {
      x: pacmanPos.x - directionVector.y * 5,
      y: pacmanPos.y + directionVector.x * 5
    },
    clyde: getDistance(ghost, pacmanPos) > 6
      ? pacmanPos
      : { x: 1, y: BOARD_HEIGHT - 2 }
  }

  const rawTarget = rawTargets[ghost.id] || pacmanPos
  const clampedTarget = {
    x: Math.max(0, Math.min(BOARD_WIDTH - 1, rawTarget.x)),
    y: Math.max(0, Math.min(BOARD_HEIGHT - 1, rawTarget.y))
  }

  return getNearestOpenTarget(clampedTarget, canMoveTo)
}

const getChaseMove = (ghost, target, canMoveTo, occupiedTiles) => {
  const queue = [{ position: { x: ghost.x, y: ghost.y }, firstStep: null }]
  const visited = new Set([`${ghost.x},${ghost.y}`])

  while (queue.length > 0) {
    const current = queue.shift()
    const neighbors = getOpenNeighbors(current.position, canMoveTo)

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`
      if (visited.has(key)) continue

      const firstStep = current.firstStep || neighbor
      if (occupiedTiles.has(`${firstStep.x},${firstStep.y}`)) continue

      if (isSamePosition(neighbor, target) && !occupiedTiles.has(`${firstStep.x},${firstStep.y}`)) {
        return firstStep
      }

      visited.add(key)
      queue.push({ position: neighbor, firstStep })
    }
  }

  return getOpenNeighbors(ghost, canMoveTo)
    .filter(move => !occupiedTiles.has(`${move.x},${move.y}`))
    .sort((first, second) => getDistance(first, target) - getDistance(second, target))[0] || ghost
}

const getWsUrl = () => {
  const explicit = import.meta.env.VITE_WS_URL
  if (explicit) {
    try {
      const parsed = new URL(explicit)
      if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
        console.warn('VITE_WS_URL must use ws:// or wss://, falling back to API URL')
      } else {
        return parsed.origin
      }
    } catch {
      console.warn('VITE_WS_URL is not a valid URL, falling back to API URL')
    }
  }

  const apiUrl = import.meta.env.VITE_API_URL || ''
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl)
      const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProtocol}//${parsed.host}`
    } catch {
      // fall through to window-derived default
    }
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${window.location.host}`
}

function GameScreen({
  playerName,
  onBackToLogin,
  isMultiplayer = false,
  sessionId = null,
  userId = 'guest',
  token = null,
  onGameEnd = null
}) {
  const [board, setBoard] = useState(cloneBoard)
  const [pacmanPos, setPacmanPos] = useState(START_POSITION)
  const [ghosts, setGhosts] = useState(cloneGhosts)
  const [direction, setDirection] = useState('right')
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [otherPlayerPos, setOtherPlayerPos] = useState(null)
  const [otherPlayerDir, setOtherPlayerDir] = useState('right')
  const [multiplayerStatus, setMultiplayerStatus] = useState(isMultiplayer ? 'Connecting...' : 'Solo')
  const [isMultiplayerReady, setIsMultiplayerReady] = useState(!isMultiplayer)
  const [isHost, setIsHost] = useState(!isMultiplayer)
  const startingDots = countDots(initialBoard)
  const [dotsRemaining, setDotsRemaining] = useState(startingDots)
  const startTimeRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)

  const wsRef = useRef(null)
  const pacmanPosRef = useRef(pacmanPos)
  const directionRef = useRef(direction)
  const playerIdentityRef = useRef({ playerName, userId })
  const queuedDirection = useRef(null)
  const isHostRef = useRef(!isMultiplayer)

  useEffect(() => { pacmanPosRef.current = pacmanPos }, [pacmanPos])
  useEffect(() => { directionRef.current = direction }, [direction])
  useEffect(() => { playerIdentityRef.current = { playerName, userId } }, [playerName, userId])

  useEffect(() => {
    if (!isMultiplayer || !sessionId) return undefined

    if (!token || token === 'guest-session') {
      setMultiplayerStatus('Login required for multiplayer')
      return undefined
    }

    const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`
    const socket = new WebSocket(wsUrl)
    wsRef.current = socket

    socket.onopen = () => {
      setIsMultiplayerReady(false)
      setMultiplayerStatus('Waiting for opponent...')
      socket.send(JSON.stringify({
        type: 'join_session',
        sessionId,
        playerName: playerIdentityRef.current.playerName
      }))
    }

    socket.onmessage = event => {
      let data
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }

      if (data.type === 'player_move' || data.type === 'player_state') {
        setOtherPlayerPos({ x: data.x, y: data.y })
        if (data.direction) setOtherPlayerDir(data.direction)
      }

      if (data.type === 'ghost_state') {
        // Guest receives ghost positions from host
        if (!isHostRef.current && data.ghosts) {
          setGhosts(data.ghosts)
        }
      }

      if (data.type === 'dot_eaten') {
      // Other player ate a dot - update our board
        const { x: dotX, y: dotY } = data
        setBoard(currentBoard => {
          if (currentBoard[dotY]?.[dotX] === 0) {
            const nextBoard = currentBoard.map(row => [...row])
            nextBoard[dotY][dotX] = 2
            return nextBoard
          }
          return currentBoard
        })
        setScore(s => s + 5)
        setDotsRemaining(d => {
          const next = d - 1
          if (next <= 0) setGameWon(true)
          return next
        })
      }

      if (data.type === 'game_over_sync') {
        setGameOver(true)
      }

      if (data.type === 'game_start') {
        const hostId = data.player1_id
        const amHost = hostId === playerIdentityRef.current.userId ||
                       String(hostId) === String(playerIdentityRef.current.userId)
        setIsHost(amHost)
        isHostRef.current = amHost
        setIsMultiplayerReady(true)
        setMultiplayerStatus(amHost ? 'Host - Multiplayer active' : 'Guest - Multiplayer active')
        // Send initial position so the opponent can render us before the first move
        if (socket.readyState === WebSocket.OPEN) {
          const pos = pacmanPosRef.current
          socket.send(JSON.stringify({
            type: 'player_state',
            x: pos.x,
            y: pos.y,
            direction: directionRef.current
          }))
        }
      }

      if (data.type === 'waiting') {
        setIsMultiplayerReady(false)
        setMultiplayerStatus(data.message)
      }

      if (data.type === 'player_left') {
        setIsMultiplayerReady(false)
        setMultiplayerStatus('Opponent left')
      }

      if (data.type === 'error') {
        setMultiplayerStatus(`Error: ${data.message || 'Unknown error'}`)
      }
    }

    socket.onerror = error => {
      console.error('WebSocket error:', error)
      setMultiplayerStatus('Connection error')
    }

    socket.onclose = () => {
      setIsMultiplayerReady(false)
      setMultiplayerStatus('Disconnected')
    }

    return () => {
      socket.close()
      if (wsRef.current === socket) {
        wsRef.current = null
      }
    }
  }, [isMultiplayer, sessionId, token])

  const sendPlayerMove = useCallback((x, y, nextDirection) => {
    if (!isMultiplayer || !sessionId) return
    const socket = wsRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    socket.send(JSON.stringify({
      type: 'player_move',
      x,
      y,
      direction: nextDirection
    }))
  }, [isMultiplayer, sessionId])

  const canMoveTo = useCallback((x, y) => (
    x >= 0 &&
    x < BOARD_WIDTH &&
    y >= 0 &&
    y < BOARD_HEIGHT &&
    board[y][x] !== 1
  ), [board])

  const movePacman = useCallback((deltaX, deltaY, nextDirection) => {
    if (gameOver || gameWon || !isMultiplayerReady) return

    setDirection(nextDirection)
    setPacmanPos(currentPosition => {
      const newX = currentPosition.x + deltaX
      const newY = currentPosition.y + deltaY

      if (!canMoveTo(newX, newY)) {
        // Queue this direction so the next tick can turn the corner once it becomes legal
        queuedDirection.current = { deltaX, deltaY, direction: nextDirection }
        return currentPosition
      }

      queuedDirection.current = null
      const nextPosition = { x: newX, y: newY }

      if (board[newY][newX] === 0) {
        setBoard(currentBoard => {
          const nextBoard = currentBoard.map(row => [...row])
          nextBoard[newY][newX] = 2
          return nextBoard
        })
        setScore(currentScore => currentScore + 10)
        setDotsRemaining(currentDots => {
          const nextDots = currentDots - 1
          if (nextDots === 0) setGameWon(true)
          return nextDots
        })
        // Broadcast dot eaten to other player
        if (isMultiplayer && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'dot_eaten', x: newX, y: newY }))
        }
      }

      if (ghosts.some(ghost => isSamePosition(ghost, nextPosition))) {
        setGameOver(true)
        if (isMultiplayer && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'game_over_sync' }))
        }
      }

      sendPlayerMove(newX, newY, nextDirection)
      return nextPosition
    })
  }, [board, canMoveTo, gameOver, gameWon, ghosts, isMultiplayerReady, sendPlayerMove])

  const movePacmanRef = useRef(movePacman)
  useEffect(() => { movePacmanRef.current = movePacman }, [movePacman])

  // Consume queued turn input on each pacman position update so corner turns feel responsive
  useEffect(() => {
    const queued = queuedDirection.current
    if (!queued) return
    if (gameOver || gameWon || !isMultiplayerReady) return

    const targetX = pacmanPos.x + queued.deltaX
    const targetY = pacmanPos.y + queued.deltaY
    if (canMoveTo(targetX, targetY)) {
      queuedDirection.current = null
      movePacmanRef.current(queued.deltaX, queued.deltaY, queued.direction)
    }
  }, [pacmanPos, canMoveTo, gameOver, gameWon, isMultiplayerReady])

  // Per-ghost timers, kept long-lived; pacman pos/direction read via refs to avoid timer churn
  // In multiplayer, only the host runs ghost AI and broadcasts positions
  useEffect(() => {
    if (gameOver || gameWon || !isMultiplayerReady) return undefined
    if (isMultiplayer && !isHost) return undefined // Guest skips ghost AI

    const ghostTimers = {}

    const moveGhost = (ghostId) => {
      const livePacmanPos = pacmanPosRef.current
      const liveDirection = directionRef.current

      setGhosts(currentGhosts => {
        const occupiedTiles = new Set(currentGhosts.map(g => `${g.x},${g.y}`))

        const nextGhosts = currentGhosts.map(ghost => {
          if (ghost.id !== ghostId) return ghost

          occupiedTiles.delete(`${ghost.x},${ghost.y}`)
          const target = getGhostTarget(ghost, livePacmanPos, liveDirection, canMoveTo)
          const bestMove = getChaseMove(ghost, target, canMoveTo, occupiedTiles)

          occupiedTiles.add(`${bestMove.x},${bestMove.y}`)
          return { ...ghost, ...bestMove, target }
        })

        // Single collision authority: the post-state check that runs after each ghost move
        if (nextGhosts.some(ghost => isSamePosition(ghost, livePacmanPos))) {
          setGameOver(true)
          if (isMultiplayer && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'game_over_sync' }))
          }
        }

        // Host broadcasts ghost positions to guest
        if (isMultiplayer && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ghost_state',
            ghosts: nextGhosts.map(g => ({ id: g.id, x: g.x, y: g.y, color: g.color }))
          }))
        }

        return nextGhosts
      })
    }

    GHOST_STARTS.forEach(ghost => {
      const speed = GHOST_SPEEDS[ghost.id]
      ghostTimers[ghost.id] = window.setInterval(() => moveGhost(ghost.id), speed)
    })

    return () => {
      Object.values(ghostTimers).forEach(timer => window.clearInterval(timer))
    }
  }, [canMoveTo, gameOver, gameWon, isMultiplayerReady, isMultiplayer, isHost])

  useEffect(() => {
    const handleKeyPress = event => {
      const keyMap = {
        ArrowUp: [0, -1, 'up'],
        w: [0, -1, 'up'],
        W: [0, -1, 'up'],
        ArrowDown: [0, 1, 'down'],
        s: [0, 1, 'down'],
        S: [0, 1, 'down'],
        ArrowLeft: [-1, 0, 'left'],
        a: [-1, 0, 'left'],
        A: [-1, 0, 'left'],
        ArrowRight: [1, 0, 'right'],
        d: [1, 0, 'right'],
        D: [1, 0, 'right']
      }
      const nextMove = keyMap[event.key]

      if (nextMove) {
        event.preventDefault()
        movePacman(...nextMove)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePacman])

  // Live elapsed clock (real units, ticks every second).
  useEffect(() => {
    if (gameOver || gameWon) return undefined
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(id)
  }, [gameOver, gameWon])

  // Persist stats once per game on win/loss for authenticated users
  const statsPostedRef = useRef(false)
  useEffect(() => {
    if (!gameOver && !gameWon) return
    if (statsPostedRef.current) return
    if (!token || token === 'guest-session') return
    if (typeof userId !== 'number' && !/^\d+$/.test(String(userId))) return

    statsPostedRef.current = true
    const completionTime = (Date.now() - startTimeRef.current) / 1000

    axios.post(
      `${API_URL}/api/game/stats/update`,
      { score, completion_time: completionTime },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        if (typeof onGameEnd === 'function') {
          onGameEnd({ score, completion_time: completionTime, won: gameWon })
        }
      })
      .catch(err => console.error('Failed to persist stats:', err))
  }, [gameOver, gameWon, score, token, userId, onGameEnd])

  const resetGame = () => {
    setBoard(cloneBoard())
    setPacmanPos(START_POSITION)
    setGhosts(cloneGhosts())
    setDirection('right')
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setDotsRemaining(startingDots)
    setElapsed(0)
    queuedDirection.current = null
    startTimeRef.current = Date.now()
    statsPostedRef.current = false
  }

  const formatClock = (total) => {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const renderCell = (cell, x, y) => {
    const ghost = ghosts.find(currentGhost => currentGhost.x === x && currentGhost.y === y)
    if (ghost) {
      return (
        <div
          key={`ghost-${ghost.id}-${x}-${y}`}
          className={`cell ghost ghost-${ghost.color}`}
          aria-label={`${ghost.id} ghost`}
          data-ghost={ghost.id}
          data-x={ghost.x}
          data-y={ghost.y}
          data-target-x={ghost.target?.x ?? pacmanPos.x}
          data-target-y={ghost.target?.y ?? pacmanPos.y}
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        >
          <span className="ghost-eye left-eye" />
          <span className="ghost-eye right-eye" />
        </div>
      )
    }

    if (x === pacmanPos.x && y === pacmanPos.y) {
      return <div key={`${x}-${y}`} className={`cell pacman pacman-${direction}`} aria-label="Pac-Man" />
    }

    if (otherPlayerPos && x === otherPlayerPos.x && y === otherPlayerPos.y) {
      return <div key={`other-player-${x}-${y}`} className={`cell other-player pacman-${otherPlayerDir}`} aria-label="Other player" />
    }

    if (cell === 1) return <div key={`${x}-${y}`} className="cell wall" />
    if (cell === 0) return <div key={`${x}-${y}`} className="cell dot" />
    return <div key={`${x}-${y}`} className="cell empty" />
  }

  return (
    <div className="game-screen">
      <div className="visually-hidden" aria-live="polite">{formatClock(elapsed)} elapsed</div>
      <div className="game-header">
        <h2>{playerName}'s Run</h2>
        <div className="game-stats">
          <span>Score: <span className="tick-num"><span key={score} className="tick-inner">{score}</span></span></span>
          <span>Dots: <span className="tick-num"><span key={dotsRemaining} className="tick-inner">{dotsRemaining}</span></span></span>
          <span>Time: {formatClock(elapsed)}</span>
          <span>{isMultiplayer ? multiplayerStatus : 'Ghosts: 4'}</span>
          {isMultiplayer && isMultiplayerReady && <span className="status-pill pulse">Live</span>}
          {isMultiplayer && sessionId && <span>Session: {sessionId}</span>}
        </div>
        <button onClick={onBackToLogin} className="back-button">Back to Modes</button>
      </div>

      <div className="game-board">
        {board.map((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}
      </div>

      <div className="game-controls">
        <p>{isMultiplayer && !isMultiplayerReady ? 'Share the session ID. Game starts when player 2 joins.' : 'Use arrow keys or WASD to move Pac-Man.'}</p>
        <button onClick={resetGame} className="reset-button">Reset Game</button>
      </div>

      {isMultiplayer && !isMultiplayerReady && !gameOver && !gameWon && (
        <div className="game-overlay waiting-overlay">
          <div className="game-message waiting-message">
            <h2>Waiting For Player 2</h2>
            <p>Session ID</p>
            <strong>{sessionId}</strong>
            <p>Game is locked until both players connect.</p>
            <button onClick={onBackToLogin} className="back-button">Back to Modes</button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="game-overlay">
          <div className="game-message">
            <h2>You Won!</h2>
            <p>You cleared the maze with a score of {score}.</p>
            <button onClick={resetGame} className="play-again-button">Play Again</button>
            <button onClick={onBackToLogin} className="back-button">Back to Modes</button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-overlay game-over-overlay">
          <div className="game-message game-over-message">
            <div className="game-over-icon">KO</div>
            <h2 className="game-over-title">GAME OVER</h2>
            <div className="score-display">
              <span className="score-label">Final Score</span>
              <span className="score-value">{score}</span>
            </div>
            <p className="game-over-text">
              A ghost caught Pac-Man and ended your run!
            </p>
            <div className="game-over-buttons">
              <button onClick={resetGame} className="btn-try-again">
                PLAY AGAIN
              </button>
              <button onClick={onBackToLogin} className="btn-back-modes">
                BACK TO MODES
              </button>
            </div>
            <div className="game-over-footer">
              <small>Better luck next time, champ!</small>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameScreen
