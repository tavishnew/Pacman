import React, { useState, useEffect } from 'react'
import './GameLauncher.css'
import GameScreen from './GameScreen'

import { API_URL as apiUrl } from '../config'

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
        alert("We couldn't create the game. Please try again.")
      }
    } catch (error) {
      console.error('Multiplayer error:', error)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        alert('Could not reach the game server. It may be starting up - please wait 30 seconds and try again.')
      } else {
        alert('Failed to create multiplayer game. The server may be waking up - try again shortly.')
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
      alert("We couldn't join that game. Check the Session ID and try again.")
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
      color: '#1F8A52',
      action: startSolo,
      disabled: false
    },
    {
      id: 'multiplayer',
      title: '2 PLAYER',
      icon: '2P',
      description: 'Play with friends',
      features: ['Real-time multiplayer', 'Invite friends', 'Competitive scoring'],
      color: '#D8402C',
      action: createMultiplayerGame,
      disabled: loading
    },
  ]

  return (
    <div className="game-launcher">
      <div className="launcher-header">
        <h2 className="launcher-title">CHOOSE YOUR GAME MODE</h2>
        <p className="launcher-subtitle">Pick your challenge</p>
        <div className="arcade-status">
          <span className="status-label">Arcade Online</span>
          <span className="tick-num">
            <span className="tick-inner">1,240</span>
          </span>
        </div>
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
            START GAME
          </button>
          <button className="lobby-cancel-btn" onClick={() => setLobbySessionId(null)}>
            CANCEL
          </button>
        </div>
      )}

      <div className="game-modes-grid">
        {modes.map((mode, index) => (
          <div
            key={mode.id}
            className={`mode-card anim-stamp ${selectedMode === mode.id ? 'selected' : ''} ${mode.id === 'multiplayer' && isGuest ? 'login-required' : ''}`}
            onClick={() => setSelectedMode(mode.id)}
            style={{ '--card-color': mode.color, '--i': index }}
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
                className="launch-btn"
                onClick={event => {
                  event.stopPropagation()
                  mode.action()
                }}
                disabled={loading}
              >
                {loading && mode.id === 'multiplayer' ? 'CREATING GAME...' : mode.id === 'multiplayer' && isGuest ? 'LOGIN TO PLAY' : mode.id === 'multiplayer' ? 'CREATE GAME' : 'PLAY NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="game-features-section">
        <h3 className="features-title">GAME FEATURES</h3>
        <div className="features-grid">
          <div className="feature-item anim-stamp" style={{ '--i': 0 }}>
            <span className="feature-label">AI GHOSTS</span>
            <span className="feature-value">4</span>
          </div>
          <div className="feature-item anim-stamp" style={{ '--i': 1 }}>
            <span className="feature-label">PELLETS</span>
            <span className="feature-value">244</span>
          </div>
          <div className="feature-item anim-stamp" style={{ '--i': 2 }}>
            <span className="feature-label">PLATFORMS</span>
            <span className="feature-value">WEB</span>
          </div>
          <div className="feature-item anim-stamp" style={{ '--i': 3 }}>
            <span className="feature-label">FPS</span>
            <span className="feature-value">60</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameLauncher
