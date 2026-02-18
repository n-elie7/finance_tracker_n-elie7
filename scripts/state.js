import { loadTransactions, saveTransactions, loadSettings, saveSettings } from './storage.js';

// Application state
let state = {
  transactions: [],
  settings: {},
  editingId: null 
};

// this will load state from localStorage
export function initState() {
  state.transactions = loadTransactions();
  state.settings = loadSettings();
}

// get all transactions
export function getAllTransactions() {
  return [...state.transactions];
}

// get transaction based on its id
export function getTransactionById(id) {
  return state.transactions.find(txn => txn.id === id) || null;
}

// This function helps to add transaction
export function addTransaction(transaction) {
  const now = new Date().toISOString();
  const newTransaction = {
    id: `aha_${Date.now()}`,
    ...transaction,
    createdAt: now,
    updatedAt: now
  };

  state.transactions.push(newTransaction);
  saveTransactions(state.transactions);
  
  return newTransaction;
}

// This helps to update transaction by its ID 
export function updateTransaction(id, updates) {
  const index = state.transactions.findIndex(txn => txn.id === id);
  
  if (index === -1) {
    return null;
  }

  state.transactions[index] = {
    ...state.transactions[index],
    ...updates,
    id: state.transactions[index].id,
    createdAt: state.transactions[index].createdAt,
    updatedAt: new Date().toISOString()
  };

  saveTransactions(state.transactions);
  
  return state.transactions[index];
}

// delete transaction ID
export function deleteTransaction(id) {
  const index = state.transactions.findIndex(txn => txn.id === id);
  
  if (index === -1) {
    return false;
  }

  state.transactions.splice(index, 1);
  saveTransactions(state.transactions);
  
  return true;
}

// get settings
export function getSettings() {
  return { ...state.settings };
}

// update settings
export function updateSettings(updates) {
  state.settings = {
    ...state.settings,
    ...updates
  };
  saveSettings(state.settings);
}

// get all categories
export function getAllCategories() {
  return [...state.settings.categories];
}

export function addCategory(category) {
  if (state.settings.categories.includes(category)) {
    return false;
  }
  
  state.settings.categories.push(category);
  saveSettings(state.settings);
  
  return true;
}

export function removeCategory(category) {
  const index = state.settings.categories.indexOf(category);
  
  if (index === -1) {
    return false;
  }
  
  state.settings.categories.splice(index, 1);
  saveSettings(state.settings);
  
  return true;
}

export function setEditingId(id) {
  state.editingId = id;
}

export function getEditingId() {
  return state.editingId;
}

// clear all transactions
export function clearAllTransactions() {
  state.transactions = [];
  saveTransactions(state.transactions);
}

// import transaction data
export function importTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    return false;
  }
  
  state.transactions = transactions;
  saveTransactions(state.transactions);
  
  return true;
}
