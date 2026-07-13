const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const dbPath = process.env.DATABASE_PATH || './pacman.db';

// Production requires a strong, stable JWT_SECRET. A missing or weak secret
// would otherwise generate a fresh ephemeral key every boot (logging every
// user out on restart) and break auth across multiple instances. Fail fast so
// the misconfiguration is caught at deploy time instead of silently in prod.
// Local/dev runs fall back to a fixed dev key for convenience.
const hasWeakOrMissingJwtSecret =
  !JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'dev-key-change-in-production';
let ACTIVE_JWT_SECRET = JWT_SECRET;

if (hasWeakOrMissingJwtSecret) {
  if (isProduction) {
    console.error(
      'FATAL: JWT_SECRET is missing or weak in production. Set JWT_SECRET to a ' +
      'random string >= 32 chars (e.g. `openssl rand -hex 32`) in your Render ' +
      'environment settings. Refusing to start.'
    );
    process.exit(1);
  }
  ACTIVE_JWT_SECRET = 'dev-key-change-in-production';
}

const db = new sqlite3.Database(dbPath);

// CORS allow-list: localhost dev + comma-separated FRONTEND_URLS env var (back-compat with FRONTEND_URL)
const normalizeOrigin = value => String(value || '').trim().replace(/\/+$/, '');
const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = new Set([
  normalizeOrigin('http://localhost:3000'),
  normalizeOrigin('http://localhost:5173'),
  ...envOrigins
]);

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const isConfiguredOrigin = allowedOrigins.has(normalizedOrigin);
    const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin);

    if (isConfiguredOrigin || isVercelOrigin) {
      callback(null, true);
      return;
    }

    // Reject without throwing; surfaces as a clean CORS rejection rather than a 500
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Auth-specific throttles to slow brute-force / credential stuffing
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts, try again later' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' }
});

if (!isProduction) {
  console.log('Running in development mode');
  console.log('Allowed origins:', allowedOrigins);
}

// Initialize database
function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      high_score INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      completion_time REAL DEFAULT 0,
      last_played DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(friend_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inviter_id INTEGER NOT NULL,
      invitee_id INTEGER NOT NULL,
      game_session_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(inviter_id) REFERENCES users(id),
      FOREIGN KEY(invitee_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      player1_id INTEGER NOT NULL,
      player2_id INTEGER,
      status TEXT DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      FOREIGN KEY(player1_id) REFERENCES users(id),
      FOREIGN KEY(player2_id) REFERENCES users(id)
    )`);
  });
}

initDB();

// activeSessions is in-memory, single-instance only; multi-instance Render deployments
// would need a shared transport (e.g. Redis pub/sub). Documented as a known limitation.
const wss = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: false
});
const activeSessions = new Map();
const MAX_PLAYERS_PER_SESSION = 2;

function broadcastToSession(sessionId, message, excludeWs = null) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.players.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function sendWS(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function handleWSJoinSession(ws, data) {
  const { sessionId, playerName } = data;
  const playerId = ws.userId;

  if (!sessionId || !playerId) {
    sendWS(ws, { type: 'error', message: 'Missing sessionId' });
    return;
  }

  // Verify caller is one of the two players on this session per the DB record
  db.get(
    `SELECT id, player1_id, player2_id, status FROM game_sessions WHERE id = ?`,
    [sessionId],
    (err, session) => {
      if (err) {
        console.error('WS session lookup error:', err);
        sendWS(ws, { type: 'error', message: 'Internal error' });
        return;
      }
      if (!session) {
        sendWS(ws, { type: 'error', message: 'Session not found' });
        return;
      }
      if (session.player1_id !== playerId && session.player2_id !== playerId) {
        sendWS(ws, { type: 'error', message: 'Not a member of this session' });
        return;
      }

      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          players: [],
          playerMap: new Map()
        });
      }

      const room = activeSessions.get(sessionId);
      const existing = room.playerMap.get(playerId);

      if (existing && existing.readyState === WebSocket.OPEN) {
        existing.close();
      }

      ws.sessionId = sessionId;
      ws.playerId = playerId;
      ws.playerName = playerName;

      room.players = room.players.filter(player => (
        player.readyState === WebSocket.OPEN && player.playerId !== playerId
      ));

      if (room.players.length >= MAX_PLAYERS_PER_SESSION) {
        sendWS(ws, { type: 'error', message: 'Session is full' });
        return;
      }

      room.players.push(ws);
      room.playerMap.set(playerId, ws);

      if (room.players.length === 1) {
        sendWS(ws, { type: 'waiting', message: 'Waiting for opponent...' });
        return;
      }

      broadcastToSession(sessionId, {
        type: 'game_start',
        message: 'Both players connected!',
        players: Array.from(room.playerMap.keys()),
        player1_id: session.player1_id
      });
    }
  );
}

function handleWSClose(ws) {
  if (!ws.sessionId || !activeSessions.has(ws.sessionId)) return;

  const session = activeSessions.get(ws.sessionId);
  session.players = session.players.filter(player => player !== ws);
  session.playerMap.delete(ws.playerId);

  if (session.players.length === 0) {
    activeSessions.delete(ws.sessionId);
    return;
  }

  broadcastToSession(ws.sessionId, {
    type: 'player_left',
    playerId: ws.playerId
  });
}

// Authenticate the WebSocket handshake using a JWT supplied as ?token=... query param
server.on('upgrade', (request, socket, head) => {
  const { query } = url.parse(request.url || '', true);
  const token = query.token;

  if (!token || token === 'guest-session') {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  jwt.verify(token, ACTIVE_JWT_SECRET, (err, decoded) => {
    if (err || !decoded?.id) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, ws => {
      ws.userId = decoded.id;
      ws.username = decoded.username;
      wss.emit('connection', ws, request);
    });
  });
});

wss.on('connection', ws => {
  console.log('WebSocket connected:', ws.userId);

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'join_session') {
        handleWSJoinSession(ws, data);
      } else if (data.type === 'player_move' || data.type === 'game_status' || data.type === 'player_state' || data.type === 'ghost_state' || data.type === 'dot_eaten' || data.type === 'game_over_sync') {
        // Only forward to the room the connection is bound to; never trust client-supplied sessionId
        if (ws.sessionId) {
          const outgoing = { ...data, sessionId: ws.sessionId, playerId: ws.userId };
          broadcastToSession(ws.sessionId, outgoing, ws);
        }
      }
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected:', ws.userId);
    handleWSClose(ws);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Auth Routes
const USERNAME_RE = /^[A-Za-z0-9_-]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistrationInput({ username, email, password }) {
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return 'Missing fields';
  }
  const cleanedUsername = username.trim();
  const cleanedEmail = email.trim().toLowerCase();

  if (!cleanedUsername || !cleanedEmail || !password) return 'Missing fields';
  if (!USERNAME_RE.test(cleanedUsername)) return 'Username must be 3-20 chars (letters, numbers, _ -)';
  if (!EMAIL_RE.test(cleanedEmail)) return 'Invalid email address';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 200) return 'Password too long';

  return { username: cleanedUsername, email: cleanedEmail, password };
}

app.post('/api/auth/register', registerLimiter, async (req, res) => {
  const validated = validateRegistrationInput(req.body || {});
  if (typeof validated === 'string') {
    return res.status(400).json({ error: validated });
  }

  const { username, email, password } = validated;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    console.error('Password hash error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }

  db.run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          // Differentiate which unique constraint failed
          const message = String(err.message || '');
          if (message.includes('users.username')) {
            return res.status(409).json({ error: 'Username already taken' });
          }
          if (message.includes('users.email')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(409).json({ error: 'User already exists' });
        }
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }

      const newUserId = this.lastID;

      db.run(
        `INSERT INTO game_stats (user_id) VALUES (?)`,
        [newUserId],
        function(statsErr) {
          if (statsErr) {
            console.error('Stats row creation error:', statsErr);
            // Roll back user row so registration is atomic
            db.run(`DELETE FROM users WHERE id = ?`, [newUserId]);
            return res.status(500).json({ error: 'Registration failed' });
          }

          const token = jwt.sign({ id: newUserId, username }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
          res.json({ user_id: newUserId, username, token });
        }
      );
    }
  );
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const cleanedEmail = email.trim().toLowerCase();

  db.get(`SELECT * FROM users WHERE email = ?`, [cleanedEmail], async (err, user) => {
    if (err) {
      console.error('Login DB error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let valid = false;
    try {
      valid = await bcrypt.compare(password, user.password);
    } catch (compareErr) {
      console.error('Password compare error:', compareErr);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, ACTIVE_JWT_SECRET, { expiresIn: '7d' });
    res.json({ user_id: user.id, username: user.username, token });
  });
});

// Shared JWT verification: returns decoded payload or null (guest/invalid/missing)
function verifyJwt(token) {
  if (!token || token === 'guest-session') return null;
  try {
    return jwt.verify(token, ACTIVE_JWT_SECRET);
  } catch {
    return null;
  }
}

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  const decoded = verifyJwt(token);
  if (!decoded) {
    return res.status(401).json({ error: token ? 'Invalid token' : 'No token' });
  }
  req.user = decoded;
  next();
}

app.get('/api/auth/me', verifyToken, (req, res) => {
  db.get(`SELECT id, username, email FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    res.json(user);
  });
});

function getSessionCreator(req) {
  return verifyJwt(req.headers['authorization']?.split(' ')[1]);
}

// Game Stats Routes
app.post('/api/game/stats/update', verifyToken, (req, res) => {
  const { score, completion_time } = req.body;

  db.run(
    `INSERT INTO game_stats (user_id, high_score, games_played, completion_time, last_played)
     VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id) DO UPDATE SET
       high_score = MAX(game_stats.high_score, excluded.high_score),
       games_played = game_stats.games_played + 1,
       completion_time = excluded.completion_time,
       last_played = CURRENT_TIMESTAMP`,
    [req.user.id, score, completion_time],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.get('/api/game/stats/:user_id', verifyToken, (req, res) => {
  const requestedId = Number(req.params.user_id);
  if (!Number.isFinite(requestedId) || requestedId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  db.get(
    `SELECT * FROM game_stats WHERE user_id = ?`,
    [requestedId],
    (err, stats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(stats || {
        user_id: requestedId,
        high_score: 0,
        games_played: 0,
        completion_time: 0,
        last_played: null
      });
    }
  );
});

// Leaderboard Routes
app.get('/api/game/leaderboard/global', (req, res) => {
  db.all(
    `SELECT users.id, users.username, game_stats.high_score, game_stats.games_played, game_stats.completion_time 
     FROM users 
     JOIN game_stats ON users.id = game_stats.user_id 
     ORDER BY game_stats.high_score DESC 
     LIMIT 10`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

app.get('/api/game/leaderboard/friends', verifyToken, (req, res) => {
  db.all(
    `SELECT users.id, users.username, game_stats.high_score, game_stats.games_played, game_stats.completion_time 
     FROM users 
     JOIN game_stats ON users.id = game_stats.user_id 
     WHERE users.id IN (
       SELECT friend_id FROM friends WHERE user_id = ? AND status = 'accepted'
       UNION SELECT user_id FROM friends WHERE friend_id = ? AND status = 'accepted'
       UNION SELECT ?
     )
     ORDER BY game_stats.high_score DESC`,
    [req.user.id, req.user.id, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Friend Routes
app.post('/api/social/invite', verifyToken, (req, res) => {
  const { invitee_username, game_session_id } = req.body;

  db.get(`SELECT id FROM users WHERE username = ?`, [invitee_username], (err, invitee) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!invitee) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (invitee.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot invite yourself' });
    }

    db.get(
      `SELECT id FROM friends
       WHERE status = 'accepted'
         AND ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))`,
      [req.user.id, invitee.id, invitee.id, req.user.id],
      (err, existingFriend) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existingFriend) {
          return res.status(409).json({ error: 'You are already friends' });
        }

        db.get(
          `SELECT id FROM invites
           WHERE status = 'pending'
             AND ((inviter_id = ? AND invitee_id = ?) OR (inviter_id = ? AND invitee_id = ?))`,
          [req.user.id, invitee.id, invitee.id, req.user.id],
          (err, existingInvite) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existingInvite) {
              return res.status(409).json({ error: 'Invite already pending' });
            }

            db.run(
              `INSERT INTO invites (inviter_id, invitee_id, game_session_id) VALUES (?, ?, ?)`,
              [req.user.id, invitee.id, game_session_id || null],
              function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ invite_id: this.lastID });
              }
            );
          }
        );
      }
    );
  });
});

app.get('/api/social/invites', verifyToken, (req, res) => {
  db.all(
    `SELECT invites.*, users.username as inviter_username 
     FROM invites 
     JOIN users ON invites.inviter_id = users.id 
     WHERE invitee_id = ? AND status = 'pending'`,
    [req.user.id],
    (err, invites) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(invites || []);
    }
  );
});

app.post('/api/social/invites/:id/accept', verifyToken, (req, res) => {
  db.get(
    `SELECT id, inviter_id, invitee_id FROM invites WHERE id = ? AND invitee_id = ? AND status = 'pending'`,
    [req.params.id, req.user.id],
    (err, invite) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!invite) return res.status(404).json({ error: 'Invite not found' });

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(
          `UPDATE invites SET status = 'accepted' WHERE id = ?`,
          [invite.id],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            db.run(
              `INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')`,
              [invite.inviter_id, invite.invitee_id],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }

                db.run('COMMIT', (err) => {
                  if (err) return res.status(500).json({ error: err.message });
                  res.json({ success: true });
                });
              }
            );
          }
        );
      });
    }
  );
});

app.get('/api/social/friends', verifyToken, (req, res) => {
  db.all(
    `SELECT users.id, users.username, game_stats.high_score 
     FROM users 
     JOIN game_stats ON users.id = game_stats.user_id 
     WHERE users.id IN (
       SELECT friend_id FROM friends WHERE user_id = ? AND status = 'accepted'
       UNION SELECT user_id FROM friends WHERE friend_id = ? AND status = 'accepted'
     )`,
    [req.user.id, req.user.id],
    (err, friends) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(friends || []);
    }
  );
});

// Game Session Routes
app.post('/api/game/session/create', (req, res) => {
  const creator = getSessionCreator(req);

  if (!creator) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  db.run(
    `INSERT INTO game_sessions (id, player1_id, status) VALUES (?, ?, 'waiting')`,
    [sessionId, creator.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ session_id: sessionId });
    }
  );
});

app.get('/api/game/session/:id', (req, res) => {
  db.get(
    `SELECT * FROM game_sessions WHERE id = ?`,
    [req.params.id],
    (err, session) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(session || {});
    }
  );
});

app.post('/api/game/session/:id/join', (req, res) => {
  const joiner = getSessionCreator(req);

  if (!joiner) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Guarded conditional UPDATE: only joinable when waiting, no player2 yet, not self-join
  db.run(
    `UPDATE game_sessions
        SET player2_id = ?, status = 'active'
      WHERE id = ?
        AND status = 'waiting'
        AND player2_id IS NULL
        AND player1_id != ?`,
    [joiner.id, req.params.id, joiner.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        // Disambiguate why the join failed for a clearer client UX
        db.get(
          `SELECT id, player1_id, player2_id, status FROM game_sessions WHERE id = ?`,
          [req.params.id],
          (lookupErr, session) => {
            if (lookupErr) return res.status(500).json({ error: lookupErr.message });
            if (!session) return res.status(404).json({ error: 'Session not found' });
            if (session.player1_id === joiner.id) {
              return res.status(409).json({ error: 'You cannot join your own session' });
            }
            if (session.player2_id !== null && session.player2_id !== undefined) {
              return res.status(409).json({ error: 'Session is already full' });
            }
            return res.status(409).json({ error: `Session not joinable (status: ${session.status})` });
          }
        );
        return;
      }

      // Return enriched payload so the joiner has session context up front
      db.get(
        `SELECT id, player1_id, player2_id, status FROM game_sessions WHERE id = ?`,
        [req.params.id],
        (lookupErr, session) => {
          if (lookupErr) return res.status(500).json({ error: lookupErr.message });
          res.json({
            success: true,
            session_id: session.id,
            player1_id: session.player1_id,
            player2_id: session.player2_id,
            status: session.status
          });
        }
      );
    }
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  wss.close();
  db.close();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Backend with WebSocket running on port ${PORT}`);
});
