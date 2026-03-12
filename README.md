# 🎨 Real-Time Collaborative Whiteboard

Draw together with anyone, anywhere — no login required.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development (auto-restart)
npm run dev
```

Then open: **http://localhost:3000**

## 📁 Project Structure

```
whiteboard/
├── client/
│   ├── index.html     ← UI, toolbar, canvas element
│   ├── app.js         ← main entry, wires everything
│   ├── canvas.js      ← all drawing logic (Canvas API)
│   └── socket.js      ← socket.io client events
│
├── server/
│   ├── index.js       ← Express + Socket.io server
│   ├── roomManager.js ← room state management
│   └── events.js      ← all socket event handlers
│
└── package.json
```

## ✨ Features

- **Real-time drawing** — strokes appear instantly for all users
- **Rooms** — unique shareable URL per session (`/room/abc123xyz`)
- **No login** — just open and draw
- **Tools** — pen, eraser, line, rectangle, circle
- **Color picker** + preset colors
- **Brush size** control
- **Live cursors** — see where others are drawing
- **New user sync** — joining users see the full board history
- **Export** — save board as PNG
- **Clear** — wipe the board for everyone
- **Touch support** — works on mobile/tablet

## 🛠 Tech Stack

- **Frontend:** Vanilla JS (ES Modules), HTML5 Canvas API
- **Backend:** Node.js, Express
- **Real-time:** Socket.io

## 🌐 Deploy to Railway

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set start command: `node server/index.js`
4. Done! Share your URL.

## 📚 Key Learning Points

| Concept | Where to find it |
|---|---|
| Canvas drawing | `client/canvas.js` |
| WebSocket events | `server/events.js` |
| Room management | `server/roomManager.js` |
| State sync (late join) | `events.js → join-room handler` |
| ES Modules | `client/app.js` imports |
