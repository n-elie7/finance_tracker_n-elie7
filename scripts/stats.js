import { getTransactions, getSettings } from './state.js';
import { getLastNDays, getDaysAgo } from './utils.js';

export function getTotalTransactions() {
  return getTransactions().length;
}

export function getTotalSpent() {
  const transactions = getTransactions();
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}


export function getBudgetStatus() {
  const settings = getSettings();
  const budgetCap = settings.budgetCap;

  if (!budgetCap || budgetCap <= 0) {
    return {
      remaining: null,
      isOver: false,
      percentage: 0,
      hasBudget: false
    };
  }

  const totalSpent = getTotalSpent();
  const remaining = budgetCap - totalSpent;
  const isOver = remaining < 0;
  const percentage = Math.min((totalSpent / budgetCap) * 100, 100);

  return {
    remaining,
    isOver,
    percentage,
    hasBudget: true
  };
}


export function getTopCategory() {
  const transactions = getTransactions();

  if (transactions.length === 0) {
    return { category: null, amount: 0, count: 0 };
  }

  // Group by category
  const categories = {};

  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = { amount: 0, count: 0 };
    }
    categories[transaction.category].amount += transaction.amount;
    categories[transaction.category].count += 1;
  });

  // Find category with highest total amount
  let topCategory = null;
  let maxAmount = 0;

  Object.keys(categories).forEach(category => {
    if (categories[category].amount > maxAmount) {
      maxAmount = categories[category].amount;
      topCategory = category;
    }
  });

  if (!topCategory) {
    return { category: null, amount: 0, count: 0 };
  }

  return {
    category: topCategory,
    amount: categories[topCategory].amount,
    count: categories[topCategory].count
  };
}


export function getLast7DaysSpending() {
  const transactions = getTransactions();
  const last7Days = getLastNDays(7);

  // Group transactions by date
  const spendingByDate = {};

  last7Days.forEach(date => {
    spendingByDate[date] = 0;
  });

  transactions.forEach(transaction => {
    if (spendingByDate.hasOwnProperty(transaction.date)) {
      spendingByDate[transaction.date] += transaction.amount;
    }
  });

  // Convert to array
  return last7Days.map(date => {
    const dateObj = new Date(date + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      date,
      amount: spendingByDate[date],
      dayLabel
    };
  });
}


export function getSpendingForPeriod(days) {
  const transactions = getTransactions();
  const cutoffDate = getDaysAgo(days);

  return transactions
    .filter(transaction => transaction.date >= cutoffDate)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}


export function getCategoryBreakdown() {
  const transactions = getTransactions();
  const totalSpent = getTotalSpent();

  if (transactions.length === 0) {
    return [];
  }

  // Group by category
  const categories = {};

  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = { amount: 0, count: 0 };
    }
    categories[transaction.category].amount += transaction.amount;
    categories[transaction.category].count += 1;
  });

  // Convert to array and calculate percentages
  return Object.keys(categories)
    .map(category => ({
      category,
      amount: categories[category].amount,
      count: categories[category].count,
      percentage: totalSpent > 0 ? (categories[category].amount / totalSpent) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getAverageTransaction() {
  const transactions = getTransactions();
  if (transactions.length === 0) return 0;

  const total = getTotalSpent();
  return total / transactions.length;
}

export function getSpendingTrend(days = 7) {
  const transactions = getTransactions();
  
  const currentPeriodStart = getDaysAgo(days - 1);
  const previousPeriodStart = getDaysAgo(days * 2 - 1);
  const previousPeriodEnd = getDaysAgo(days);

  const currentSpending = transactions
    .filter(transaction => transaction.date >= currentPeriodStart)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const previousSpending = transactions
    .filter(transaction => transaction.date >= previousPeriodStart && transaction.date < previousPeriodEnd)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const change = currentSpending - previousSpending;
  const isIncrease = change > 0;
  const percentChange = previousSpending > 0 
    ? (Math.abs(change) / previousSpending) * 100 
    : 0;

  return {
    current: currentSpending,
    previous: previousSpending,
    change,
    isIncrease,
    percentChange
  };
}
