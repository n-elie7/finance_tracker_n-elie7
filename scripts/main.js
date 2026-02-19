import { initState, addTransaction, updateTransaction, getTransactionById, setEditingId, getEditingId, getTransactions, importTransactions, clearTransactions, getSettings, updateSettings, getCategories, addCategory, removeCategory } from './state.js';
import { validateDescription, validateAmount, validateDate, validateCategory, checkDuplicateWords, validateBudgetCap } from './validators.js';
import { initTransactionList, updateTransactionList, setSort, setSearchRegex } from './ui.js';
import { validateRegex } from './search.js';
import { initDashboard, updateDashboard } from './dashboard.js';
import { formatCurrency } from './utils.js';


const handleNavigation = () => {
  'use strict';

  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(tabId) {
    navTabs.forEach(function (button) {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    tabPanels.forEach(function (panel) {
      if (panel.id === tabId) {
        panel.removeAttribute('hidden');
        const heading = panel.querySelector('h1');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: false });
          heading.addEventListener('blur', function handler() {
            heading.removeAttribute('tabindex');
            heading.removeEventListener('blur', handler);
          });
        }
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    closeMobileNav();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navTabs.forEach(function (button) {
    button.addEventListener('click', function () {
      switchTab(button.dataset.tab);
    });
  });


  const menuToggle = document.getElementById('menu-toggle');
  const mainNav    = document.getElementById('main-nav');

  function openMobileNav() {
    mainNav.removeAttribute('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeMobileNav() {
    mainNav.setAttribute('hidden', '');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  function toggleMobileNav() {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileNav);
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      mainNav.removeAttribute('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    } else {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') {
        mainNav.setAttribute('hidden', '');
      }
    }
  });

  document.addEventListener('click', function (e) {
    const isNavClick = mainNav.contains(e.target);
    const isToggleClick = menuToggle.contains(e.target);
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    if (!isNavClick && !isToggleClick && isOpen) {
      closeMobileNav();
    }
  });

  // Close nav on Escape key press
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileNav();
        menuToggle.focus();
      }

      const modal = document.getElementById('delete-modal');
      if (modal && !modal.hidden) {
        closeModal();
      }
    }
  });

  document.addEventListener('click', function (e) {
    const navTarget = e.target.closest('[data-nav]');
    if (navTarget) {
      switchTab(navTarget.dataset.nav);
    }

    if (e.target.id === 'go-add-button') {
      switchTab('add-transaction');
    }
  });

  const dateInput = document.getElementById('input-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.setAttribute('max', today); 
  }

  const cancelButton = document.getElementById('cancel-button');
  if (cancelButton) {
    cancelButton.addEventListener('click', function () {
      switchTab('transactions');
    });
  }


  const deleteModal = document.getElementById('delete-modal');
  const cancelDeleteButton = document.getElementById('cancel-delete-button');

  function openModal() {
    if (!deleteModal) return;
    deleteModal.removeAttribute('hidden');
    const firstButton = deleteModal.querySelector('button');
    if (firstButton) firstButton.focus();
  }

  function closeModal() {
    if (!deleteModal) return;
    deleteModal.setAttribute('hidden', '');
  }

  if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener('click', closeModal);
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', function (e) {
      if (e.target === deleteModal) {
        closeModal();
      }
    });
  }

  function init() {
    if (window.innerWidth < 768) {
      mainNav.setAttribute('hidden', '');
    } else {
      mainNav.removeAttribute('hidden');
    }
  }

  init();
};

handleNavigation();

// central point for searching and sorting
const searchInput = document.getElementById('search-input');
const caseToggle = document.getElementById('case-toggle');
const sortSelect = document.getElementById('sort-select');
const searchError = document.getElementById('search-error');

function handleSearch() {
  const pattern = searchInput.value.trim();
  
  searchError.textContent = '';
  searchError.setAttribute('hidden', '');

  if (!pattern) {
    setSearchRegex(null);
    return;
  }

  // case sensitivity flag
  const flags = caseToggle.checked ? 'gi' : 'g';

  const regex = validateRegex(pattern, flags);

  if (regex) {
    setSearchRegex(regex);
  } else {
    // invalid regex
    searchError.textContent = `Invalid regex pattern. Please check your syntax.`;
    searchError.removeAttribute('hidden');
    setSearchRegex(null);
  }
}

function handleSortChange() {
  const sortValue = sortSelect.value;
  setSort(sortValue);
}

let searchTimeout;
if (searchInput) {
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 300);
  });
}

// toggle case
if (caseToggle) {
  caseToggle.addEventListener('change', handleSearch);
}

if (sortSelect) {
  sortSelect.addEventListener('change', handleSortChange);
}


/* Form functionlity */

const transactionForm = document.getElementById('transaction-form');
const descInput = document.getElementById('input-description');
const amountInput = document.getElementById('input-amount');
const dateInput = document.getElementById('input-date');
const categorySelect = document.getElementById('input-category');
const submitButton = document.getElementById('submit-button');
const editIdInput = document.getElementById('edit-id');

// error messages elements
const descError = document.getElementById('desc-error');
const amountError = document.getElementById('amount-error');
const dateError = document.getElementById('date-error');
const categoryError = document.getElementById('category-error');

function validateField(input, validator, errorElement) {
  const result = validator(input.value);
  
  if (result.valid) {
    input.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
    return true;
  } else {
    input.setAttribute('aria-invalid', 'true');
    errorElement.textContent = result.error;
    return false;
  }
}

function checkDescriptionWarning() {
  const result = checkDuplicateWords(descInput.value);
  const descHint = document.getElementById('desc-hint');
  
  if (result.hasDuplicate) {
    descHint.textContent = result.warning;
    descHint.style.color = 'var(--clr-warning)';
  } else {
    descHint.textContent = 'No trailing spaces allowed';
    descHint.style.color = '';
  }
}

// validation of form
function validateForm() {
  const descValid = validateField(descInput, validateDescription, descError);
  const amountValid = validateField(amountInput, validateAmount, amountError);
  const dateValid = validateField(dateInput, validateDate, dateError);
  const categoryValid = validateField(categorySelect, validateCategory, categoryError);

  return descValid && amountValid && dateValid && categoryValid;
}

if (descInput) {
  descInput.addEventListener('blur', function () {
    validateField(descInput, validateDescription, descError);
    checkDescriptionWarning();
  });
  
  let duplicateCheckTimer;
  descInput.addEventListener('input', function () {
    clearTimeout(duplicateCheckTimer);
    duplicateCheckTimer = setTimeout(checkDescriptionWarning, 500);
  });
}

if (amountInput) {
  amountInput.addEventListener('blur', function () {
    validateField(amountInput, validateAmount, amountError);
  });
}

if (dateInput) {
  dateInput.addEventListener('blur', function () {
    validateField(dateInput, validateDate, dateError);
  });
}

if (categorySelect) {
  categorySelect.addEventListener('blur', function () {
    validateField(categorySelect, validateCategory, categoryError);
  });
}

if (transactionForm) {
  transactionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // validate all fields
    if (!validateForm()) {
      if (descInput.getAttribute('aria-invalid') === 'true') {
        descInput.focus();
      } else if (amountInput.getAttribute('aria-invalid') === 'true') {
        amountInput.focus();
      } else if (dateInput.getAttribute('aria-invalid') === 'true') {
        dateInput.focus();
      } else if (categorySelect.getAttribute('aria-invalid') === 'true') {
        categorySelect.focus();
      }
      return;
    }

    const transactionData = {
      description: descInput.value.trim(),
      amount: parseFloat(amountInput.value),
      category: categorySelect.value,
      date: dateInput.value
    };

    // check if editing or adding
    const editId = editIdInput.value;
    
    if (editId) {
      // Update existing transaction
      const updated = updateTransaction(editId, transactionData);
      if (updated) {
        showNotification('Transaction updated successfully');
        resetForm();
        switchTab('transactions');
        updateTransactionList();
        updateDashboard();
      } else {
        showNotification('Error: Transaction not found', true);
      }
    } else {
      // Add new transaction
      const newTransaction = addTransaction(transactionData);
      showNotification('Transaction added successfully');
      resetForm();
      switchTab('transactions');
      updateTransactionList();
      updateDashboard();
    }
  });
}

function resetForm() {
  if (!transactionForm) return;
  
  transactionForm.reset();
  
  // clear all error messages
  descError.textContent = '';
  amountError.textContent = '';
  dateError.textContent = '';
  categoryError.textContent = '';
  
  // reset aria-invalid
  descInput.setAttribute('aria-invalid', 'false');
  amountInput.setAttribute('aria-invalid', 'false');
  dateInput.setAttribute('aria-invalid', 'false');
  categorySelect.setAttribute('aria-invalid', 'false');
  
  // reset hint text
  const descHint = document.getElementById('desc-hint');
  descHint.textContent = 'No leading or trailing spaces allowed';
  descHint.style.color = '';
  
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  
  // Clear edit ID
  editIdInput.value = '';
  setEditingId(null);
  
  // Update form heading
  document.getElementById('form-heading').textContent = 'Add Transaction';
  document.getElementById('form-subtitle').textContent = 'Record a new expense';
  submitButton.textContent = 'Save Transaction';
}

function populateFormForEdit(id) {
  const transaction = getTransactionById(id);
  if (!transaction) return;

  descInput.value = transaction.description;
  amountInput.value = transaction.amount.toFixed(2);
  dateInput.value = transaction.date;
  categorySelect.value = transaction.category;
  editIdInput.value = id;
  
  setEditingId(id);
  
  // Update form heading
  document.getElementById('form-heading').textContent = 'Edit Transaction';
  document.getElementById('form-subtitle').textContent = 'Update transaction details';
  submitButton.textContent = 'Update Transaction';
  
  switchTab('add-transaction');
  descInput.focus();
}

window.editTransaction = populateFormForEdit;

function showNotification(message, isError = false) {
  const region = isError 
    ? document.getElementById('alert-region')
    : document.getElementById('notification-region');
  
  if (!region) return;
  
  region.textContent = message;
  
  // Clear after 5 seconds
  setTimeout(function () {
    region.textContent = '';
  }, 5000);
}

