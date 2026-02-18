// localstorage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'financeAhaTransactions',
  SETTINGS: 'financeAhaSettings'
};

// load transactions
export function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

// this function is used to save transactions
export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
}

// this function load current saved settings
export function loadSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  return {
    baseCurrency: 'USD',
    exchangeRates: {
      EUR: 0.85,
      RWF: 1460.34
    },
    budgetCap: null,
    categories: ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other']
  };
}

// save current settings
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// clear all settings and transactions
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
