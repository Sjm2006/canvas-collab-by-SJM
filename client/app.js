// app.js — wires canvas + socket together

import { initCanvas, setupMouseEvents, drawStroke, clearCanvas, exportCanvas, setTool, setColor, setBrushSize } from './canvas.js';
import { initSocket, emitDraw, emitCursorMove, emitClear } from './socket.js';

// ── Get or create room ID from URL ──
function getRoomId() {
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('room');
  if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  const newId = Math.random().toString(36).substr(2, 9);
  window.history.replaceState({}, '', `/room/${newId}`);
  return newId;
}

const roomId = getRoomId();

// Update room label in topbar
const roomLabel = document.getElementById('room-id-label');
if (roomLabel) roomLabel.textContent = 'room/' + roomId;

// ── Init Canvas ──
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

// ── Init Socket ──
initSocket(roomId, {
  onIdentity: ({ name, color }) => {
    const nameEl = document.getElementById('my-name');
    const avatarEl = document.getElementById('my-avatar');
    if (nameEl) nameEl.textContent = name;
    if (avatarEl) avatarEl.style.background = color;
  },

  onBoardState: (strokes) => {
    // Replay all past strokes when joining
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
        <div style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:500;
          padding:3px 10px;border-radius:20px;border:1px solid ${u.color}33;
          color:${u.color};background:${u.color}11;">
          <span style="width:6px;height:6px;border-radius:50%;background:${u.color};flex-shrink:0;"></span>
          ${u.name}
        </div>
      `).join('');
    }
    const countEl = document.getElementById('user-count');
    if (countEl) {
      countEl.textContent = `${users.length} ${users.length === 1 ? 'person' : 'people'} online`;
    }
  }
});

// ── Tool buttons ──
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setTool(btn.dataset.tool);
  });
});

// ── Color picker ──
const colorPicker = document.getElementById('color-picker');
const colorPreview = document.getElementById('color-preview');

if (colorPicker) {
  colorPicker.addEventListener('input', (e) => {
    setColor(e.target.value);
    if (colorPreview) colorPreview.style.background = e.target.value;
    document.querySelectorAll('.preset-color').forEach(s => s.classList.remove('selected'));
  });
}

// ── Preset color swatches ──
document.querySelectorAll('.preset-color').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.color;
    setColor(color);
    if (colorPicker) colorPicker.value = color;
    if (colorPreview) colorPreview.style.background = color;
    document.querySelectorAll('.preset-color').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
  });
});

// ── Brush size ──
const brushInput = document.getElementById('brush-size');
const sizeLabel = document.getElementById('size-label');

if (brushInput) {
  brushInput.addEventListener('input', (e) => {
    setBrushSize(parseInt(e.target.value));
    if (sizeLabel) sizeLabel.textContent = e.target.value + 'px';
  });
}

// ── Clear board ──
const clearBtn = document.getElementById('clear-btn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear the board for everyone?')) {
      clearCanvas();
      emitClear();
    }
  });
}

// ── Export ──
const exportBtn = document.getElementById('export-btn');
if (exportBtn) exportBtn.addEventListener('click', exportCanvas);

// ── Share button ──
const shareBtn = document.getElementById('share-btn');
if (shareBtn) {
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      shareBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Copied!`;
      setTimeout(() => {
        shareBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Share`;
      }, 2000);
    });
  });
}