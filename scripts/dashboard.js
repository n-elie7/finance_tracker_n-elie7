import { getSettings } from './state.js';
import { formatCurrency } from './utils.js';
import {
  getTotalTransactions,
  getTotalSpent,
  getBudgetStatus,
  getTopCategory,
  getLast7DaysSpending
} from './stats.js';

export function updateDashboard() {
  updateStatCards();
  updateChart();
}

function updateStatCards() {
  const settings = getSettings();
  const totalTransactions = getTotalTransactions();
  const totalSpent = getTotalSpent();
  const budgetStatus = getBudgetStatus();
  const topCategory = getTopCategory();

  // total transactions
  const totalEl = document.getElementById('stat-total');
  if (totalEl) {
    totalEl.textContent = totalTransactions;
  }

  // total used amount
  const spentEl = document.getElementById('stat-spent');
  if (spentEl) {
    spentEl.textContent = formatCurrency(totalSpent, settings.baseCurrency);
  }

  // budget remaining
  const remainingEl = document.getElementById('stat-remaining');
  if (remainingEl) {
    if (budgetStatus.hasBudget) {
      const amount = Math.abs(budgetStatus.remaining);
      const formatted = formatCurrency(amount, settings.baseCurrency);
      
      if (budgetStatus.isOver) {
        remainingEl.textContent = `-${formatted}`;
        remainingEl.style.color = 'var(--clr-danger)';
      } else if (budgetStatus.percentage >= 90) {
        remainingEl.textContent = formatted;
        remainingEl.style.color = 'var(--clr-warning)'; 
      } else {
        remainingEl.textContent = formatted;
        remainingEl.style.color = 'var(--clr-success)';
      }
    } else {
      remainingEl.textContent = '--';
      remainingEl.style.color = '';
    }
  }

  // top category
  const topCategoryEl = document.getElementById('stat-top-category');
  if (topCategoryEl) {
    if (topCategory.category) {
      const amount = formatCurrency(topCategory.amount, settings.baseCurrency);
      topCategoryEl.textContent = `${topCategory.category}`;
    } else {
      topCategoryEl.textContent = '--';
    }
  }
}

function updateChart() {
  const chartContainer = document.getElementById('chart-bars');
  const chartEmpty = document.getElementById('chart-empty');
  const data = getLast7DaysSpending();

  if (!chartContainer || !chartEmpty) return;

  // Check if there's any spending
  const hasSpending = data.some(day => day.amount > 0);

  if (!hasSpending) {
    // Show empty state
    chartEmpty.removeAttribute('hidden');
    chartContainer.setAttribute('hidden', '');
    chartContainer.setAttribute('aria-hidden', 'true');
    return;
  }

  chartEmpty.setAttribute('hidden', '');
  chartContainer.removeAttribute('hidden');
  chartContainer.removeAttribute('aria-hidden');

  const maxAmount = Math.max(...data.map(d => d.amount));

  chartContainer.innerHTML = '';

  // create bars
  data.forEach(day => {
    const barWrap = document.createElement('div');
    barWrap.className = 'chart-bar-wrap';

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    
    // Calculate height percentage
    const rawHeight = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
    const heightPercent = Math.round(rawHeight * 10) / 10;
    bar.style.height = `${heightPercent}%`;
    
    // Set ARIA label
    const settings = getSettings();
    const formattedAmount = formatCurrency(day.amount, settings.baseCurrency);
    bar.setAttribute('aria-label', `${day.dayLabel}: ${formattedAmount}`);
    bar.setAttribute('role', 'img');

    const label = document.createElement('div');
    label.className = 'chart-bar-label';
    label.textContent = day.dayLabel;

    barWrap.appendChild(bar);
    barWrap.appendChild(label);
    chartContainer.appendChild(barWrap);
  });
}

export function initDashboard() {
  updateDashboard();
}
