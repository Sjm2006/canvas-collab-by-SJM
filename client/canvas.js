// canvas.js — all drawing logic for the whiteboard

let canvas, ctx;
let isDrawing = false;
let lastX = 0, lastY = 0;
let currentTool = 'pen';
let currentColor = '#ffffff';
let brushSize = 4;
let startX = 0, startY = 0;
let snapshot = null; // for shape preview

export function initCanvas(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  return canvas;
}

export function resizeCanvas() {
  // Save current drawing
  const imageData = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCtxDefaults();
  if (imageData) ctx.putImageData(imageData, 0, 0);
}

function setCtxDefaults() {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function setTool(tool) { currentTool = tool; }
export function setColor(color) { currentColor = color; }
export function setBrushSize(size) { brushSize = size; }
export function getCurrentTool() { return currentTool; }

// Draw a complete stroke from data (used for replay + remote)
export function drawStroke(stroke) {
  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

  if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
    const pts = stroke.points;
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
  } else if (stroke.tool === 'rect') {
    ctx.strokeRect(stroke.x, stroke.y, stroke.w, stroke.h);
  } else if (stroke.tool === 'circle') {
    ctx.beginPath();
    ctx.arc(stroke.x, stroke.y, stroke.r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (stroke.tool === 'line') {
    ctx.beginPath();
    ctx.moveTo(stroke.x1, stroke.y1);
    ctx.lineTo(stroke.x2, stroke.y2);
    ctx.stroke();
  }
  ctx.restore();
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCtxDefaults();
}

export function exportCanvas() {
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = canvas.toDataURL();
  link.click();
}

// --- Mouse event handlers ---
let currentPoints = [];
let onStrokeComplete = null;

export function setupMouseEvents(canvasEl, callbacks) {
  onStrokeComplete = callbacks.onStrokeComplete;

  canvasEl.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getPos(e);
    lastX = x; lastY = y;
    startX = x; startY = y;
    currentPoints = [{ x, y }];

    if (currentTool !== 'pen' && currentTool !== 'eraser') {
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  });

  canvasEl.addEventListener('mousemove', (e) => {
    const { x, y } = getPos(e);
    callbacks.onCursorMove(x, y);

    if (!isDrawing) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
      currentPoints.push({ x, y });
      lastX = x; lastY = y;
    } else {
      // Shape preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.save();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'source-over';
      drawShapePreview(startX, startY, x, y);
      ctx.restore();
    }
  });

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    const { x, y } = getPos(e);

    let strokeData;
    if (currentTool === 'pen' || currentTool === 'eraser') {
      currentPoints.push({ x, y });
      strokeData = { tool: currentTool, color: currentColor, size: brushSize, points: currentPoints };
    } else if (currentTool === 'rect') {
      strokeData = { tool: 'rect', color: currentColor, size: brushSize, x: startX, y: startY, w: x - startX, h: y - startY };
    } else if (currentTool === 'circle') {
      const r = Math.hypot(x - startX, y - startY);
      strokeData = { tool: 'circle', color: currentColor, size: brushSize, x: startX, y: startY, r };
    } else if (currentTool === 'line') {
      strokeData = { tool: 'line', color: currentColor, size: brushSize, x1: startX, y1: startY, x2: x, y2: y };
    }

    if (strokeData) onStrokeComplete(strokeData);
  };

  canvasEl.addEventListener('mouseup', stopDrawing);
  canvasEl.addEventListener('mouseleave', stopDrawing);

  // Touch support
  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    canvasEl.dispatchEvent(new MouseEvent('mousedown', getTouchPos(e)));
  }, { passive: false });
  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    canvasEl.dispatchEvent(new MouseEvent('mousemove', getTouchPos(e)));
  }, { passive: false });
  canvasEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    canvasEl.dispatchEvent(new MouseEvent('mouseup', getTouchPos(e)));
  }, { passive: false });
}

function drawShapePreview(x1, y1, x2, y2) {
  if (currentTool === 'rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (currentTool === 'circle') {
    const r = Math.hypot(x2 - x1, y2 - y1);
    ctx.beginPath();
    ctx.arc(x1, y1, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (currentTool === 'line') {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function getTouchPos(e) {
  const touch = e.touches[0] || e.changedTouches[0];
  return { clientX: touch.clientX, clientY: touch.clientY };
}
