/* === State === */
let allTrades = [];
let activeFilter = 'all';
let currentDetailId = null;

/* === DOM Refs === */
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modalOverlay = document.getElementById('modalOverlay');
const tradeForm = document.getElementById('tradeForm');
const modalTitle = document.getElementById('modalTitle');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');

const detailOverlay = document.getElementById('detailOverlay');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const detailDeleteBtn = document.getElementById('detailDeleteBtn');
const detailEditBtn = document.getElementById('detailEditBtn');
const detailBody = document.getElementById('detailBody');
const detailTitle = document.getElementById('detailTitle');

const tradeList = document.getElementById('tradeList');
const emptyState = document.getElementById('emptyState');

/* === Outcome Toggle === */
document.querySelectorAll('.outcome-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const val = btn.dataset.value;
    document.getElementById('outcome').value = val;
    togglePriceFields(val);
  });
});

/* === Scale Slider Sync === */
document.getElementById('scaleRange').addEventListener('input', (e) => {
  document.getElementById('scaleValue').value = e.target.value;
});
document.getElementById('scaleValue').addEventListener('input', (e) => {
  let v = parseFloat(e.target.value);
  if (!isNaN(v)) {
    v = Math.min(10, Math.max(0.01, v));
    document.getElementById('scaleRange').value = v;
  }
});

/* === Modal Open/Close === */
openModalBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

nextBtn.addEventListener('click', () => {
  const dateInput = document.getElementById('date');
  const symbolInput = document.getElementById('symbol');
  
  if (!dateInput.checkValidity()) {
    dateInput.reportValidity();
    return;
  }
  if (!symbolInput.checkValidity()) {
    symbolInput.reportValidity();
    return;
  }

  step1.style.display = 'none';
  step2.style.display = 'block';
});

backBtn.addEventListener('click', () => {
  step2.style.display = 'none';
  step1.style.display = 'block';
});

closeDetailBtn.addEventListener('click', closeDetail);
detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) closeDetail(); });

/* === Form Submit === */
tradeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('tradeId').value;
  const body = {
    date: document.getElementById('date').value,
    symbol: document.getElementById('symbol').value,
    outcome: document.getElementById('outcome').value,
    pnl: document.getElementById('pnl').value,
    riskReward: document.getElementById('riskReward').value,
    entryPrice: document.getElementById('entryPrice').value,
    exitPrice: document.getElementById('exitPrice').value,
    stopLoss: document.getElementById('stopLoss').value,
    takeProfit: document.getElementById('takeProfit').value,
    scale: document.getElementById('scaleValue').value,
    positionSize: document.getElementById('positionSize').value,
    mentality: document.getElementById('mentality').value,
    pros: document.getElementById('pros').value,
    cons: document.getElementById('cons').value,
    notes: document.getElementById('notes').value,
  };

  try {
    if (id) {
      await fetch(`/api/trades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    closeModal();
    await loadAll();
  } catch (err) {
    console.error(err);
  }
});

/* === Detail Modal === */
detailEditBtn.addEventListener('click', () => {
  const trade = allTrades.find(t => t.id === currentDetailId);
  if (!trade) return;
  closeDetail();
  openModal(trade);
});

detailDeleteBtn.addEventListener('click', async () => {
  if (!currentDetailId) return;
  if (!confirm('Delete this trade? This cannot be undone.')) return;
  await fetch(`/api/trades/${currentDetailId}`, { method: 'DELETE' });
  closeDetail();
  await loadAll();
});

/* === Filter Buttons === */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderTrades();
  });
});

/* === Init === */
loadAll();
