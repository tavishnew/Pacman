import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './Leaderboard.css'

// Season end anchor for the live countdown (session-stable; swap for a real
// backend season-end timestamp when one exists).
const SEASON_END = Date.now() + ((12 * 24 + 4) * 60 + 21) * 60 * 1000

function formatCountdown(ms) {
  if (ms <= 0) return 'ENDED'
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${d}D ${String(h).padStart(2, '0')}H ${String(m).padStart(2, '0')}M ${String(s).padStart(2, '0')}S`
}

async function authedFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  })
  let data = null
  try { data = await res.json() } catch { /* no body */ }
  if (!res.ok) {
    const error = new Error((data && data.error) || `Request failed (${res.status})`)
    error.status = res.status
    error.data = data
    throw error
  }
  return data
}

function Leaderboard({ user, token, API_URL, onNavigate }) {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([])
  const [activeTab, setActiveTab] = useState('global')
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  const fetchLeaderboards = useCallback(async () => {
    setLoading(true)
    try {
      const requests = [authedFetch(`${API_URL}/api/game/leaderboard/global`)]
      const isAuthed = token && token !== 'guest-session'
      if (isAuthed) {
        requests.push(
          authedFetch(`${API_URL}/api/game/leaderboard/friends`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      }

      const [globalData, friendsData] = await Promise.all(requests)
      setGlobalLeaderboard(globalData || [])
      setFriendsLeaderboard(friendsData || [])
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err)
    }
    setLoading(false)
  }, [API_URL, token])

  useEffect(() => {
    fetchLeaderboards()
  }, [fetchLeaderboards])

  // Tick the season countdown every second (backward countdown)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    return `${seconds.toFixed(1)}s`
  }

  // Sort by score so rank reflects standing; assign 1-based rank.
  const rankedGlobal = useMemo(
    () => [...globalLeaderboard].sort((a, b) => (b.high_score || 0) - (a.high_score || 0)),
    [globalLeaderboard]
  )

  const rankedFriends = useMemo(
    () => [...friendsLeaderboard].sort((a, b) => (b.high_score || 0) - (a.high_score || 0)),
    [friendsLeaderboard]
  )

  const userGlobalRank = rankedGlobal.findIndex((p) => p.id === user?.user_id) + 1
  const userFriendsRank = rankedFriends.findIndex((p) => p.id === user?.user_id) + 1
  const userRow = rankedGlobal.find((p) => p.id === user?.user_id)
  const nextTarget = rankedGlobal.find((p) => (p.high_score || 0) > (userRow?.high_score || 0))
  const progress = userRow && nextTarget
    ? Math.min(100, Math.round((userRow.high_score / nextTarget.high_score) * 100))
    : userRow && !nextTarget
      ? 100
      : 0

  const totalPlayers = rankedGlobal.length
  const gamesLogged = rankedGlobal.reduce((sum, p) => sum + (p.games_played || 0), 0)
  const timeLeft = Math.max(0, SEASON_END - now)

  const renderTable = (data) => (
    <div className="rank-table">
      <div className="rank-row rank-head">
        <span>RNK</span>
        <span>HANDLE</span>
        <span>SCORE</span>
        <span>GAMES</span>
        <span>BEST</span>
      </div>
      {data.length === 0 ? (
        <div className="no-data">No scores yet. Play a round to claim your spot on the board.</div>
      ) : (
        data.map((player, index) => {
          const isCurrent = player.id === user?.user_id
          return (
            <div
              key={player.id}
              className={`rank-row anim-stamp ${isCurrent ? 'current-user' : ''}`}
              style={{ '--i': index }}
            >
              <span className="rank-cell">
                {isCurrent ? <span className="you-badge">YOU</span> : index + 1}
              </span>
              <span className="player-cell">{player.username}</span>
              <span className="score-cell">{(player.high_score || 0).toLocaleString()}</span>
              <span className="games-cell">{player.games_played || 0}</span>
              <span className="best-cell">{formatTime(player.completion_time)}</span>
            </div>
          )
        })
      )}
    </div>
  )

  if (loading) {
    return <div className="loading">Loading leaderboards...</div>
  }

  return (
    <div className="leaderboard">
      <header className="lb-header">
        <div className="lb-title-row">
          <h1 className="lb-title">GLOBAL<br />RANKINGS</h1>
          <div className="lb-badges">
            <span className="brutal-tag">SEASON 1 ACTIVE</span>
            <span className="brutal-tag on-dark">ENDS IN {formatCountdown(timeLeft)}</span>
          </div>
        </div>
        <div className="lb-stats">
          <div className="lb-stat">
            <div className="lb-stat-label">TOTAL PLAYERS</div>
            <div className="lb-stat-value">{totalPlayers.toLocaleString()}</div>
          </div>
          <div className="lb-stat lb-stat-div">
            <div className="lb-stat-label">GAMES LOGGED</div>
            <div className="lb-stat-value">{gamesLogged.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <div className="lb-rule" />

      <div className="lb-grid">
        {/* Rankings table */}
        <div className="lb-main">
          <div className="lb-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
              onClick={() => setActiveTab('global')}
            >
              GLOBAL
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              FRIENDS
            </button>
          </div>
          {activeTab === 'global' ? renderTable(rankedGlobal) : renderTable(rankedFriends)}
        </div>

        {/* User stats sidebar */}
        <aside className="lb-side">
          <div className="lb-side-head">👤 YOUR<br />STARTER</div>

          <div className="lb-side-block">
            <div className="lb-side-label">CURRENT RANK</div>
            <div className="lb-side-value">{userGlobalRank || 'UNRANKED'}</div>
          </div>
          <div className="lb-side-line" />

          <div className="lb-side-block">
            <div className="lb-side-label">SCORE</div>
            <div className="lb-side-value">
              {(userRow?.high_score || 0).toLocaleString()}
            </div>
          </div>
          <div className="lb-side-line" />

          <div className="lb-side-block">
            <div className="lb-side-label">
              NEXT TARGET: {nextTarget ? nextTarget.username : 'TOP OF BOARD'}
            </div>
            <div className="lb-progress">
              <div className="lb-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="lb-side-note">
              {nextTarget
                ? `${(nextTarget.high_score - (userRow?.high_score || 0)).toLocaleString()} PTS AWAY`
                : 'YOU ARE #1'}
            </div>
          </div>
          <div className="lb-side-line" />

          <button
            type="button"
            className="btn lb-find"
            onClick={() => onNavigate?.('play')}
          >
            FIND MATCH →
          </button>

          <div className="lb-breakdown">
            <div className="lb-breakdown-title">📊 RANKINGS</div>
            <div className="lb-breakdown-row">
              <span>GLOBAL</span>
              <span className="lb-breakdown-val">#{userGlobalRank || '—'}</span>
            </div>
            {friendsLeaderboard.length > 0 && (
              <div className="lb-breakdown-row">
                <span>FRIENDS</span>
                <span className="lb-breakdown-val">#{userFriendsRank || '—'}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Leaderboard
