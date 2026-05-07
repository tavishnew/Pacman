# 👾 Pac-Man Arcade — Multiplayer Edition

A modern multiplayer Pac-Man game built with React, Node.js, WebSockets, and SQLite.  
Features real-time gameplay, AI ghosts, leaderboards, social features, and a retro arcade-inspired UI.

---

## 🎮 Features

- Classic Pac-Man gameplay
- Real-time multiplayer rooms using WebSockets
- Smart ghost AI with unique behaviors
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

# 🧠 Ghost AI

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