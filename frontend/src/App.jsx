import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'
import GameLauncher from './components/GameLauncher'
import FriendsList from './components/FriendsList'
import Leaderboard from './components/Leaderboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)
  const lastScrollY = useRef(0)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    console.log('API URL:', apiUrl)
    console.log('Environment:', import.meta.env.MODE)
    console.log('Current origin:', window.location.origin)

    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => console.log('Backend connected:', data))
      .catch(err => console.error('Backend unreachable:', err))
  }, [])

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setCurrentPage('dashboard')
    }
  }, [])

  // Auto-hide navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = contentRef.current?.scrollTop || 0
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsNavVisible(false)
      } else {
        setIsNavVisible(true)
      }
      lastScrollY.current = currentScrollY
    }

    const contentArea = contentRef.current
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll, { passive: true })
      return () => contentArea.removeEventListener('scroll', handleScroll)
    }
  }, [token, currentPage]) // Re-run when content area might change

  // Cursor glow tracking — desktop only
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches
    if (isTouch) return

    const cursorGlow = document.getElementById('cursor-glow')
    if (!cursorGlow) return

    const handleMouseMove = (e) => {
      cursorGlow.style.left = e.clientX + 'px'
      cursorGlow.style.top = e.clientY + 'px'
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const describeAxiosError = (err, fallback) => {
    if (!err.response) {
      return `${fallback}: cannot reach the server. Check your internet connection or try again shortly.`
    }
    const serverMessage = err.response.data?.error || err.response.statusText || 'Unknown error'
    return `${fallback}: ${serverMessage}`
  }

  const handleLogin = async (email, password) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      const { token: newToken, user_id, username } = res.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify({ user_id, username }))
      
      setToken(newToken)
      setUser({ user_id, username })
      setCurrentPage('dashboard')
    } catch (err) {
      alert(describeAxiosError(err, 'Login failed'))
    }
    setLoading(false)
  }

  const handleRegister = async (username, email, password) => {
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { username, email, password })
      const { token: newToken, user_id } = res.data
      
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify({ user_id, username }))
      
      setToken(newToken)
      setUser({ user_id, username })
      setCurrentPage('dashboard')
    } catch (err) {
      alert(describeAxiosError(err, 'Registration failed'))
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
    alert('Multiplayer requires a real account. Please login or register to play 2 Player mode.')
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
    setIsNavVisible(true) // Ensure nav is visible on page change
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

  const hideNavbar = isPlaying || !isNavVisible

  return (
    <div className={`app-container ${hideNavbar ? 'nav-hidden' : ''}`}>
      <nav className={`navbar ${hideNavbar ? 'hidden' : ''}`}>
        <div className="nav-left">
          <h1 className="logo">👾 PAC-MAN ARCADE</h1>
        </div>
        <div className="nav-right">
          {!String(user?.user_id || '').startsWith('guest') && <span className="user-badge">{user?.username}</span>}
          <button className="nav-btn" onClick={() => navigateTo('dashboard')}>Dashboard</button>
          <button className="nav-btn" onClick={() => navigateTo('play')}>Play</button>
          <button className="nav-btn" onClick={() => navigateTo('friends')}>Friends</button>
          <button className="nav-btn" onClick={() => navigateTo('leaderboard')}>Scores</button>
          <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className={`content ${currentPage === 'dashboard' ? 'dashboard-content' : ''}`} ref={contentRef}>
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
        {currentPage === 'friends' && <FriendsList user={user} token={token} API_URL={API_URL} />}
        {currentPage === 'leaderboard' && <Leaderboard user={user} token={token} API_URL={API_URL} />}
      </div>
    </div>
  )
}

export default App
