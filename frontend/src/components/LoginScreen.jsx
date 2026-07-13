import React, { useState } from 'react'
import './LoginScreen.css'

function LoginScreen({ onLogin, onRegister, onGuestPlay, loading }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    if (isLogin) {
      onLogin(email, password)
    } else {
      onRegister(username, email, password)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box anim-stamp">
        <h2>👾 PAC-MAN 👾</h2>
        
        <div className="login-tabs">
          <button 
            className={`${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            LOGIN
          </button>
          <button 
            className={`${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            REGISTER
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-green"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'LOADING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </button>

          {isLogin && (
            <button
              type="button"
              className="btn guest-play-btn"
              onClick={onGuestPlay}
              disabled={loading}
              style={{ width: '100%' }}
            >
              PLAY AS GUEST
            </button>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#4A4A45' }}>
          🎮 READY PLAYER ONE? 🎮
        </p>
      </div>
    </div>
  )
}

export default LoginScreen
