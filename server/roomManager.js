// roomManager.js — manages all active rooms and their state

const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      strokes: [],      // full drawing history
      users: new Map(), // socketId -> { id, name, color }
    });
  }
  return rooms.get(roomId);
}

function addUser(roomId, socketId, name, color) {
  const room = getOrCreateRoom(roomId);
  room.users.set(socketId, { id: socketId, name, color });
  return room;
}

function removeUser(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.users.has(socketId)) {
      room.users.delete(socketId);
      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
      return roomId;
    }
  }
  return null;
}

function addStroke(roomId, stroke) {
  const room = rooms.get(roomId);
  if (room) {
    room.strokes.push(stroke);
  }
}

function clearRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.strokes = [];
  }
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function getRoomUsers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users.values());
}

module.exports = { getOrCreateRoom, addUser, removeUser, addStroke, clearRoom, getRoom, getRoomUsers };
