import React, { useState } from 'react'
import './LoginScreen.css'

// Keep these in sync with backend validateRegistrationInput()
const USERNAME_RE = /^[A-Za-z0-9_-]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name, value, isLogin) {
  if (name === 'username') {
    const v = (value || '').trim()
    if (!v) return 'Username is required'
    if (!USERNAME_RE.test(v)) return 'Username must be 3-20 chars (letters, numbers, _ -)'
    return ''
  }
  if (name === 'email') {
    const v = (value || '').trim()
    if (!v) return 'Email is required'
    if (!EMAIL_RE.test(v)) return 'Invalid email address'
    return ''
  }
  if (name === 'password') {
    if (!value) return 'Passcode is required'
    // Length rules only apply when creating an account
    if (!isLogin) {
      if (value.length < 8) return 'Passcode must be at least 8 characters'
      if (value.length > 200) return 'Passcode too long'
    }
    return ''
  }
  return ''
}

function LoginScreen({ onLogin, onRegister, onGuestPlay, loading }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({})

  const valueOf = (name) =>
    name === 'username' ? username : name === 'email' ? email : password

  const errorOf = (name) =>
    touched[name] ? validateField(name, valueOf(name), isLogin) : ''

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }))

  const switchTab = (next) => {
    setIsLogin(next)
    setTouched({}) // clear inline errors when switching modes
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading) return
    const fields = isLogin ? ['email', 'password'] : ['username', 'email', 'password']
    const nextTouched = { ...touched }
    let hasError = false
    for (const f of fields) {
      nextTouched[f] = true
      if (validateField(f, valueOf(f), isLogin)) hasError = true
    }
    setTouched(nextTouched)
    if (hasError) return // surface inline instead of a late popup
    if (isLogin) {
      onLogin(email, password)
    } else {
      onRegister(username, email, password)
    }
  }

  const usernameError = errorOf('username')
  const emailError = errorOf('email')
  const passwordError = errorOf('password')

  return (
    <div className="login-split">
      {/* Left — branding */}
      <div className="login-brand">
        <div className="brand-system">
          <div className="brand-badge">SYS.ONLINE</div>
          <div className="brand-badge">LOC: INDIA</div>
        </div>

        <h1 className="brand-wordmark">PAC<br />MAN</h1>

        <div className="brand-info">
          <div className="brand-info-head">
            COMPETITIVE ARENA ACTION.<br />
            LIVE GHOST HUNTERS.<br />
            ZERO QUARTERS REQUIRED.
          </div>
          <div className="brand-features">
            <div className="brand-feature bf-ghost pop-up" style={{ '--i': 0 }}>GHOSTS ACTIVE</div>
            <div className="brand-feature bf-bots pop-up" style={{ '--i': 1 }}>NO BOTS</div>
          </div>
        </div>

        <div className="brand-footer">
          <div className="brand-footer-label">CURRENT CHAMPION</div>
          <div className="brand-footer-value">TAVISH // 48,200</div>
          <div className="brand-footer-label">ACTIVE LOBBIES</div>
          <div className="brand-footer-value">14 // REGION: INDIA</div>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="login-form-side">
        <div className="login-tabs">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => switchTab(true)}
          >
            INSERT COIN
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => switchTab(false)}
          >
            NEW PLAYER
          </button>
        </div>

        <div className="login-form-box anim-stamp">
          <h2>PLAYER AUTHENTICATION</h2>
          <p className="login-form-sub">
            Enter credentials to access the multiplayer grid.
          </p>
          <div className="login-divider" />

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="ls-username">USERNAME</label>
                <input
                  id="ls-username"
                  type="text"
                  className={usernameError ? 'input-error' : ''}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => markTouched('username')}
                  placeholder="E.G. BLINKY_BANE"
                  required={!isLogin}
                  autoComplete="username"
                />
                {usernameError && <div className="field-error">{usernameError}</div>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="ls-email">EMAIL</label>
              <input
                id="ls-email"
                type="email"
                className={emailError ? 'input-error' : ''}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched('email')}
                placeholder="E.G. PLAYER@ARCADE.IO"
                required
                autoComplete="email"
              />
              {emailError && <div className="field-error">{emailError}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="ls-pass">PASSCODE</label>
              <input
                id="ls-pass"
                type="password"
                className={passwordError ? 'input-error' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched('password')}
                placeholder="........"
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-yellow login-submit"
              disabled={loading}
            >
              {loading
                ? 'LOADING...'
                : isLogin
                  ? 'START GAME →'
                  : 'CREATE PLAYER →'}
            </button>
          </form>

          {isLogin && (
            <button
              type="button"
              className="btn guest-play-btn login-guest"
              onClick={onGuestPlay}
              disabled={loading}
            >
              PLAY AS GUEST
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
