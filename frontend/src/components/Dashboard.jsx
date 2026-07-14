import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './Dashboard.css'

import { API_URL } from '../config'

const GAME_MODES = [
  {
    id: 1,
    name: 'MAZE RUNNER',
    tag: 'FFA SPRINT',
    color: 'var(--accent-yellow)',
    text: 'var(--ink)',
    max: 8,
    queue: 1402,
    difficulty: 'HOT',
    desc: 'Standard elimination. Highest score after 3 minutes wins. Ghost speed climbs 10% every 30s. No hiding.'
  },
  {
    id: 2,
    name: 'PAC ROYALE',
    tag: 'ELIMINATION',
    color: 'var(--accent-red)',
    text: '#FAF7EE',
    max: 100,
    queue: 890,
    difficulty: null,
    desc: 'One giant brutalist maze. Borders shrink. Last PAC standing. Death is permanent.'
  },
  {
    id: 3,
    name: 'GHOST PROTOCOL',
    tag: 'ASYMMETRIC',
    color: 'var(--accent-green)',
    text: '#FAF7EE',
    max: 4,
    queue: 432,
    difficulty: null,
    desc: 'One PAC, four ghosts. Ghosts must coordinate. PAC must survive 3 minutes.'
  },
  {
    id: 4,
    name: 'RANKED DUEL',
    tag: '1v1',
    color: 'var(--ink)',
    text: '#FAF7EE',
    max: 2,
    queue: 89,
    difficulty: 'BETA',
    desc: 'Mirror maze. Identical pill layout. Highest score wins. No randomness.'
  }
]

function Dashboard({ user, token, refreshKey = 0, onNavigate }) {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [playersOnline, setPlayersOnline] = useState(14082)
  const [selected, setSelected] = useState(null)

  const isGuest =
    !token || token === 'guest-session' || String(user?.user_id || '').startsWith('guest')

  // Real, user-aligned activity feed (no fake global stats)
  const liveFeed = (() => {
    if (isGuest || !user) {
      return [
        { time: '—', player: 'GUEST', action: 'Log in to track your live feed', color: 'var(--ink-soft)' }
      ]
    }
    return [
      { time: 'NOW', player: user.username, action: `HIGH SCORE ${stats.high_score || 0}`, color: 'var(--accent-yellow)' },
      { time: 'NOW', player: user.username, action: `GAMES PLAYED ${stats.games_played || 0}`, color: 'var(--ink)' },
      { time: 'NOW', player: user.username, action: `BEST TIME ${stats.completion_time ? stats.completion_time.toFixed(1) + 's' : 'N/A'}`, color: 'var(--accent-green)' },
      { time: 'NOW', player: user.username, action: `LAST PLAYED ${stats.last_played ? new Date(stats.last_played).toLocaleDateString() : 'NEVER'}`, color: 'var(--accent-red)' }
    ]
  })()

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlayersOnline((n) => Math.max(10000, n + (Math.floor(Math.random() * 21) - 10)))
    }, 3500)
    return () => window.clearInterval(id)
  }, [])

  const fetchStats = useCallback(async () => {
    if (isGuest || !user?.user_id) {
      setLoading(false)
      return
    }
    try {
      const res = await axios.get(`${API_URL}/api/game/stats/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data || {})
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
    setLoading(false)
  }, [isGuest, user?.user_id, token])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshKey])

  return (
    <div className="lobby">
      <header className="lobby-header">
        <h1>SELECT PROTOCOL</h1>
        <p className="lobby-sub">CHOOSE YOUR ARENA. NO HESITATION.</p>
        <div className="lobby-rule" />
      </header>

      <div className="lobby-grid">
        {/* Game mode cards */}
        <div className="lobby-modes">
          {GAME_MODES.map((mode) => (
            <div
              key={mode.id}
              className={`mode-card anim-stamp ${selected === mode.id ? 'selected' : ''}`}
              style={{ '--mode-color': mode.color, '--mode-text': mode.text, '--i': mode.id - 1 }}
              onClick={() => setSelected(mode.id)}
            >
              <div className="mode-card-head">
                <span className="mode-tag">{mode.tag}</span>
                {mode.difficulty && <span className="mode-diff">{mode.difficulty}</span>}
              </div>
              <div className="mode-card-body">
                <h3 className="mode-name">{mode.name}</h3>
                <div className="mode-meta">
                  <span>👥 {mode.max} MAX</span>
                  <span>⚡ {mode.queue.toLocaleString()} IN QUEUE</span>
                </div>
                <p className="mode-desc">{mode.desc}</p>
                <button
                  type="button"
                  className="btn btn-yellow mode-enter"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate?.('play')
                  }}
                >
                  ENTER PROTOCOL →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="lobby-side">
          <div className="net-panel">
            <div className="net-title">⚡ NETWORK_STAT</div>
            <div className="net-row">
              <span>STATUS</span>
              <span className="net-ok">OPTIMAL</span>
            </div>
            <div className="net-row">
              <span>PLAYERS ONLINE</span>
              <span className="net-num">
                <span className="tick-num">
                  <span key={playersOnline} className="tick-inner">
                    {playersOnline.toLocaleString()}
                  </span>
                </span>
              </span>
            </div>
            <div className="net-row">
              <span>ACTIVE MATCHES</span>
              <span className="net-num">843</span>
            </div>
            <div className="net-row">
              <span>PING / REGION</span>
              <span className="net-num">24ms / INDIA</span>
            </div>
          </div>

          <div className="feed-panel">
            <div className="feed-title">⚡ LIVE FEED</div>
            <div className="feed-list">
              {liveFeed.map((ev, i) => (
                <div key={i} className="feed-item">
                  <span className="feed-time">{ev.time}</span>
                  <div className="feed-body">
                    <div className="feed-player">
                      <span className="feed-dot" style={{ background: ev.color }}>
                        {ev.player.charAt(0)}
                      </span>
                      {ev.player}
                    </div>
                    <div className="feed-action">{ev.action}</div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-yellow feed-btn">
              VIEW FULL FEED →
            </button>
          </div>
        </aside>
      </div>

      {!loading && (
        <section className="lobby-standing">
          <div className="standing-head">
            <h2>YOUR STANDING</h2>
            <span className="standing-user">{user.username}</span>
          </div>
          <div className="standing-grid">
            <div className="standing-card anim-stamp" style={{ '--i': 0 }}>
              <div className="standing-label">🏆 HIGH SCORE</div>
              <div className="standing-value">{stats.high_score || 0}</div>
            </div>
            <div className="standing-card anim-stamp" style={{ '--i': 1 }}>
              <div className="standing-label">🎯 GAMES PLAYED</div>
              <div className="standing-value">{stats.games_played || 0}</div>
            </div>
            <div className="standing-card anim-stamp" style={{ '--i': 2 }}>
              <div className="standing-label">⏱ BEST TIME</div>
              <div className="standing-value">
                {stats.completion_time ? `${stats.completion_time.toFixed(1)}s` : 'N/A'}
              </div>
            </div>
            <div className="standing-card anim-stamp" style={{ '--i': 3 }}>
              <div className="standing-label">📅 LAST PLAYED</div>
              <div className="standing-value">
                {stats.last_played ? new Date(stats.last_played).toLocaleDateString() : 'NEVER'}
              </div>
            </div>
          </div>
          <div className="standing-actions">
            <button type="button" className="btn btn-yellow" onClick={() => onNavigate?.('play')}>
              🎮 PLAY SOLO
            </button>
            <button type="button" className="btn" onClick={() => onNavigate?.('friends')}>
              👥 PLAY WITH FRIENDS
            </button>
            <button type="button" className="btn btn-green" onClick={() => onNavigate?.('leaderboard')}>
              🏅 LEADERBOARD
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard
