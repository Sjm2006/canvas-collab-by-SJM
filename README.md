# Canvas — Collaborative Whiteboard

> Draw together in real time. No account. No setup. Just share a link.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-railway.app-6366f1?style=for-the-badge&logo=railway&logoColor=white)](https://canvas-collab-by-sjm-production.up.railway.app/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 🌐 Live Demo

**[https://canvas-collab-by-sjm-production.up.railway.app/](https://canvas-collab-by-sjm-production.up.railway.app/)**

Open the link, share the URL with anyone, and start drawing together instantly — no login required.

---

## ✨ Features

- 🎨 **Real-time drawing** — strokes sync instantly across all connected users
- 🔗 **Shareable rooms** — every session gets a unique URL (`/room/abc123xyz`)
- 👤 **No login required** — open and draw immediately
- 🖊️ **Drawing tools** — pen, eraser, line, rectangle, circle
- 🎨 **Color picker** with preset color swatches
- 📏 **Brush size** control
- 👁️ **Live cursors** — see where others are drawing in real time
- 🕐 **Late join sync** — new users receive full board history on join
- 💾 **Export** — save your board as a PNG image
- 🗑️ **Clear** — wipe the board for all users simultaneously
- 📱 **Touch support** — works on mobile and tablet devices
- 🐾 **Random identity** — each user gets a unique animal name and color

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (ES Modules), HTML5 Canvas API |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Real-time | Socket.io (WebSocket + polling) |
| Deployment | Railway |

---

## 📁 Project Structure

```
canvas-collab/
├── client/
│   ├── index.html        ← UI layout, toolbar, canvas element
│   ├── app.js            ← main entry point, wires canvas + socket
│   ├── canvas.js         ← all drawing logic (HTML5 Canvas API)
│   └── socket.js         ← Socket.io client events & remote cursors
│
├── server/
│   ├── index.js          ← Express server + Socket.io setup
│   ├── roomManager.js    ← in-memory room & user state management
│   └── events.js         ← all socket event handlers
│
├── package.json
└── README.md
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18 or higher
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/canvas-collab-by-SJM.git
cd canvas-collab-by-SJM

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# For development with auto-restart
npm run dev
```

Then open **http://localhost:8080** in your browser.

To test collaboration locally, open the same URL in two browser tabs.

---

## ☁️ Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repository
4. Railway auto-detects Node.js and installs dependencies
5. Set the start command to `node server/index.js`
6. Go to Settings → Networking → Generate Domain
7. Set port to `8080`
8. Your app is live! 🎉

---

## 🧠 How It Works

```
User A draws on canvas
        ↓
Mouse event captured → stroke data created
        ↓
Socket.io emits 'draw' event to server
        ↓
Server broadcasts stroke to all users in same room
        ↓
User B receives stroke → drawn on their canvas instantly
```

**Room management** is handled entirely in-memory — no database needed. Each room stores its stroke history so users who join late can see the full board.

---

## 📚 Key Concepts & Where to Find Them

| Concept | File | What to look for |
|---|---|---|
| HTML5 Canvas drawing | `client/canvas.js` | `drawStroke()`, `setupMouseEvents()` |
| WebSocket events | `server/events.js` | `join-room`, `draw`, `cursor-move` |
| Room state management | `server/roomManager.js` | `addStroke()`, `getRoom()` |
| Late-join board sync | `server/events.js` | `socket.emit('board-state', ...)` |
| Remote cursor rendering | `client/socket.js` | `updateRemoteCursor()` |
| ES Modules | `client/app.js` | `import` / `export` statements |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 👨‍💻 Built By

**SJM** — Built with ❤️ as a full-stack learning project covering WebSockets, real-time state sync, HTML5 Canvas, and cloud deployment.

---

## 📄 License

[MIT](LICENSE)