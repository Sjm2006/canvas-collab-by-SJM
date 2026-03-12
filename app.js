// app.js — main entry point, wires everything together

import { initCanvas, setupMouseEvents, drawStroke, clearCanvas, exportCanvas, setTool, setColor, setBrushSize } from './canvas.js';
import { initSocket, emitDraw, emitCursorMove, emitClear } from './socket.js';

// --- Room ID from URL ---
function getRoomId() {
  const parts = window.location.pathname.split('/');
  const roomIndex = parts.indexOf('room');
  if (roomIndex !== -1 && parts[roomIndex + 1]) {
    return parts[roomIndex + 1];
  }
  const newId = Math.random().toString(36).substr(2, 9);
  window.history.replaceState({}, '', `/room/${newId}`);
  return newId;
}

const roomId = getRoomId();

// --- Init Canvas ---
const canvasEl = document.getElementById('whiteboard');
initCanvas(canvasEl);

setupMouseEvents(canvasEl, {
  onStrokeComplete: (strokeData) => {
    drawStroke(strokeData);
    emitDraw(strokeData);
  },
  onCursorMove: (x, y) => {
    emitCursorMove(x, y);
  }
});

// --- Init Socket ---
initSocket(roomId, {
  onIdentity: ({ name, color }) => {
    const nameEl = document.getElementById('my-name');
    const avatarEl = document.getElementById('my-avatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.style.background = color;
  },
  onBoardState: (strokes) => {
    strokes.forEach(drawStroke);
  },
  onRemoteDraw: (stroke) => {
    drawStroke(stroke);
  },
  onClear: () => {
    clearCanvas();
  },
  onUsersUpdate: (users) => {
    const container = document.getElementById('users-list');
    if (container) {
      container.innerHTML = users.map(u => `
        <div class="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border"
          style="color:${u.color}; border-color:${u.color}33; background:${u.color}11;">
          <span class="w-1.5 h-1.5 rounded-full live-dot" style="background:${u.color}; --chip-color:${u.color}44"></span>
          ${u.name}
        </div>
      `).join('');
    }
    const countEl = document.getElementById('user-count');
    if (countEl) countEl.textContent = `${users.length} ${users.length === 1 ? 'person' : 'people'} online`;
  }
});

// --- Tool buttons ---
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTool(btn.dataset.tool);
  });
});

// --- Color picker ---
document.getElementById('color-picker').addEventListener('input', (e) => {
  setColor(e.target.value);
  document.getElementById('color-preview').style.background = e.target.value;
  document.querySelectorAll('.preset-color').forEach(s => s.classList.remove('selected'));
});

// --- Preset colors ---
document.querySelectorAll('.preset-color').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    setColor(color);
    document.getElementById('color-picker').value = color;
    document.getElementById('color-preview').style.background = color;
  });
});

// --- Brush size ---
document.getElementById('brush-size').addEventListener('input', (e) => {
  setBrushSize(parseInt(e.target.value));
  document.getElementById('size-label').textContent = e.target.value + 'px';
});

// --- Clear ---
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Clear the board for everyone?')) {
    clearCanvas();
    emitClear();
  }
});

// --- Export ---
document.getElementById('export-btn').addEventListener('click', exportCanvas);