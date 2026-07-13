import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './Dashboard.css'

import { API_URL } from '../config'

function Dashboard({ user, token, refreshKey = 0, onNavigate }) {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  const isGuest = !token || token === 'guest-session' || String(user?.user_id || '').startsWith('guest')

  const fetchStats = useCallback(async () => {
    if (isGuest || !user?.user_id) {
      setLoading(false)
      return
    }
    try {
      const res = await axios.get(
        `${API_URL}/api/game/stats/${user.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setStats(res.data || {})
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
    setLoading(false)
  }, [isGuest, user?.user_id, token])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshKey])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>🎮 Welcome back, {user.username}! 🎮</h2>
        <p>Ready to conquer the maze?</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card anim-stamp" style={{ '--i': 0 }}>
          <h3>🏆 High Score</h3>
          <div className="stat-value">{stats.high_score || 0}</div>
        </div>

        <div className="stat-card anim-stamp" style={{ '--i': 1 }}>
          <h3>🎯 Games Played</h3>
          <div className="stat-value">{stats.games_played || 0}</div>
        </div>

        <div className="stat-card anim-stamp" style={{ '--i': 2 }}>
          <h3>⏱️ Best Time</h3>
          <div className="stat-value">{stats.completion_time ? `${stats.completion_time.toFixed(1)}s` : 'N/A'}</div>
        </div>

        <div className="stat-card anim-stamp" style={{ '--i': 3 }}>
          <h3>📅 Last Played</h3>
          <div className="stat-value">
            {stats.last_played ? new Date(stats.last_played).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={() => onNavigate?.('play')}>🎮 Play Solo</button>
          <button className="action-btn secondary" onClick={() => onNavigate?.('friends')}>👥 Play with Friends</button>
          <button className="action-btn tertiary" onClick={() => onNavigate?.('leaderboard')}>🏅 View Leaderboard</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
