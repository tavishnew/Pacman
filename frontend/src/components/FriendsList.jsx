import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './FriendsList.css'

const TILE_COLORS = ['var(--accent-yellow)', 'var(--accent-green)', 'var(--accent-red)', 'var(--ink)']
const TILE_TEXT = ['var(--ink)', '#FAF7EE', '#FAF7EE', '#FAF7EE']

function FriendsList({ user, token, API_URL, onNavigate }) {
  const [friends, setFriends] = useState([])
  const [invites, setInvites] = useState([])
  const [friendUsername, setFriendUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [invitingFriendId, setInvitingFriendId] = useState(null)
  const [showRecruit, setShowRecruit] = useState(false)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchFriends = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/social/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFriends(res.data)
    } catch (err) {
      console.error('Failed to fetch friends:', err)
    }
  }, [API_URL, token])

  const fetchInvites = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/social/invites`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInvites(res.data)
    } catch (err) {
      console.error('Failed to fetch invites:', err)
    }
    setLoading(false)
  }, [API_URL, token])

  useEffect(() => {
    fetchFriends()
    fetchInvites()
  }, [fetchFriends, fetchInvites])

  const sendFriendInvite = async () => {
    if (!friendUsername.trim()) return
    try {
      await axios.post(
        `${API_URL}/api/social/invite`,
        { invitee_username: friendUsername.trim() },
        authHeaders
      )
      alert(`Invite sent to ${friendUsername}.`)
      setFriendUsername('')
      setShowRecruit(false)
    } catch (err) {
      alert("We couldn't send that invite. Double-check the username and try again.")
    }
  }

  const acceptInvite = async (inviteId) => {
    try {
      await axios.post(`${API_URL}/api/social/invites/${inviteId}/accept`, {}, authHeaders)
      fetchFriends()
      fetchInvites()
    } catch (err) {
      alert("We couldn't accept that invite. Please try again.")
    }
  }

  const inviteFriendToPlay = async (friend) => {
    if (invitingFriendId) return
    setInvitingFriendId(friend.id)
    try {
      const sessionRes = await axios.post(`${API_URL}/api/game/session/create`, {}, authHeaders)
      const newSessionId = sessionRes.data?.session_id
      if (!newSessionId) throw new Error('No session id returned')

      await axios.post(
        `${API_URL}/api/social/invite`,
        { invitee_username: friend.username, game_session_id: newSessionId },
        authHeaders
      )

      try {
        await navigator.clipboard?.writeText(newSessionId)
      } catch {
        /* clipboard not available; non-fatal */
      }
      alert(`Game invite sent to ${friend.username}!\nSession ID: ${newSessionId}`)
    } catch (err) {
      alert(`We couldn't start a game with ${friend.username}. Please try again.`)
    } finally {
      setInvitingFriendId(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading squad...</div>
  }

  return (
    <div className="squad">
      {/* Profile header */}
      <div className="squad-header">
        <div className="squad-id">
          <div className="squad-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="squad-id-info">
            <h1 className="squad-name">{user.username}</h1>
            <div className="squad-badges">
              <span className="brutal-tag on-dark">ALLIANCE</span>
              <span className="brutal-tag">JOINED: {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
        <button type="button" className="squad-config" title="Settings">
          ⚙ CONFIG
        </button>
      </div>

      <div className="squad-grid">
        {/* Left: combat metrics + recent ops (squad) */}
        <div className="squad-main">
          <div className="squad-section-head">
            <h2>👥 SQUAD</h2>
            <span className="brutal-tag on-dark">{friends.length} ALLIES</span>
          </div>

          <button
            type="button"
            className="btn btn-yellow squad-recruit"
            onClick={() => setShowRecruit((v) => !v)}
          >
            {showRecruit ? 'CLOSE' : '👤 RECRUIT ALLY'}
          </button>

          {showRecruit && (
            <div className="recruit-box">
              <input
                type="text"
                placeholder="ENTER HANDLE"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendFriendInvite()
                }}
              />
              <button type="button" className="btn" onClick={sendFriendInvite}>
                SEND
              </button>
            </div>
          )}

          {invites.length > 0 && (
            <div className="invites-block">
              <div className="invites-title">📨 PENDING INVITES</div>
              <div className="invites-list">
                {invites.map((invite) => (
                  <div key={invite.id} className="invite-item">
                    <span>{invite.inviter_username} wants to squad up</span>
                    <button type="button" className="btn btn-green invite-accept" onClick={() => acceptInvite(invite.id)}>
                      ✓ ACCEPT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {friends.length === 0 ? (
            <div className="no-friends">
              <p>No allies yet. Recruit some operators to build your squad.</p>
            </div>
          ) : (
            <div className="squad-members">
              {friends.map((friend, index) => (
                <div
                  key={friend.id}
                  className="squad-member anim-stamp"
                  style={{ '--i': index }}
                >
                  <div className="member-top">
                    <span
                      className="member-tile"
                      style={{
                        background: TILE_COLORS[index % TILE_COLORS.length],
                        color: TILE_TEXT[index % TILE_COLORS.length]
                      }}
                    >
                      {friend.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="member-info">
                      <div className="member-name">{friend.username}</div>
                      <div className="member-status">ALLY</div>
                    </div>
                    <button
                      type="button"
                      className="btn member-challenge"
                      onClick={() => inviteFriendToPlay(friend)}
                      disabled={invitingFriendId === friend.id}
                    >
                      {invitingFriendId === friend.id ? 'INVITING…' : '⚔ CHALLENGE'}
                    </button>
                  </div>
                  <div className="member-score">HIGH SCORE: {friend.high_score || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: standing / actions */}
        <aside className="squad-side">
          <div className="squad-side-card">
            <div className="squad-side-label">ALLIES</div>
            <div className="squad-side-value">{friends.length}</div>
          </div>
          <div className="squad-side-card">
            <div className="squad-side-label">PENDING</div>
            <div className="squad-side-value">{invites.length}</div>
          </div>
          <button
            type="button"
            className="btn btn-green squad-side-btn"
            onClick={() => onNavigate?.('leaderboard')}
          >
            🏅 RANKINGS
          </button>
          <button
            type="button"
            className="btn squad-side-btn"
            onClick={() => onNavigate?.('play')}
          >
            🎮 PLAY SOLO
          </button>
        </aside>
      </div>
    </div>
  )
}

export default FriendsList
