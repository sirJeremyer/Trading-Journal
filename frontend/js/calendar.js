document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('calendar-container');

  try {
    const res = await fetch('/api/trades');
    const trades = await res.json();

    //calculate daily profit or losses
    const dailyData = {};
    trades.forEach(t => {
      if (!t.date) return;
      if (!dailyData[t.date]) {
        dailyData[t.date] = { pnl: 0, count: 0 };
      }
      dailyData[t.date].pnl += (t.pnl || 0);
      dailyData[t.date].count += 1;
    });

    // Generate last 12 months
    const today = new Date();
    // Start 11 months ago to include current month = 12 months total
    const startMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    let currentMonthHtml = '<div class="current-month-section">';
    let otherMonthsHtml = '<div class="other-months-section">';

    for (let i = 0; i < 12; i++) {
      const isCurrentMonth = (i === 11);
      const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const year = currentMonth.getFullYear();
      const monthIndex = currentMonth.getMonth();
      const monthName = currentMonth.toLocaleString('default', { month: isCurrentMonth ? 'long' : 'short' });
      
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      
      let monthPnL = 0;
      let monthTrades = 0;
      let daysHtml = '';
      
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayData = dailyData[dateStr];
        
        let colorClass = 'empty';
        let titleText = `${dateStr}: No trades`;
        
        if (dayData) {
          monthPnL += dayData.pnl;
          monthTrades += dayData.count;

          if (dayData.pnl > 0) {
            colorClass = 'win';
          } else if (dayData.pnl < 0) {
            colorClass = 'loss';
          } else {
            colorClass = 'breakeven';
          }
          const pnlSign = dayData.pnl >= 0 ? '+' : '';
          titleText = `${dateStr}: ${dayData.count} trade(s), P&L: ${pnlSign}$${dayData.pnl.toFixed(2)}`;
        }
        
        if (isCurrentMonth) {
           let innerHtml = `<div class="day-num">${d}</div>`;
           if (dayData && dayData.pnl !== 0) {
             const pnlSign = dayData.pnl > 0 ? '+' : '';
             innerHtml += `<div class="day-pnl">${pnlSign}$${Math.abs(dayData.pnl).toFixed(0)}</div>`;
           }
           daysHtml += `<div class="day-box day-box-large ${colorClass}" title="${titleText}">${innerHtml}</div>`;
        } else {
           daysHtml += `<div class="day-box day-box-small ${colorClass}" title="${titleText}"></div>`;
        }
      }

      const pnlClass = monthPnL >= 0 ? 'positive' : 'negative';
      const pnlSign = monthPnL >= 0 ? '+' : '';
      
      let monthHtml = `<div class="month-block ${isCurrentMonth ? 'current' : 'other'}">`;
      monthHtml += `<div class="month-title">${monthName} ${year}</div>`;
      monthHtml += `<div class="month-stats">Trades: ${monthTrades} <br/> P&L: <span class="value ${pnlClass}">${pnlSign}$${monthPnL.toFixed(2)}</span></div>`;
      monthHtml += `<div class="days-grid ${isCurrentMonth ? 'grid-large' : 'grid-small'}">`;
      monthHtml += daysHtml;
      monthHtml += `</div></div>`;

      if (isCurrentMonth) {
        currentMonthHtml += monthHtml;
      } else {
        otherMonthsHtml += monthHtml;
      }
    }
    
    currentMonthHtml += '</div>';
    otherMonthsHtml += '</div>';

    container.innerHTML = currentMonthHtml + otherMonthsHtml;

  } catch (err) {
    console.error('Error loading trades for calendar:', err);
    container.innerHTML = `<div class="empty-state"><p>Error loading calendar data.</p></div>`;
  }
});
