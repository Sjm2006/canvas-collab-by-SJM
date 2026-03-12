// index.js — Express + Socket.io server

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { registerEvents } = require('./events');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// All routes serve index.html (room URLs like /room/abc123)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  registerEvents(io, socket);
});

server.listen(PORT, () => {
  console.log(`\n🎨 Whiteboard server running!`);
  console.log(`👉 Open: http://localhost:${PORT}\n`);
});
