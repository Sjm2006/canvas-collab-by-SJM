// socket.js — handles all socket.io client-side communication

let socket;
let myIdentity = null;
const remoteCursors = new Map(); // userId -> cursor DOM element

export function initSocket(roomId, callbacks) {
  socket = io();

  socket.on('connect', () => {
    socket.emit('join-room', roomId);
  });

  // Receive our identity (name + color)
  socket.on('user-identity', (identity) => {
    myIdentity = identity;
    callbacks.onIdentity(identity);
  });

  // Receive full board history on join
  socket.on('board-state', (strokes) => {
    callbacks.onBoardState(strokes);
  });

  // Receive a stroke from another user
  socket.on('draw', (stroke) => {
    callbacks.onRemoteDraw(stroke);
  });

  // Receive cursor movement from another user
  socket.on('cursor-move', (data) => {
    updateRemoteCursor(data);
  });

  // Board was cleared
  socket.on('clear-board', () => {
    callbacks.onClear();
    clearAllCursors();
  });

  // Updated user list
  socket.on('users-update', (users) => {
    callbacks.onUsersUpdate(users);
  });

  // A user left
  socket.on('user-left', ({ id }) => {
    removeRemoteCursor(id);
  });
}

export function emitDraw(strokeData) {
  if (socket) socket.emit('draw', strokeData);
}

export function emitCursorMove(x, y) {
  if (socket) socket.emit('cursor-move', { x, y });
}

export function emitClear() {
  if (socket) socket.emit('clear-board');
}

// --- Remote cursor rendering ---
function updateRemoteCursor(data) {
  let cursorEl = remoteCursors.get(data.userId);

  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.className = 'remote-cursor';
    cursorEl.innerHTML = `
      <div class="cursor-dot" style="background:${data.color}"></div>
      <div class="cursor-label" style="background:${data.color}">${data.name}</div>
    `;
    document.getElementById('cursors-layer').appendChild(cursorEl);
    remoteCursors.set(data.userId, cursorEl);
  }

  cursorEl.style.left = data.x + 'px';
  cursorEl.style.top = data.y + 'px';
}

function removeRemoteCursor(userId) {
  const el = remoteCursors.get(userId);
  if (el) {
    el.remove();
    remoteCursors.delete(userId);
  }
}

function clearAllCursors() {
  remoteCursors.forEach(el => el.remove());
  remoteCursors.clear();
}
