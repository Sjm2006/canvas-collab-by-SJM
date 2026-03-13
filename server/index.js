// server/index.js — Express + Socket.io server

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { registerEvents } = require('./events');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['polling', 'websocket'], // polling FIRST
  allowEIO3: true
});

// Use Railway's dynamic port or fallback to 8080
const PORT = process.env.PORT || 8080;

// ── Serve static frontend files ──
app.use(express.static(path.join(__dirname, '../client')));

// ── Room routes → serve index.html ──
app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ── Root route ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ── Socket.io connections ──
io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);
  registerEvents(io, socket);

  socket.on('disconnect', () => {
    console.log(`[-] Socket disconnected: ${socket.id}`);
  });
});

// ── Start server ──
server.listen(PORT, () => {
  console.log(`\n🎨 Canvas Whiteboard running!`);
  console.log(`👉 http://localhost:${PORT}\n`);
});