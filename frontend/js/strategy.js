/* === State & Elements === */
const STORAGE_KEY = 'strategyPoints';
const CANVAS_KEY = 'strategyCanvas';
const TRADE_LOG_KEY = 'strategyTradeLog';
const PINNED_KEY = 'pinnedSketches';

let strategyPoints = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let tradeLog = JSON.parse(localStorage.getItem(TRADE_LOG_KEY)) || [];
let pinnedSketches = JSON.parse(localStorage.getItem(PINNED_KEY)) || [];

const pointsList = document.getElementById('pointsList');
const newPointInput = document.getElementById('newPointInput');
const addPointBtn = document.getElementById('addPointBtn');

// Canvas Elements
const canvas = document.getElementById('sketchCanvas');
const ctx = canvas.getContext('2d');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const saveCanvasBtn = document.getElementById('saveCanvasBtn');
const undoBtn = document.getElementById('undoBtn');
const pinCanvasBtn = document.getElementById('pinCanvasBtn');

// Layout Elements
const toggleCanvasBtn = document.getElementById('toggleCanvasBtn');
const strategyLayout = document.getElementById('strategyLayout');
const pinboardContainer = document.getElementById('pinboardContainer');
const importImageBtn = document.getElementById('importImageBtn');
const importImageInput = document.getElementById('importImageInput');

// Lightbox Elements
const lightboxOverlay = document.getElementById('lightboxOverlay');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');
const lightboxImage = document.getElementById('lightboxImage');

// Commit Elements
const clearChecksBtn = document.getElementById('clearChecksBtn');
const commitWinBtn = document.getElementById('commitWinBtn');
const commitLossBtn = document.getElementById('commitLossBtn');
const commitBEBtn = document.getElementById('commitBEBtn');
const toastNotification = document.getElementById('toastNotification');

// Toolbar Elements
const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
const colorBtns = document.querySelectorAll('.color-btn');
const strokeBtns = document.querySelectorAll('.stroke-btn');


/* === UI & Logic Integrations === */

// Toggle Canvas
toggleCanvasBtn.addEventListener('click', () => {
  strategyLayout.classList.toggle('canvas-hidden');
  const isHidden = strategyLayout.classList.contains('canvas-hidden');
  toggleCanvasBtn.textContent = isHidden ? '📐 Show Canvas' : '📐 Hide Canvas';
});

// Toast
function showToast(msg) {
  toastNotification.textContent = msg;
  toastNotification.classList.add('show');
  setTimeout(() => toastNotification.classList.remove('show'), 3000);
}

// Pinned Sketches
function renderPinnedSketches() {
  pinboardContainer.innerHTML = '';
  pinnedSketches.forEach((sketch, idx) => {
    const div = document.createElement('div');
    div.className = 'pinned-sketch';
    div.innerHTML = `
      <div class="pinned-sketch-del" data-idx="${idx}">✕</div>
      <img src="${sketch.dataUrl}" />
      <div class="pinned-sketch-label" title="${sketch.label}">${sketch.label}</div>
    `;
    
    const img = div.querySelector('img');
    img.addEventListener('click', () => {
      lightboxImage.src = sketch.dataUrl;
      lightboxOverlay.classList.add('active');
    });

    div.querySelector('.pinned-sketch-del').addEventListener('click', () => {
      if(confirm('Delete this pinned image?')) {
        pinnedSketches.splice(idx, 1);
        localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSketches));
        renderPinnedSketches();
      }
    });
    pinboardContainer.appendChild(div);
  });
}
renderPinnedSketches();

// Import Image
importImageBtn.addEventListener('click', () => importImageInput.click());
importImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const label = prompt('Enter a label for this imported image:', file.name);
      if (label !== null) {
        pinnedSketches.push({ label: label || 'Imported Image', dataUrl: ev.target.result });
        localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSketches));
        renderPinnedSketches();
        showToast('Image pinned!');
      }
    };
    reader.readAsDataURL(file);
  }
  importImageInput.value = ''; // Reset input
});

// Lightbox Logic
closeLightboxBtn.addEventListener('click', () => lightboxOverlay.classList.remove('active'));
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('active');
});


/* === Checklist Logic === */

function savePoints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategyPoints));
}

function renderPoints() {
  pointsList.innerHTML = '';
  
  // Calculate point statistics from tradeLog
  const pointStats = {};
  tradeLog.forEach(log => {
    log.checkedPoints.forEach(pt => {
      if (!pointStats[pt]) pointStats[pt] = { total: 0, wins: 0 };
      pointStats[pt].total++;
      if (log.outcome === 'win') pointStats[pt].wins++;
    });
  });

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

    // Stats formatting
    const rawTitle = point.title.trim();
    const stats = pointStats[rawTitle];
    const statsStr = stats 
      ? `Checked: ${stats.total} &times; | Win rate: ${Math.round(stats.wins/stats.total*100)}%` 
      : 'No data yet';

    // Header
    const headerEl = document.createElement('div');
    headerEl.className = 'point-header';
    headerEl.innerHTML = `
      <span class="point-drag-handle">☰</span>
      <div class="point-title-wrapper">
        <span class="point-title">📌 ${point.title}</span>
        <span class="point-stats">${statsStr}</span>
      </div>
      <div class="point-actions">
        <button class="point-btn edit-btn" title="Edit Point">✏️</button>
        <button class="point-btn toggle-btn" title="Toggle Sub-points">${point.collapsed ? '▼' : '▲'}</button>
        <button class="point-btn delete-btn" title="Delete Point">❌</button>
      </div>
    `;
    
    // Check toggle
    headerEl.querySelector('.point-title-wrapper').addEventListener('click', (e) => {
      pointEl.classList.toggle('checked');
    });

    headerEl.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const newTitle = prompt('Rename Strategy Point:', point.title);
      if (newTitle && newTitle.trim()) {
        point.title = newTitle.trim();
        savePoints();
        renderPoints();
      }
    });

    headerEl.querySelector('.toggle-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      point.collapsed = !point.collapsed;
      savePoints();
      renderPoints();
    });

    headerEl.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
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
        const subRaw = sub.trim();
        const subStats = pointStats[subRaw];
        const subStatsStr = subStats 
          ? `Checked: ${subStats.total} &times; | Win rate: ${Math.round(subStats.wins/subStats.total*100)}%` 
          : 'No data yet';

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
          <div class="point-title-wrapper">
            <span class="sub-point-text">${sub}</span>
            <span class="point-stats">${subStatsStr}</span>
          </div>
          <button class="point-btn edit-sub-btn" title="Edit Sub-point">✏️</button>
          <button class="point-btn delete-sub-btn" title="Delete Sub-point">❌</button>
        `;

        // Check toggle (either click checkbox or text)
        const cb = subEl.querySelector('.sub-point-checkbox');
        subEl.querySelector('.point-title-wrapper').addEventListener('click', (e) => {
          subEl.classList.toggle('checked');
          cb.checked = subEl.classList.contains('checked');
        });
        cb.addEventListener('change', () => {
          if (cb.checked) subEl.classList.add('checked');
          else subEl.classList.remove('checked');
        });

        subEl.querySelector('.edit-sub-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const newTitle = prompt('Rename Sub-point:', sub);
          if (newTitle && newTitle.trim()) {
            point.subPoints[sIndex] = newTitle.trim();
            savePoints();
            renderPoints();
          }
        });

        subEl.querySelector('.delete-sub-btn').addEventListener('click', (e) => {
          e.stopPropagation();
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


/* === Trade Commit Logic === */

function clearAllChecks() {
  document.querySelectorAll('.checked').forEach(el => el.classList.remove('checked'));
  document.querySelectorAll('.sub-point-checkbox').forEach(cb => cb.checked = false);
}

clearChecksBtn.addEventListener('click', clearAllChecks);

function commitTrade(outcome) {
  const checkedEls = document.querySelectorAll('.checked');
  const checkedPoints = [];
  
  checkedEls.forEach(el => {
    if (el.classList.contains('strategy-point')) {
      checkedPoints.push(el.querySelector('.point-title').textContent.replace('📌 ', '').trim());
    } else if (el.classList.contains('sub-point')) {
      checkedPoints.push(el.querySelector('.sub-point-text').textContent.trim());
    }
  });
  
  tradeLog.push({ outcome, checkedPoints, timestamp: new Date().toISOString() });
  localStorage.setItem(TRADE_LOG_KEY, JSON.stringify(tradeLog));
  
  clearAllChecks();
  renderPoints(); // update stats
  
  const outcomeLabels = { 'win': 'Win ✅', 'loss': 'Loss ❌', 'breakeven': 'Break Even ➖' };
  showToast(`Trade committed as ${outcomeLabels[outcome]}`);
}

commitWinBtn.addEventListener('click', () => commitTrade('win'));
commitLossBtn.addEventListener('click', () => commitTrade('loss'));
commitBEBtn.addEventListener('click', () => commitTrade('breakeven'));


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

// Pin Canvas
pinCanvasBtn.addEventListener('click', () => {
  const label = prompt('Enter a label for this sketch:');
  if (label) {
    pinnedSketches.push({ label, dataUrl: canvas.toDataURL() });
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSketches));
    renderPinnedSketches();
    showToast('Sketch pinned!');
  }
});

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
