import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './Leaderboard.css'

function Leaderboard({ user, token, API_URL }) {
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([])
  const [activeTab, setActiveTab] = useState('global')
  const [loading, setLoading] = useState(true)

  const fetchLeaderboards = useCallback(async () => {
    setLoading(true)
    try {
      const requests = [axios.get(`${API_URL}/api/game/leaderboard/global`)]
      const isAuthed = token && token !== 'guest-session'
      if (isAuthed) {
        requests.push(axios.get(`${API_URL}/api/game/leaderboard/friends`, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      }

      const [globalRes, friendsRes] = await Promise.all(requests)

      setGlobalLeaderboard(globalRes.data || [])
      setFriendsLeaderboard(friendsRes ? (friendsRes.data || []) : [])
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err)
    }
    setLoading(false)
  }, [API_URL, token])

  useEffect(() => {
    fetchLeaderboards()
  }, [fetchLeaderboards])

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    return `${seconds.toFixed(1)}s`
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const renderLeaderboard = (data, title) => (
    <div className="leaderboard-content">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <div className="no-data">No data available</div>
      ) : (
        <div className="leaderboard-table">
          <div className="table-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Score</span>
            <span>Games</span>
            <span>Best Time</span>
          </div>
          {data.map((player, index) => (
            <div
              key={player.id}
              className={`table-row ${player.id === user?.user_id ? 'current-user' : ''}`}
            >
              <span className="rank">{getRankIcon(index + 1)}</span>
              <span className="player-name">{player.username}</span>
              <span className="score">{player.high_score || 0}</span>
              <span className="games">{player.games_played || 0}</span>
              <span className="time">{formatTime(player.completion_time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return <div className="loading">Loading leaderboards...</div>
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏅 Leaderboards</h2>
        <p>See how you stack up against other players!</p>
      </div>

      <div className="leaderboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
          onClick={() => setActiveTab('global')}
        >
          🌍 Global
        </button>
        <button
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          👥 Friends
        </button>
      </div>

      <div className="leaderboard-container">
        {activeTab === 'global' && renderLeaderboard(globalLeaderboard, '🌍 Global Leaderboard')}
        {activeTab === 'friends' && renderLeaderboard(friendsLeaderboard, '👥 Friends Leaderboard')}
      </div>

      <div className="leaderboard-stats">
        <div className="stat-box">
          <h4>Your Rank (Global)</h4>
          <div className="stat-value">
            {globalLeaderboard.findIndex(p => p.id === user?.user_id) + 1 || 'Unranked'}
          </div>
        </div>
        <div className="stat-box">
          <h4>Your Best Score</h4>
          <div className="stat-value">
            {globalLeaderboard.find(p => p.id === user?.user_id)?.high_score || 0}
          </div>
        </div>
        <div className="stat-box">
          <h4>Games Played</h4>
          <div className="stat-value">
            {globalLeaderboard.find(p => p.id === user?.user_id)?.games_played || 0}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard