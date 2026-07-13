import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './FriendsList.css'

function FriendsList({ user, token, API_URL }) {
  const [friends, setFriends] = useState([])
  const [invites, setInvites] = useState([])
  const [friendUsername, setFriendUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [invitingFriendId, setInvitingFriendId] = useState(null)

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
      await axios.post(`${API_URL}/api/social/invite`, {
        invitee_username: friendUsername.trim()
      }, authHeaders)
      alert(`Invite sent to ${friendUsername}.`)
      setFriendUsername('')
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

      await axios.post(`${API_URL}/api/social/invite`, {
        invitee_username: friend.username,
        game_session_id: newSessionId
      }, authHeaders)

      try {
        await navigator.clipboard?.writeText(newSessionId)
      } catch {
        // clipboard not available; non-fatal
      }
      alert(`Game invite sent to ${friend.username}!\nSession ID: ${newSessionId}`)
    } catch (err) {
      alert(`We couldn't start a game with ${friend.username}. Please try again.`)
    } finally {
      setInvitingFriendId(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading friends...</div>
  }

  return (
    <div className="friends-list">
      <div className="friends-header">
        <h2>👥 Friends & Invites</h2>
      </div>

      <div className="add-friend-section">
        <h3>Add Friend</h3>
        <div className="add-friend-form">
          <input
            type="text"
            placeholder="Enter username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendFriendInvite() }}
          />
          <button onClick={sendFriendInvite} className="add-friend-btn">
            ➕ Send Invite
          </button>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="invites-section">
          <h3>📨 Pending Invites</h3>
          <div className="invites-list">
            {invites.map(invite => (
              <div key={invite.id} className="invite-item">
                <span>{invite.inviter_username} wants to be friends</span>
                <button
                  onClick={() => acceptInvite(invite.id)}
                  className="accept-btn"
                >
                  ✅ Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="friends-section">
        <h3>🎮 Your Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <div className="no-friends">
            <p>No friends yet. Send some invites to get started!</p>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map((friend, index) => (
              <div key={friend.id} className="friend-card anim-stamp" style={{ '--i': index }}>
                <div className="friend-avatar">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-info">
                  <h4>{friend.username}</h4>
                  <p>High Score: {friend.high_score || 0}</p>
                </div>
                <button
                  className="invite-play-btn"
                  onClick={() => inviteFriendToPlay(friend)}
                  disabled={invitingFriendId === friend.id}
                >
                  {invitingFriendId === friend.id ? 'Inviting…' : '🎮 Invite to Play'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsList
