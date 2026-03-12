// events.js — all socket.io event handlers

const { addUser, removeUser, addStroke, clearRoom, getRoom, getRoomUsers } = require('./roomManager');

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F','#BB8FCE','#85C1E9'];
const NAMES = ['Panda','Tiger','Fox','Wolf','Bear','Eagle','Shark','Lion','Owl','Deer'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function registerEvents(io, socket) {
  // User joins a room
  socket.on('join-room', (roomId) => {
    const color = randomFrom(COLORS);
    const name = `${randomFrom(NAMES)} ${Math.floor(Math.random() * 99) + 1}`;

    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = name;
    socket.userColor = color;

    addUser(roomId, socket.id, name, color);

    // Send current board state to new user
    const room = getRoom(roomId);
    if (room) {
      socket.emit('board-state', room.strokes);
    }

    // Send this user their identity
    socket.emit('user-identity', { name, color });

    // Notify others of new user
    socket.to(roomId).emit('user-joined', { id: socket.id, name, color });

    // Send updated user list to everyone
    io.to(roomId).emit('users-update', getRoomUsers(roomId));

    console.log(`[${name}] joined room: ${roomId}`);
  });

  // User draws a stroke
  socket.on('draw', (strokeData) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const stroke = { ...strokeData, userId: socket.id };
    addStroke(roomId, stroke);

    // Broadcast to everyone else in room
    socket.to(roomId).emit('draw', stroke);
  });

  // User moves cursor
  socket.on('cursor-move', (position) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    socket.to(roomId).emit('cursor-move', {
      userId: socket.id,
      name: socket.userName,
      color: socket.userColor,
      ...position,
    });
  });

  // User clears the board
  socket.on('clear-board', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    clearRoom(roomId);
    io.to(roomId).emit('clear-board');
    console.log(`Board cleared in room: ${roomId}`);
  });

  // User disconnects
  socket.on('disconnect', () => {
    const roomId = removeUser(socket.id);
    if (roomId) {
      socket.to(roomId).emit('user-left', { id: socket.id });
      io.to(roomId).emit('users-update', getRoomUsers(roomId));
      console.log(`[${socket.userName}] left room: ${roomId}`);
    }
  });
}

module.exports = { registerEvents };
