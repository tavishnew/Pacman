# 👾 Pac-Man Arcade — Multiplayer Edition

A modern multiplayer Pac-Man game built with React, Node.js, WebSockets, and SQLite.  
Features real-time gameplay, chasing ghosts, leaderboards, social features, and a retro arcade-inspired UI.

---

## 🎮 Features

- Classic Pac-Man gameplay
- Real-time multiplayer rooms using WebSockets
- Ghosts with distinct pursuit behaviors
- User authentication with guest play support
- Global and friends leaderboards
- Friends and invite system
- Responsive retro arcade UI
- Smooth browser gameplay (60 FPS)

---

# 🛠 Tech Stack

## Frontend
- React 18
- Vite
- Vanilla CSS

## Backend
- Node.js
- Express
- SQLite
- WebSocket (`ws`)

## Authentication
- JWT
- bcryptjs

## Deployment
- Vercel
- Render

---

# 📦 Installation

## Prerequisites

- Node.js >= 16
- npm >= 8
- Git

---

## 1. Clone Repository

```bash
git clone https://github.com/tavishnew/Pacman.git
cd Pacman
```

---

## 2. Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on:

```txt
http://localhost:5000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# 🎯 Controls

| Key | Action |
|------|--------|
| W / ↑ | Move Up |
| S / ↓ | Move Down |
| A / ← | Move Left |
| D / → | Move Right |

---

# 🧠 Ghost Behavior

| Ghost | Behavior |
|--------|-----------|
| Blinky | Direct chase |
| Pinky | Ambush strategy |
| Inky | Flanking movement |
| Clyde | Random + retreat behavior |

---

# 🌐 Deployment

## Frontend
Deploy the `frontend` folder to:
- Vercel

## Backend
Deploy the `backend` folder to:
- Render

---

# 📁 Project Structure

```txt
Pacman/
├── backend/
├── frontend/
├── game/
├── README.md
```

# 🕹️ Optional Native Build (`game/`)

The `game/` folder contains an independent C++/SFML implementation of Pac-Man
(`game.cpp`, `game.h`, `main.cpp`) built via the included `Makefile`. It is a
**standalone desktop build** — it is NOT compiled to WebAssembly and is NOT
referenced by the React/Vite web app. The playable web game lives in
`frontend/src/components/GameScreen.jsx`.

To build and run the native version (requires SFML installed):

```bash
cd game
make
./pacman_native        # or pacman_native.exe on Windows
```

The compiled `pacman_native` / `pacman_native.exe` binary is gitignored and
should not be committed. Treat this folder as an optional, experimental
alternative to the web client unless you intend to wire it into the build.

# 📱 Mobile Controls

The web game currently supports keyboard input only (WASD / arrow keys). Touch
controls (swipe gestures or an on-screen D-pad) are **not yet implemented** —
see the audit backlog for adding a mobile fallback.

---

# 🚀 Future Improvements

- Tournament mode
- Matchmaking system
- Persistent multiplayer sessions
- Power-up system
- Spectator mode
- Voice chat integration

---

# 📝 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Developed by Tavish Sharma

GitHub: https://github.com/tavishnew/Pacman
