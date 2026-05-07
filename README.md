# 👾 Pac-Man Arcade — Multiplayer Edition

A full-stack multiplayer Pac-Man game with retro arcade UI, real-time gameplay, social features, and leaderboards.

![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🎮 Features

- **Classic Pac-Man Gameplay** — 19×21 maze, 244 pellets, 4 AI ghosts with unique behaviors
- **Multiplayer** — Create game rooms, invite friends, real-time WebSocket play
- **Tournament Mode** — Ranked competitive play *(coming soon)*
- **Leaderboards** — Global and friends-only rankings
- **Friends System** — Send invites, track scores, play together
- **Guest Play** — Jump in without an account
- **Smart Ghost AI** — Each ghost has individual speed and chase strategy
- **Responsive Design** — Desktop, tablet, and mobile support
- **60 FPS** smooth browser-based gameplay

---

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

---

## 💻 Local Development

### 1. Clone Repository

```bash
git clone https://github.com/tavishnew/Pacman.git
cd Pacman
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup (new terminal)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on **http://localhost:3000**

### 4. Play

1. Open **http://localhost:3000**
2. Register or play as guest
3. Use arrow keys or WASD to move

---

## 🌐 Production Deployment (Free)

Deploy for **$0/month** using Render (backend) + Vercel (frontend).

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) → Sign up free
2. Click **New Web Service** → Connect GitHub repo
3. Configure:
   - **Name**: `pacman-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free
4. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-strong-random-secret-key
   DATABASE_PATH=./pacman.db
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Click **Create Web Service** → Wait 3–5 min
6. Copy your backend URL: `https://pacman-ns5d.onrender.com`

### Step 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up free
2. Click **Import Project** → Select GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://pacman-ns5d.onrender.com
   ```
5. Click **Deploy** → Wait 2–3 min
6. Copy your frontend URL: `https://pacman-xyz.vercel.app`

### Step 3: Update Backend CORS

1. Go to Render dashboard → your backend service → Environment
2. Add/update: `FRONTEND_URL=https://pacman-xyz.vercel.app`
3. Render auto-redeploys

### Step 4: Verify

- Visit your Vercel URL
- Register an account
- Play a game
- Check browser DevTools Network tab for API calls

---

## 🔧 Environment Variables

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | `dev-key-...` | JWT signing key |
| `DATABASE_PATH` | `./pacman.db` | SQLite file path |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API URL |

---

## 📁 Project Structure

```
Pacman/
├── backend/
│   ├── server.js              # Express API server
│   ├── websocket-server.js    # WebSocket for multiplayer
│   ├── package.json
│   ├── Procfile               # Render deployment
│   ├── .env.example           # Env template
│   └── .gitignore
│
├── frontend/
│   ├── index.html             # Entry point + CRT scanlines
│   ├── vercel.json            # Vercel deployment config
│   ├── vite.config.js         # Vite build + dev proxy
│   ├── .env.example           # Env template
│   ├── .env.production        # Production env
│   └── src/
│       ├── App.jsx            # Router, auth, cursor glow
│       ├── App.css            # Design system + theme
│       ├── index.css          # Base reset
│       └── components/
│           ├── LoginScreen.*  # Auth & guest play
│           ├── Dashboard.*    # Stats overview
│           ├── GameLauncher.* # Mode selection
│           ├── GameScreen.*   # Game board & logic
│           ├── Leaderboard.*  # Rankings table
│           └── FriendsList.*  # Social features
│
├── game/                      # C++ game engine (optional)
├── .gitignore
├── DEPLOYMENT.md              # Detailed deploy guide
└── README.md
```

---

## 🎮 Game Controls

| Key | Action |
|-----|--------|
| `↑` / `W` | Move Up |
| `↓` / `S` | Move Down |
| `←` / `A` | Move Left |
| `→` / `D` | Move Right |

---

## 🧠 Ghost AI

| Ghost | Behavior | Speed |
|-------|----------|-------|
| 🔴 Blinky | Direct chase — targets Pac-Man | 330ms |
| 🩷 Pinky | Ambush — targets 4 tiles ahead | 360ms |
| 🩵 Inky | Flank — targets perpendicular | 390ms |
| 🟠 Clyde | Shy — chases far, retreats close | 410ms |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/game/stats/:id` | No | Player stats |
| POST | `/api/game/stats/update` | Yes | Update stats |
| GET | `/api/game/leaderboard/global` | No | Top 10 |
| GET | `/api/game/leaderboard/friends` | Yes | Friends ranking |
| POST | `/api/game/session/create` | Yes | Create room |
| GET | `/api/game/session/:id` | No | Get session |
| POST | `/api/game/session/:id/join` | Yes | Join room |
| GET | `/api/social/friends` | Yes | Friends list |
| POST | `/api/social/invite` | Yes | Send invite |
| GET | `/api/social/invites` | Yes | Pending invites |
| POST | `/api/social/invites/:id/accept` | Yes | Accept invite |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to API" | Check `VITE_API_URL` matches your Render URL |
| CORS error in console | Add frontend URL to `FRONTEND_URL` env on Render |
| Render sleeps (30s wake) | Normal on free tier — first request wakes it |
| Database resets on redeploy | Expected with SQLite on Render; use PostgreSQL for persistence |
| Build fails on Vercel | Ensure root directory is set to `frontend` |

---

## 📊 Free Tier Limits

| Service | Limit | Status |
|---------|-------|--------|
| Render | 750 hrs/month | ✅ Sufficient |
| Vercel | 100GB bandwidth | ✅ Sufficient |
| SQLite | ~1GB on Render | ✅ Good |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 4, Vanilla CSS |
| Backend | Node.js, Express, SQLite |
| Auth | JWT + bcryptjs |
| Realtime | WebSocket (ws) |
| Fonts | Google Fonts (VT323, Orbitron) |
| Deploy | Vercel + Render |

---

## 📝 License

MIT License — see LICENSE file for details.

---

**Ready Player One? 🕹️**
