import React, { useState, useEffect } from 'react'
import './App.css'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import GameLauncher from './components/GameLauncher'
import FriendsList from './components/FriendsList'
import Leaderboard from './components/Leaderboard'

import { API_URL } from './config'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setCurrentPage('dashboard')
    }
  }, [])

  // Surface the real server reason (validation, duplicate, rate limit, network)
  // so the user sees WHY a request failed.
  const apiErrorMessage = (err, fallback) => {
    const data = err?.data ?? err?.response?.data
    if (data && typeof data.error === 'string' && data.error) return data.error
    const status = err?.status ?? err?.response?.status
    if (status === 429) {
      return 'Too many attempts. Please wait a few minutes and try again.'
    }
    if (!status) return 'Network error — is the server running on port 5000?'
    return fallback || 'Something went wrong. Please try again.'
  }

  const postJson = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    let data = {}
    try { data = await res.json() } catch { /* no body */ }
    if (!res.ok) {
      const error = new Error(data.error || `Request failed (${res.status})`)
      error.status = res.status
      error.data = data
      throw error
    }
    return data
  }

  const handleLogin = async (email, password) => {
    setLoading(true)
    try {
      const { token: newToken, user_id, username } = await postJson(`${API_URL}/api/auth/login`, { email, password })

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify({ user_id, username }))

      setToken(newToken)
      setUser({ user_id, username })
      setCurrentPage('dashboard')
    } catch (err) {
      alert(apiErrorMessage(err, "We couldn't sign you in. Double-check your email and password, then try again."))
    }
    setLoading(false)
  }

  const handleRegister = async (username, email, password) => {
    setLoading(true)
    try {
      const { token: newToken, user_id } = await postJson(`${API_URL}/api/auth/register`, { username, email, password })

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify({ user_id, username }))

      setToken(newToken)
      setUser({ user_id, username })
      setCurrentPage('dashboard')
    } catch (err) {
      alert(apiErrorMessage(err, "We couldn't create your account. Check the form and try again."))
    }
    setLoading(false)
  }

  const handleGuestPlay = () => {
    setToken('guest-session')
    setUser({
      user_id: `guest_${crypto.randomUUID?.() || Date.now()}`,
      username: 'Guest'
    })
    setCurrentPage('play')
  }

  const requireLoginForMultiplayer = () => {
    alert('2 Player mode needs a free account. Log in or sign up to play with friends.')
    handleLogout()
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setCurrentPage('login')
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
    setIsPlaying(false) // Reset playing state when navigating
  }

  if (!token) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestPlay={handleGuestPlay}
        loading={loading}
      />
    )
  }

  const hideNavbar = isPlaying

  return (
    <div className={`app-container ${hideNavbar ? 'nav-hidden' : ''}`}>
      <div className="nav-hover-zone" aria-hidden="true" />
      <nav className={`navbar ${hideNavbar ? 'hidden' : ''}`}>
        <div className="nav-left">
          <h1 className="logo">👾 PAC-MAN ARCADE</h1>
        </div>
        <div className="nav-right">
          {!String(user?.user_id || '').startsWith('guest') && <span className="user-badge">{user?.username}</span>}
          <button className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => navigateTo('dashboard')}>Dashboard</button>
          <button className={`nav-btn ${currentPage === 'play' ? 'active' : ''}`} onClick={() => navigateTo('play')}>Play</button>
          <button className={`nav-btn ${currentPage === 'friends' ? 'active' : ''}`} onClick={() => navigateTo('friends')}>Friends</button>
          <button className={`nav-btn ${currentPage === 'leaderboard' ? 'active' : ''}`} onClick={() => navigateTo('leaderboard')}>Scores</button>
          <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className={`content ${currentPage === 'dashboard' ? 'dashboard-content' : ''}`}>
        {currentPage === 'dashboard' && (
          <Dashboard user={user} token={token} refreshKey={statsRefreshKey} onNavigate={navigateTo} />
        )}
        {currentPage === 'play' && (
          <GameLauncher
            user={user}
            token={token}
            onPlayingStateChange={setIsPlaying}
            onRequireLogin={requireLoginForMultiplayer}
            onGameEnd={() => setStatsRefreshKey(value => value + 1)}
          />
        )}
        {currentPage === 'friends' && <FriendsList user={user} token={token} API_URL={API_URL} onNavigate={navigateTo} />}
        {currentPage === 'leaderboard' && <Leaderboard user={user} token={token} API_URL={API_URL} onNavigate={navigateTo} />}
      </div>
    </div>
  )
}

export default App
