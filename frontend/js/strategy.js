/* === State & Elements === */
const STORAGE_KEY = 'strategyPoints';
const CANVAS_KEY = 'strategyCanvas';

let strategyPoints = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const pointsList = document.getElementById('pointsList');
const newPointInput = document.getElementById('newPointInput');
const addPointBtn = document.getElementById('addPointBtn');

// Canvas Elements
const canvas = document.getElementById('sketchCanvas');
const ctx = canvas.getContext('2d');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const saveCanvasBtn = document.getElementById('saveCanvasBtn');
const undoBtn = document.getElementById('undoBtn');

// Toolbar Elements
const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
const colorBtns = document.querySelectorAll('.color-btn');
const strokeBtns = document.querySelectorAll('.stroke-btn');

/* === Checklist Logic === */

function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategyPoints));
}

function renderPoints() {
  pointsList.innerHTML = '';
  strategyPoints.forEach((point, pIndex) => {
    const pointEl = document.createElement('div');
    pointEl.className = 'strategy-point';
    pointEl.draggable = true;
    pointEl.dataset.index = pIndex;
    
    // Drag events for main point
    pointEl.addEventListener('dragstart', handleDragStart);
    pointEl.addEventListener('dragover', handleDragOver);
    pointEl.addEventListener('drop', handleDrop);
    pointEl.addEventListener('dragenter', e => e.preventDefault());
    pointEl.addEventListener('dragend', handleDragEnd);

    // Header
    const headerEl = document.createElement('div');
    headerEl.className = 'point-header';
    headerEl.innerHTML = `
      <span class="point-drag-handle">☰</span>
      <span class="point-title">📌 ${point.title}</span>
      <div class="point-actions">
        <button class="point-btn toggle-btn" title="Toggle Sub-points">${point.collapsed ? '▼' : '▲'}</button>
        <button class="point-btn delete-btn" title="Delete Point">❌</button>
      </div>
    `;
    
    headerEl.querySelector('.toggle-btn').addEventListener('click', () => {
      point.collapsed = !point.collapsed;
      savePoints();
      renderPoints();
    });

    headerEl.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Delete this strategy point?')) {
        strategyPoints.splice(pIndex, 1);
        savePoints();
        renderPoints();
      }
    });

    pointEl.appendChild(headerEl);

    // Sub-points container
    if (!point.collapsed) {
      const subListEl = document.createElement('div');
      subListEl.className = 'sub-points';

      (point.subPoints || []).forEach((sub, sIndex) => {
        const subEl = document.createElement('div');
        subEl.className = 'sub-point';
        subEl.draggable = true;
        subEl.dataset.pindex = pIndex;
        subEl.dataset.sindex = sIndex;

        // Sub-point drag events
        subEl.addEventListener('dragstart', handleSubDragStart);
        subEl.addEventListener('dragover', handleSubDragOver);
        subEl.addEventListener('drop', handleSubDrop);
        subEl.addEventListener('dragenter', e => e.preventDefault());
        subEl.addEventListener('dragend', handleDragEnd);

        subEl.innerHTML = `
          <input type="checkbox" class="sub-point-checkbox" />
          <span class="sub-point-text">${sub}</span>
          <button class="point-btn delete-sub-btn" title="Delete Sub-point">❌</button>
        `;

        subEl.querySelector('.delete-sub-btn').addEventListener('click', () => {
          point.subPoints.splice(sIndex, 1);
          savePoints();
          renderPoints();
        });

        subListEl.appendChild(subEl);
      });

      // Add Sub-point Input
      const addSubEl = document.createElement('div');
      addSubEl.className = 'sub-point-input-row';
      addSubEl.innerHTML = `
        <input type="text" class="strategy-input sub-point-input" placeholder="Add sub-point..." />
        <button class="btn btn-ghost sub-point-add-btn">Add</button>
      `;
      
      const input = addSubEl.querySelector('.sub-point-input');
      const addBtn = addSubEl.querySelector('.sub-point-add-btn');

      const addSubPoint = () => {
        if (input.value.trim()) {
          if (!point.subPoints) point.subPoints = [];
          point.subPoints.push(input.value.trim());
          savePoints();
          renderPoints();
        }
      };

      addBtn.addEventListener('click', addSubPoint);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSubPoint();
      });

      subListEl.appendChild(addSubEl);
      pointEl.appendChild(subListEl);
    }

    pointsList.appendChild(pointEl);
  });
}

// Drag & Drop State
let dragSrcEl = null;
let dragType = null; // 'main' or 'sub'

function handleDragStart(e) {
  if (e.target.className.includes('sub-point')) return; // handled by sub drag
  dragSrcEl = this;
  dragType = 'main';
  e.dataTransfer.effectAllowed = 'move';
  this.classList.add('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragType !== 'main') return;
  if (dragSrcEl !== this) {
    const fromIndex = parseInt(dragSrcEl.dataset.index);
    const toIndex = parseInt(this.dataset.index);
    
    // Reorder array
    const [movedItem] = strategyPoints.splice(fromIndex, 1);
    strategyPoints.splice(toIndex, 0, movedItem);
    
    savePoints();
    renderPoints();
  }
  return false;
}

function handleSubDragStart(e) {
  e.stopPropagation();
  dragSrcEl = this;
  dragType = 'sub';
  e.dataTransfer.effectAllowed = 'move';
  this.classList.add('dragging');
}

function handleSubDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleSubDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragType !== 'sub') return;
  
  const fromPIndex = parseInt(dragSrcEl.dataset.pindex);
  const fromSIndex = parseInt(dragSrcEl.dataset.sindex);
  const toPIndex = parseInt(this.dataset.pindex);
  const toSIndex = parseInt(this.dataset.sindex);

  if (fromPIndex === toPIndex && fromSIndex !== toSIndex) {
    const subList = strategyPoints[fromPIndex].subPoints;
    const [movedItem] = subList.splice(fromSIndex, 1);
    subList.splice(toSIndex, 0, movedItem);
    savePoints();
    renderPoints();
  }
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.strategy-point, .sub-point').forEach(el => el.classList.remove('dragging'));
}

addPointBtn.addEventListener('click', () => {
  const val = newPointInput.value.trim();
  if (val) {
    strategyPoints.push({ title: val, subPoints: [], collapsed: false });
    savePoints();
    renderPoints();
    newPointInput.value = '';
  }
});
newPointInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addPointBtn.click();
});

renderPoints();


/* === Canvas Logic === */

let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#ffffff';
let currentStroke = 4;
let startX, startY;
let snapshot;
let undoStack = [];

// Init Canvas
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = currentColor;
ctx.lineWidth = currentStroke;

function saveCanvasState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
  localStorage.setItem(CANVAS_KEY, canvas.toDataURL());
}

function loadCanvasState() {
  const data = localStorage.getItem(CANVAS_KEY);
  if (data) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      undoStack = [data]; // initialize stack
    };
    img.src = data;
  } else {
    undoStack = [canvas.toDataURL()];
  }
}

// Event Listeners for Toolbar
toolBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('action-btn')) return; // e.g., undo
    toolBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    colorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = btn.dataset.color;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
  });
});

strokeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    strokeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStroke = parseInt(btn.dataset.stroke);
    ctx.lineWidth = currentStroke;
  });
});

clearCanvasBtn.addEventListener('click', () => {
  if (confirm('Clear entire canvas?')) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  }
});

undoBtn.addEventListener('click', undo);
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') undo();
});

function undo() {
  if (undoStack.length > 1) {
    undoStack.pop(); // remove current state
    const data = undoStack[undoStack.length - 1];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      localStorage.setItem(CANVAS_KEY, data);
    };
    img.src = data;
  } else if (undoStack.length === 1) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.setItem(CANVAS_KEY, canvas.toDataURL());
    undoStack = [canvas.toDataURL()];
  }
}

saveCanvasBtn.addEventListener('click', () => {
  // To ensure dark background in PNG, draw it temporarily
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = '#0f1117';
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(canvas, 0, 0);
  
  const link = document.createElement('a');
  link.download = 'trade-setup-sketch.png';
  link.href = tempCanvas.toDataURL();
  link.click();
});

// Drawing logic
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const pos = getMousePos(e);
  startX = pos.x;
  startY = pos.y;

  if (currentTool === 'text') {
    const text = prompt('Enter text:');
    if (text) {
      ctx.font = `${currentStroke * 4 + 10}px 'DM Sans', sans-serif`;
      ctx.fillText(text, startX, startY);
      saveCanvasState();
    }
    isDrawing = false;
    return;
  }

  ctx.beginPath();
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (currentTool === 'pen') {
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing || currentTool === 'text') return;
  const pos = getMousePos(e);

  if (currentTool === 'pen') {
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  } else {
    // Shape drawing preview
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    
    if (currentTool === 'line') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (currentTool === 'rect') {
      ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
    } else if (currentTool === 'arrow') {
      drawArrow(ctx, startX, startY, pos.x, pos.y);
    }
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDrawing) {
    isDrawing = false;
    ctx.closePath();
    if (currentTool !== 'text') {
      saveCanvasState();
    }
  }
});

canvas.addEventListener('mouseleave', () => {
  if (isDrawing) {
    isDrawing = false;
    ctx.closePath();
    saveCanvasState();
  }
});

function drawArrow(ctx, fromx, fromy, tox, toy) {
  const headlen = 10;
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

// Initial Load
loadCanvasState();
