// socket.js — all socket.io client communication

let socket;
const remoteCursors = new Map();

export function initSocket(roomId, callbacks) {
  // Connect to the server that served this page
  socket = io({
  transports: ['polling', 'websocket'], // polling FIRST
  upgrade: true
});

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('join-room', roomId);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  // Our identity assigned by server
  socket.on('user-identity', (identity) => {
    callbacks.onIdentity(identity);
  });

  // Full board history on join
  socket.on('board-state', (strokes) => {
    console.log('Received board state:', strokes.length, 'strokes');
    callbacks.onBoardState(strokes);
  });

  // Incoming stroke from another user
  socket.on('draw', (stroke) => {
    callbacks.onRemoteDraw(stroke);
  });

  // Incoming cursor position
  socket.on('cursor-move', (data) => {
    updateRemoteCursor(data);
  });

  // Board cleared by someone
  socket.on('clear-board', () => {
    callbacks.onClear();
    clearAllCursors();
  });

  // User list updated
  socket.on('users-update', (users) => {
    callbacks.onUsersUpdate(users);
  });

  // A user left
  socket.on('user-left', ({ id }) => {
    removeRemoteCursor(id);
  });
}

export function emitDraw(strokeData) {
  if (socket && socket.connected) socket.emit('draw', strokeData);
}

export function emitCursorMove(x, y) {
  if (socket && socket.connected) socket.emit('cursor-move', { x, y });
}

export function emitClear() {
  if (socket && socket.connected) socket.emit('clear-board');
}

// --- Remote cursor DOM management ---
function updateRemoteCursor(data) {
  let cursorEl = remoteCursors.get(data.userId);

  if (!cursorEl) {
    cursorEl = document.createElement('div');
    cursorEl.className = 'remote-cursor';
    cursorEl.innerHTML = `
      <div class="cursor-dot" style="background:${data.color}"></div>
      <div class="cursor-label" style="background:${data.color}">${data.name}</div>
    `;
    const layer = document.getElementById('cursors-layer');
    if (layer) layer.appendChild(cursorEl);
    remoteCursors.set(data.userId, cursorEl);
  }

  cursorEl.style.left = data.x + 'px';
  cursorEl.style.top = data.y + 'px';
}

function removeRemoteCursor(userId) {
  const el = remoteCursors.get(userId);
  if (el) { el.remove(); remoteCursors.delete(userId); }
}

function clearAllCursors() {
  remoteCursors.forEach(el => el.remove());
  remoteCursors.clear();
}