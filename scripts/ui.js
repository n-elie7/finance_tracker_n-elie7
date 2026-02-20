import { getAllTransactions, deleteTransaction, getSettings } from './state.js';
import { highlightMatches, validatePattern, escapeHtml } from './search.js';

// Current sort and filter state
let currentSort = 'date-desc';
let currentSearchRegex = null;

// display transactions card to the DOM
export function renderTransactions(transactions = null, searchRegex = null) {
  const listContainer = document.getElementById('transactions-list');
  const emptyState = document.getElementById('empty-state');

  if (!listContainer) return;

  const transactionsArray = transactions || getAllTransactions();

  // clear existing content
  const existingCards = listContainer.querySelectorAll('.transaction-card');
  existingCards.forEach(card => card.remove());

  // show or hide empty state if certain condition is met
  if (transactionsArray.length === 0) {
    emptyState.removeAttribute('hidden');
    return;
  } else {
    emptyState.setAttribute('hidden', '');
  }

  // create and append transaction cards
  transactionsArray.forEach(transaction => {
    const card = createTransactionCard(transaction, searchRegex);
    listContainer.appendChild(card);
  });
}

// create a transaction card dynamically
function createTransactionCard(transaction, searchRegex = null) {
  const card = document.createElement('article');
  card.className = 'transaction-card';
  card.setAttribute('data-id', transaction.id);

  // Format date
  const dateObj = new Date(transaction.date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Highlight description if search regex provided
  const description = searchRegex
    ? highlightMatches(transaction.description, searchRegex)
    : escapeHtml(transaction.description);

  // Format amount
  const settings = getSettings();
  const formattedAmount = formatCurrency(transaction.amount, settings.baseCurrency);

  card.innerHTML = `
    <div class="transaction-card-header">
      <p class="transaction-description">${description}</p>
      <span class="badge" data-category="${transaction.category.toLowerCase()}">${escapeHtml(transaction.category)}</span>
    </div>
    <div class="transaction-card-footer">
      <span class="transaction-amount mono">${formattedAmount}</span>
      <time class="transaction-date" datetime="${transaction.date}">${formattedDate}</time>
      <div class="transaction-actions">
        <button 
          class="btn-action" 
          data-edit-id="${transaction.id}"
          aria-label="Edit ${escapeHtml(transaction.description)}"
        >
          Edit
        </button>
        <button 
          class="btn-action btn-action-danger" 
          data-delete-id="${transaction.id}"
          aria-label="Delete ${escapeHtml(transaction.description)}"
        >
          Delete
        </button>
      </div>
    </div>
  `;

  return card;
}

// change currency symbols based on selected currency in settings
function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    RWF: 'FRW'
  };

  const symbol = symbols[currency] || '$';
  const decimals = currency === 'RWF' ? 0 : 2;

  return `${symbol} ${amount.toFixed(decimals)}`;
}

// sorting functionality based on selected option
export function sortTransactions(transactions, sortBy) {
  const sorted = [...transactions];

  switch (sortBy) {
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      sorted.sort((a, b) => a.amount - b.amount);
      break;
    case 'desc-asc':
      sorted.sort((a, b) => a.description.localeCompare(b.description));
      break;
    case 'desc-desc':
      sorted.sort((a, b) => b.description.localeCompare(a.description));
      break;
    default:
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return sorted;
}

// filter based on regex pattern matches
export function filterTransactions(transactions, regex) {
  if (!regex) {
    return transactions;
  }

  return transactions.filter(transaction => {
    const searchText = `${transaction.description} ${transaction.category} ${transaction.amount}`;
    return validatePattern(searchText, regex);
  });
}

// update transaction list
export function updateTransactionList() {
  let transactions = getAllTransactions();

  transactions = filterTransactions(transactions, currentSearchRegex);

  transactions = sortTransactions(transactions, currentSort);

  renderTransactions(transactions, currentSearchRegex);

  // Update count display
  updateTransactionCount(transactions.length, getAllTransactions().length);
}

// Update transaction count display
function updateTransactionCount(shown, total) {
  if (shown < total) {
    announceToScreenReader(`Showing ${shown} of ${total} transactions`);
  }
}

export function setSort(sortBy) {
  currentSort = sortBy;
  updateTransactionList();
}

export function setSearchRegex(regex) {
  currentSearchRegex = regex;
  updateTransactionList();
}

export function getSearchRegex() {
  return currentSearchRegex;
}

// delete tansaction by its ID
export function handleDelete(id) {
  const transaction = getAllTransactions().find(transaction => transaction.id === id);
  if (!transaction) return;

  // ask for delete confirmation
  const modal = document.getElementById('delete-modal');
  const modalDesc = document.getElementById('modal-desc');
  const confirmButton = document.getElementById('confirm-delete-button');

  if (!modal || !confirmButton) return;

  modalDesc.textContent = `Are you sure you want to delete "${transaction.description}"? This cannot be undone.`;

  // remove old event listeners by cloning
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  // add new event listener
  newConfirmButton.addEventListener('click', function() {
    const success = deleteTransaction(id);
    if (success) {
      announceToScreenReader('Transaction deleted successfully', true);
      updateTransactionList();
      // TODO update dashboard stats after deletion
    }
    closeDeleteModal();
  });

  // Show modal
  modal.removeAttribute('hidden');
  newConfirmButton.focus();
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.setAttribute('hidden', '');
  }
}

// announce message to scrren readers
function announceToScreenReader(message, assertive = false) {
  const regionId = assertive ? 'alert-region' : 'notification-region';
  const region = document.getElementById(regionId);

  if (!region) return;

  region.textContent = message;

  // Clear after 5 seconds
  setTimeout(() => {
    region.textContent = '';
  }, 5000);
}


export function initTransactionList() {
  const listContainer = document.getElementById('transactions-list');

  if (listContainer) {
    listContainer.addEventListener('click', function(e) {
      // edit button clicked
      const editButton = e.target.closest('[data-edit-id]');
      if (editButton) {
        const id = editButton.dataset.editId;
        if (window.editTransaction) {
          window.editTransaction(id);
        }
        return;
      }

      // Delete button clicked
      const deleteButton = e.target.closest('[data-delete-id]');
      if (deleteButton) {
        const id = deleteButton.dataset.deleteId;
        handleDelete(id);
        return;
      }
    });
  }

  updateTransactionList();
}
