export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    RWF: 'FRW'
  };

  const symbol = symbols[currency] || '$';
  const decimals = currency === 'RWF' ? 0 : 2;

  return `${symbol}${amount.toFixed(decimals)}`;
}

export function convertCurrency(amount, fromCurrency, toCurrency, exchangeRates) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // All rates are relative to USD
  // if from is not USD, first convert to USD
  let amountInUSD = amount;
  if (fromCurrency !== 'USD') {
    amountInUSD = amount / exchangeRates[fromCurrency];
  }

  if (toCurrency === 'USD') {
    return amountInUSD;
  }

  return amountInUSD * exchangeRates[toCurrency];
}

export function getLastNDays(days = 7) {
  const dates = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

export function getDayLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.min((value / total) * 100, 100);
}

