function togglePriceFields(outcome) {
  const priceFields = document.getElementById('priceFields');
  if (outcome === 'breakeven') {
    priceFields.classList.add('hidden');
  } else {
    priceFields.classList.remove('hidden');
  }
}

function openModal(trade = null) {
  tradeForm.reset();
  document.getElementById('tradeId').value = '';
  document.getElementById('outcome').value = 'win';
  document.getElementById('scaleRange').value = 1;
  document.getElementById('scaleValue').value = 1;
  setOutcomeToggle('win');
  togglePriceFields('win');

  step1.style.display = 'block';
  step2.style.display = 'none';

  if (trade) {
    modalTitle.textContent = 'Edit Trade';
    document.getElementById('submitBtn').textContent = 'Update Trade';
    document.getElementById('tradeId').value = trade.id;
    document.getElementById('date').value = trade.date;
    document.getElementById('symbol').value = trade.symbol;
    document.getElementById('outcome').value = trade.outcome;
    document.getElementById('pnl').value = trade.pnl;
    document.getElementById('riskReward').value = trade.riskReward;
    document.getElementById('entryPrice').value = trade.entryPrice || '';
    document.getElementById('exitPrice').value = trade.exitPrice || '';
    document.getElementById('stopLoss').value = trade.stopLoss || '';
    document.getElementById('takeProfit').value = trade.takeProfit || '';
    const scale = trade.scale || 1;
    document.getElementById('scaleRange').value = scale;
    document.getElementById('scaleValue').value = scale;
    document.getElementById('positionSize').value = trade.positionSize;
    document.getElementById('mentality').value = trade.mentality;
    document.getElementById('pros').value = trade.pros;
    document.getElementById('cons').value = trade.cons;
    document.getElementById('notes').value = trade.notes;
    setOutcomeToggle(trade.outcome);
    togglePriceFields(trade.outcome);
  } else {
    modalTitle.textContent = 'New Trade';
    document.getElementById('submitBtn').textContent = 'Save Trade';
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
  }

  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

function closeDetail() {
  detailOverlay.classList.remove('active');
  currentDetailId = null;
}

function setOutcomeToggle(value) {
  document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.outcome-btn[data-value="${value}"]`);
  if (btn) btn.classList.add('active');
}

function showDetail(trade) {
  currentDetailId = trade.id;
  detailTitle.textContent = `${trade.symbol} · ${formatDate(trade.date)}`;

  const pnlClass = trade.pnl >= 0 ? 'positive' : 'negative';
  const pnlSign = trade.pnl >= 0 ? '+' : '';

  const outcomeLabel = trade.outcome === 'win' 
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; margin-bottom: 2px;"><polyline points="20 6 9 17 4 12"></polyline></svg> Win' 
    : trade.outcome === 'loss' 
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; margin-bottom: 2px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Loss' 
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle; margin-bottom: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg> Break Even';
  const isBreakeven = trade.outcome === 'breakeven';

  detailBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-grid-item">
        <span class="label">Outcome</span>
        <span class="value" style="color: var(--${trade.outcome})">${outcomeLabel}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">P&L</span>
        <span class="value ${pnlClass}">${isBreakeven ? '—' : pnlSign + '$' + (trade.pnl?.toFixed(2) || '0.00')}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Risk/Reward</span>
        <span class="value">${trade.riskReward || '—'}</span>
      </div>
    </div>

    ${!isBreakeven ? `
    <div class="detail-grid">
      <div class="detail-grid-item">
        <span class="label">Entry</span>
        <span class="value">${trade.entryPrice || '—'}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Exit</span>
        <span class="value">${trade.exitPrice || '—'}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Scale</span>
        <span class="value">${trade.scale || '1'}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Stop Loss</span>
        <span class="value" style="color:var(--loss)">${trade.stopLoss || '—'}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Take Profit</span>
        <span class="value" style="color:var(--win)">${trade.takeProfit || '—'}</span>
      </div>
      <div class="detail-grid-item">
        <span class="label">Position Size</span>
        <span class="value">${trade.positionSize ? '$' + trade.positionSize : '—'}</span>
      </div>
    </div>` : ''}

    ${trade.mentality ? `
    <div>
      <div class="detail-section-title">Mentality & Mindset</div>
      <div class="detail-text">${escHtml(trade.mentality)}</div>
    </div>` : ''}

    ${trade.pros ? `
    <div>
      <div class="detail-section-title">✅ Pros</div>
      <div class="detail-text">${escHtml(trade.pros)}</div>
    </div>` : ''}

    ${trade.cons ? `
    <div>
      <div class="detail-section-title">❌ Cons</div>
      <div class="detail-text">${escHtml(trade.cons)}</div>
    </div>` : ''}

    ${trade.notes ? `
    <div>
      <div class="detail-section-title">Notes</div>
      <div class="detail-text">${escHtml(trade.notes)}</div>
    </div>` : ''}
  `;

  detailOverlay.classList.add('active');
}

function renderTrades() {
  const filtered = activeFilter === 'all' ? allTrades : allTrades.filter(t => t.outcome === activeFilter);

  if (filtered.length === 0) {
    tradeList.innerHTML = '';
    tradeList.appendChild(emptyState);
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  tradeList.innerHTML = filtered.map(trade => {
    const pnlClass = trade.pnl >= 0 ? 'positive' : 'negative';
    const pnlSign = trade.pnl >= 0 ? '+' : '';
    return `
      <div class="trade-card" data-id="${trade.id}">
        <div class="trade-outcome-dot ${trade.outcome}"></div>
        <div class="trade-symbol">${escHtml(trade.symbol)}</div>
        <div class="trade-date">${formatDate(trade.date)}</div>
        <div class="trade-meta">
          <div class="trade-meta-item">
            <span class="label">P&L</span>
            <span class="value ${pnlClass}">${pnlSign}$${trade.pnl?.toFixed(2) || '0.00'}</span>
          </div>
          <div class="trade-meta-item">
            <span class="label">R/R</span>
            <span class="value">${trade.riskReward || '—'}</span>
          </div>
          <div class="trade-meta-item">
            <span class="label">Entry</span>
            <span class="value">${trade.entryPrice || '—'}</span>
          </div>
          <div class="trade-meta-item">
            <span class="label">Exit</span>
            <span class="value">${trade.exitPrice || '—'}</span>
          </div>
        </div>
        <span class="trade-badge ${trade.outcome}">${trade.outcome === 'breakeven' ? 'B/E' : trade.outcome}</span>
      </div>`;
  }).join('');

  tradeList.querySelectorAll('.trade-card').forEach(card => {
    card.addEventListener('click', () => {
      const trade = allTrades.find(t => t.id === card.dataset.id);
      if (trade) showDetail(trade);
    });
  });
}

function renderStats(stats) {
  const pnlClass = stats.totalPnL >= 0 ? 'positive' : 'negative';
  const pnlSign = stats.totalPnL >= 0 ? '+' : '';

  document.querySelector('#statWinRate .stat-value').textContent =
    stats.totalTrades > 0 ? `${stats.winRate}%` : '—';
  document.querySelector('#statPnL .stat-value').className = `stat-value ${pnlClass}`;
  document.querySelector('#statPnL .stat-value').textContent =
    stats.totalTrades > 0 ? `${pnlSign}$${stats.totalPnL.toFixed(2)}` : '—';
  document.querySelector('#statTrades .stat-value').textContent = stats.totalTrades || '—';
  document.querySelector('#statRR .stat-value').textContent =
    stats.totalTrades > 0 ? `${stats.avgRR}` : '—';
  document.querySelector('#statAvgWin .stat-value').textContent =
    stats.wins > 0 ? `+$${stats.avgWin}` : '—';
  document.querySelector('#statAvgLoss .stat-value').textContent =
    stats.losses > 0 ? `-$${Math.abs(stats.avgLoss)}` : '—';
  document.querySelector('#statPF .stat-value').textContent =
    stats.totalTrades > 0 ? stats.profitFactor : '—';
  document.querySelector('#statWL .stat-value').textContent =
    stats.totalTrades > 0 ? `${stats.wins} / ${stats.losses}` : '—';
}

async function loadAll() {
  const [tradesRes, statsRes] = await Promise.all([
    fetch('/api/trades'),
    fetch('/api/trades/stats'),
  ]);
  allTrades = await tradesRes.json();
  const stats = await statsRes.json();
  renderStats(stats);
  renderTrades();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
