import React, { useState } from 'react'
import './GameLauncher.css'
import GameScreen from './GameScreen'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function GameLauncher({ user, token, onPlayingStateChange, onRequireLogin, onGameEnd }) {
  const [isPlayingSolo, setIsPlayingSolo] = useState(false)
  const [isPlayingMultiplayer, setIsPlayingMultiplayer] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [joinSessionId, setJoinSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [lobbySessionId, setLobbySessionId] = useState(null)
  const [copied, setCopied] = useState(false)
  const isGuest = token === 'guest-session' || String(user?.user_id || '').startsWith('guest')

  const exitGame = () => {
    setIsPlayingSolo(false)
    setIsPlayingMultiplayer(false)
    setCurrentSessionId(null)
    onPlayingStateChange?.(false)
  }

  const startSolo = () => {
    setIsPlayingSolo(true)
    onPlayingStateChange?.(true)
  }

  const launchMultiplayerGame = sessionId => {
    setCurrentSessionId(sessionId)
    setIsPlayingMultiplayer(true)
    onPlayingStateChange?.(true)
  }

  const createMultiplayerGame = async () => {
    if (isGuest) {
      onRequireLogin?.()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/game/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.session_id) {
        setLobbySessionId(data.session_id)
        setCopied(false)
      } else {
        alert(data.error || 'Failed to create game session')
      }
    } catch (error) {
      console.error('Multiplayer error:', error)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        alert('Could not reach the game server. It may be starting up — please wait 30 seconds and try again.')
      } else {
        alert('Failed to create multiplayer game. The server may be waking up — try again shortly.')
      }
    } finally {
      setLoading(false)
    }
  }

  const copySessionId = async () => {
    if (!lobbySessionId) return
    try {
      await navigator.clipboard?.writeText(lobbySessionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  const startFromLobby = () => {
    if (lobbySessionId) {
      launchMultiplayerGame(lobbySessionId)
      setLobbySessionId(null)
    }
  }

  const joinMultiplayerGame = async () => {
    if (isGuest) {
      onRequireLogin?.()
      return
    }

    const sessionId = joinSessionId.trim()
    if (!sessionId) return

    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/game/session/${encodeURIComponent(sessionId)}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      launchMultiplayerGame(sessionId)
    } catch (error) {
      console.error('Join multiplayer error:', error)
      alert(error.message || 'Failed to join multiplayer game.')
    } finally {
      setLoading(false)
    }
  }

  if (isPlayingSolo || isPlayingMultiplayer) {
    return (
      <GameScreen
        playerName={user?.username || 'Player'}
        onBackToLogin={exitGame}
        isMultiplayer={isPlayingMultiplayer}
        sessionId={currentSessionId}
        userId={user?.user_id || user?.id || user?.username || 'guest'}
        token={token}
        onGameEnd={onGameEnd}
      />
    )
  }

  const modes = [
    {
      id: 'solo',
      title: '1 PLAYER',
      icon: '1P',
      description: 'Challenge yourself',
      features: ['Classic gameplay', 'Score tracking', 'Personal best'],
      color: '#8ee99f',
      action: startSolo,
      disabled: false
    },
    {
      id: 'multiplayer',
      title: '2 PLAYER',
      icon: '2P',
      description: 'Play with friends',
      features: ['Real-time multiplayer', 'Invite friends', 'Competitive scoring'],
      color: '#ef6f9b',
      action: createMultiplayerGame,
      disabled: loading
    },
    {
      id: 'tournament',
      title: 'TOURNAMENT',
      icon: 'CUP',
      description: 'Ranked competition',
      features: ['Ranked matches', 'Brackets', 'Achievements'],
      color: '#ffd45a',
      action: () => {},
      disabled: true
    }
  ]

  return (
    <div className="game-launcher">
      <div className="launcher-header">
        <h2 className="launcher-title">CHOOSE YOUR GAME MODE</h2>
        <p className="launcher-subtitle">Pick your challenge</p>
      </div>

      {lobbySessionId && (
        <div className="multiplayer-lobby">
          <h3 className="lobby-title">GAME CREATED!</h3>
          <p className="lobby-subtitle">Share this Session ID with your friend</p>
          <div className="lobby-session-id">
            <code>{lobbySessionId}</code>
            <button className="lobby-copy-btn" onClick={copySessionId}>
              {copied ? '✓ COPIED' : '📋 COPY'}
            </button>
          </div>
          <button className="lobby-start-btn" onClick={startFromLobby}>
            START WAITING FOR PLAYER 2
          </button>
          <button className="lobby-cancel-btn" onClick={() => setLobbySessionId(null)}>
            CANCEL
          </button>
        </div>
      )}

      <div className="game-modes-grid">
        {modes.map(mode => (
          <div
            key={mode.id}
            className={`mode-card ${selectedMode === mode.id ? 'selected' : ''} ${mode.disabled ? 'disabled' : ''} ${mode.id === 'multiplayer' && isGuest ? 'login-required' : ''}`}
            onClick={() => !mode.disabled && setSelectedMode(mode.id)}
            style={{ '--card-color': mode.color }}
          >
            <div className="card-top">
              <div className="mode-icon-large">{mode.icon}</div>
            </div>
            <div className="card-middle">
              <h3 className="mode-title">{mode.title}</h3>
              <p className="mode-desc">{mode.description}</p>
            </div>
            <div className="card-bottom">
              <ul className="mode-features">
                {mode.features.map(feature => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {mode.id === 'multiplayer' && (
                <div className="join-session">
                  <input
                    className="join-session-input"
                    value={joinSessionId}
                    onChange={event => setJoinSessionId(event.target.value)}
                    onClick={event => event.stopPropagation()}
                    placeholder="Session ID"
                    disabled={loading || isGuest}
                  />
                  <button
                    className="join-session-btn"
                    onClick={event => {
                      event.stopPropagation()
                      joinMultiplayerGame()
                    }}
                    disabled={loading || isGuest || !joinSessionId.trim()}
                  >
                    JOIN
                  </button>
                </div>
              )}
              {mode.id === 'multiplayer' && isGuest && (
                <p className="login-required-note">Login required for 2 Player mode.</p>
              )}
              <button
                className={`launch-btn ${mode.disabled ? 'disabled' : ''}`}
                onClick={event => {
                  event.stopPropagation()
                  mode.action()
                }}
                disabled={mode.disabled || loading}
              >
                {mode.disabled ? 'COMING SOON' : loading && mode.id === 'multiplayer' ? 'WORKING...' : mode.id === 'multiplayer' && isGuest ? 'LOGIN TO PLAY' : mode.id === 'multiplayer' ? 'CREATE GAME' : 'PLAY NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="game-features-section">
        <h3 className="features-title">GAME FEATURES</h3>
        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-label">AI GHOSTS</span>
            <span className="feature-value">4</span>
          </div>
          <div className="feature-item">
            <span className="feature-label">PELLETS</span>
            <span className="feature-value">244</span>
          </div>
          <div className="feature-item">
            <span className="feature-label">PLATFORMS</span>
            <span className="feature-value">WEB</span>
          </div>
          <div className="feature-item">
            <span className="feature-label">FPS</span>
            <span className="feature-value">60</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameLauncher
