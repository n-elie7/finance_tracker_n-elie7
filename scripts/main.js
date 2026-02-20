import { 
  initState, 
  addTransaction, 
  updateTransaction, 
  getTransactionById, 
  setEditingId, 
  getAllTransactions, 
  importTransactions, 
  clearAllTransactions, 
  getSettings, 
  updateSettings, 
  getAllCategories, 
  addCategory, 
  removeCategory,
  subscribe
 } from './state.js';
import { validateDescription, validateAmount, validateDate, validateCategory, checkDuplicateWords, validateBudget } from './validators.js';
import { initTransactionList, updateTransactionList, setSort, setSearchRegex } from './ui.js';
import { validateRegex } from './search.js';
import { initDashboard, updateDashboard } from './dashboard.js';
import { formatCurrency, convertCurrency } from './utils.js';

initState();

subscribe(() => {
  updateDashboard();
  updateTransactionList();
});
initTransactionList();

initDashboard();

const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

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

  if (window.innerWidth < 768) {
    closeMobileNav();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

const handleNavigation = () => {
  navTabs.forEach(function (button) {
    button.addEventListener('click', function () {
      switchTab(button.dataset.tab);
    });
  });

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
  if (descError) descError.textContent = '';
  if (amountError) amountError.textContent = '';
  if (dateError) dateError.textContent = '';
  if (categoryError) categoryError.textContent = '';
  
  // reset aria-invalid
  if (descInput) descInput.setAttribute('aria-invalid', 'false');
  if (amountInput) amountInput.setAttribute('aria-invalid', 'false');
  if (dateInput) dateInput.setAttribute('aria-invalid', 'false');
  if (categorySelect) categorySelect.setAttribute('aria-invalid', 'false');
  
  // reset hint text
  const descHint = document.getElementById('desc-hint');
  if (descHint) {
    descHint.textContent = 'No leading or trailing spaces allowed';
    descHint.style.color = '';
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;
  
  // Clear edit ID
  if (editIdInput) editIdInput.value = '';
  setEditingId(null);
  
  // Update form heading
  const formHeading = document.getElementById('form-heading');
  const formSubtitle = document.getElementById('form-subtitle');
  
  if (formHeading) formHeading.textContent = 'Add Transaction';
  if (formSubtitle) formSubtitle.textContent = 'Record a new expense';
  if (submitButton) submitButton.textContent = 'Save Transaction';
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
  const formHeading = document.getElementById('form-heading');
  const formSubtitle = document.getElementById('form-subtitle');
  
  if (formHeading) formHeading.textContent = 'Edit Transaction';
  if (formSubtitle) formSubtitle.textContent = 'Update transaction details';
  if (submitButton) submitButton.textContent = 'Update Transaction';
  
  switchTab('add-transaction');
  
  if (descInput) descInput.focus();
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

// settings central functionality

const categoriesList = document.getElementById('categories-list');
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryButton = document.getElementById('add-category-button');
const newCategoryError = document.getElementById('new-category-error');

function renderCategoriesList() {
  if (!categoriesList) return;

  const categories = getAllCategories();

  // Clear existing
  categoriesList.innerHTML = '';

  categories.forEach(category => {
    const li = document.createElement('li');
    li.className = 'category-item';

    li.innerHTML = `
      <span class="badge" data-category="${category.toLowerCase()}">${escapeHtmlForRender(category)}</span>
      <button 
        class="btn-remove" 
        data-remove-category="${category}"
        aria-label="Remove ${escapeHtmlForRender(category)} category"
      >
        Remove
      </button>
    `;

    categoriesList.appendChild(li);
  });

  // Update category select in form
  updateCategorySelectOptions(categories);
}

// update category
function updateCategorySelectOptions(categories) {
  const categorySelect = document.getElementById('input-category');
  if (!categorySelect) return;

  const currentValue = categorySelect.value;

  categorySelect.innerHTML = '<option value="">Select a category</option>';

  // add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  if (currentValue && categories.includes(currentValue)) {
    categorySelect.value = currentValue;
  }
}


function handleAddCategory() {
  const value = newCategoryInput.value.trim();

  if (newCategoryError) {
    newCategoryError.textContent = '';
    newCategoryInput.setAttribute('aria-invalid', 'false');
  }

  if (!value) {
    return;
  }

  // validate category
  const validation = validateCategory(value);
  if (!validation.valid) {
    if (newCategoryError) {
      newCategoryError.textContent = validation.error;
      newCategoryInput.setAttribute('aria-invalid', 'true');
    }
    return;
  }

  // ddd category
  const added = addCategory(value);

  if (!added) {
    if (newCategoryError) {
      newCategoryError.textContent = 'Category already exists';
      newCategoryInput.setAttribute('aria-invalid', 'true');
    }
    return;
  }

  // clear input
  newCategoryInput.value = '';

  renderCategoriesList();

  showNotification(`Category "${value}" added successfully`);
}

function handleRemoveCategory(category) {
  // check if category is in use
  const transactions = getAllTransactions();
  const inUse = transactions.some(transaction => transaction.category === category);

  if (inUse) {
    const count = transactions.filter(transaction => transaction.category === category).length;
    const confirmMsg = `This category is used by ${count} transaction(s). 
    If you remove it, those transactions will keep their current category, but you won't be able to select this category for new transactions. Remove anyway?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }
  }

  // Remove category
  const removed = removeCategory(category);

  if (removed) {
    renderCategoriesList();
    showNotification(`Category "${category}" removed`);
  }
}

if (addCategoryButton) {
  addCategoryButton.addEventListener('click', handleAddCategory);
}

if (newCategoryInput) {
  newCategoryInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  });
}

// Event for remove buttons
if (categoriesList) {
  categoriesList.addEventListener('click', function(e) {
    const removeBtn = e.target.closest('[data-remove-category]');
    if (removeBtn) {
      const category = removeBtn.dataset.removeCategory;
      handleRemoveCategory(category);
    }
  });
}

document.querySelectorAll('[data-tab="settings"]').forEach(btn => {
  btn.addEventListener('click', renderCategoriesList);
});

// escape html
function escapeHtmlForRender(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


// currency section

const baseCurrencySelect = document.getElementById('base-currency');
const rateEurInput = document.getElementById('rate-eur');
const rateRwfInput = document.getElementById('rate-rwf');
const saveCurrencyButton = document.getElementById('save-currency-button');
const budgetCapInput = document.getElementById('budget-cap-input');
const saveBudgetButton = document.getElementById('save-budget-button');
const budgetCapError = document.getElementById('budget-cap-error');

// load settings
function loadSettingsIntoForm() {
  const settings = getSettings();

  if (baseCurrencySelect) {
    baseCurrencySelect.value = settings.baseCurrency;
  }

  if (rateEurInput && settings.exchangeRates.EUR) {
    rateEurInput.value = settings.exchangeRates.EUR;
  }

  if (rateRwfInput && settings.exchangeRates.RWF) {
    rateRwfInput.value = settings.exchangeRates.RWF;
  }

  if (budgetCapInput && settings.budgetCap) {
    budgetCapInput.value = settings.budgetCap.toFixed(2);
  }

  // Update currency symbols throughout UI
  updateCurrencySymbols(settings.baseCurrency);
}

// update symbol of currency
function updateCurrencySymbols(currency) {
  const symbols = {
    USD: '$',
    EUR: '€',
    RWF: 'FRW'
  };

  const symbol = symbols[currency] || '$';

  const amountSymbol = document.getElementById('amount-currency-symbol');
  if (amountSymbol) {
    amountSymbol.textContent = symbol;
  }

  // Update budget cap symbol
  const budgetSymbol = document.getElementById('budget-symbol');
  if (budgetSymbol) {
    budgetSymbol.textContent = symbol;
  }
}


function saveCurrencySettings() {
  const settings = getSettings();
  const baseCurrency = baseCurrencySelect.value;
  const oldCurrency = settings.baseCurrency;
  const newCurrency = baseCurrencySelect.value;

  const eurRate = parseFloat(rateEurInput.value);
  const rwfRate = parseFloat(rateRwfInput.value);

  // Validate rates
  if (isNaN(eurRate) || eurRate <= 0) {
    showNotification('Invalid EUR exchange rate', true);
    return;
  }

  if (isNaN(rwfRate) || rwfRate <= 0) {
    showNotification('Invalid RWF exchange rate', true);
    return;
  }

  const newRates = { EUR: eurRate, RWF: rwfRate };
  let newBudgetCap = settings.budgetCap;

  if (oldCurrency !== newCurrency) {
    if (newBudgetCap !== null) {
      newBudgetCap = convertCurrency(newBudgetCap, oldCurrency, newCurrency, newRates);
    }

    const transactions = getAllTransactions();
    if (transactions.length > 0) {
      const migratedTransactions = transactions.map(transaction => ({
        ...transaction,
        amount: convertCurrency(transaction.amount, oldCurrency, newCurrency, newRates),
        updatedAt: new Date().toISOString()
      }));
      importTransactions(migratedTransactions);
    }
  }

  // Update settings
  updateSettings({
    baseCurrency: newCurrency,
    exchangeRates: newRates,
    budgetCap: newBudgetCap
  });

  loadSettingsIntoForm();
  updateCurrencySymbols(newCurrency);
  updateDashboard();
  updateTransactionList();

  showNotification('Currency settings saved successfully');
}

function saveBudgetCap() {
  const value = budgetCapInput.value.trim();

  if (budgetCapError) {
    budgetCapError.textContent = '';
    budgetCapInput.setAttribute('aria-invalid', 'false');
  }

  // validation
  const validation = validateBudget(value);
  if (!validation.valid) {
    if (budgetCapError) {
      budgetCapError.textContent = validation.error;
      budgetCapInput.setAttribute('aria-invalid', 'true');
    }
    return;
  }

  // Empty value = no budget
  const budgetCap = value === '' ? null : parseFloat(value);

  // Update settings
  updateSettings({ budgetCap });

  updateDashboard();

  if (budgetCap === null) {
    showNotification('Budget removed');
  } else {
    const settings = getSettings();
    const formatted = formatCurrency(budgetCap, settings.baseCurrency);
    showNotification(`Budget set to ${formatted}`);
  }
}

if (saveCurrencyButton) {
  saveCurrencyButton.addEventListener('click', saveCurrencySettings);
}

if (saveBudgetButton) {
  saveBudgetButton.addEventListener('click', saveBudgetCap);
}

// load settings
document.querySelectorAll('[data-tab="settings"]').forEach(button => {
  button.addEventListener('click', loadSettingsIntoForm);
});


// import and export section

const exportButton = document.getElementById('export-button');
const importFileInput = document.getElementById('import-file-input');
const clearDataButton = document.getElementById('clear-data-button');

// export transaction by simulating creating downloadable file content
function exportTransactions() {
  const transactions = getAllTransactions();
  const dataStr = JSON.stringify(transactions, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `financeahaTransactions-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showNotification('Transactions exported successfully');
}

function handleImportTransactions(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // check if it's an array
      if (!Array.isArray(data)) {
        showNotification('Invalid file: Expected an array of transactions', true);
        return;
      }

      // check transaction structure
      const isValid = data.every(transaction => {
        return transaction.id && transaction.description && 
               typeof transaction.amount === 'number' && 
               transaction.category && transaction.date &&
               transaction.createdAt && transaction.updatedAt;
      });

      if (!isValid) {
        showNotification('Invalid file: Transactions missing required fields', true);
        return;
      }

      // import from state management
      importTransactions(data);
      
      updateTransactionList();
      updateDashboard();
      showNotification(`Successfully imported ${data.length} transactions`);
      
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Error reading file: ' + error.message, true);
    }
  };

  reader.onerror = function() {
    showNotification('Error reading file', true);
  };

  reader.readAsText(file);
}

function handleClearAllData() {
  const confirmFirst = confirm('Are you sure you want to delete ALL transactions? This cannot be undone.');
  if (!confirmFirst) return;

  const confirmSecond = confirm('This will permanently delete all your data. Are you absolutely sure?');
  if (!confirmSecond) return;

  clearAllTransactions();
  
  updateTransactionList();
  updateDashboard();
  showNotification('All transactions deleted', true);
}

if (exportButton) {
  exportButton.addEventListener('click', exportTransactions);
}

if (importFileInput) {
  importFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      handleImportTransactions(file);
    }
    e.target.value = '';
  });
}

if (clearDataButton) {
  clearDataButton.addEventListener('click', handleClearAllData);
}

function init() {
  const mainNav = document.getElementById('main-nav');
  if (window.innerWidth < 768) {
    mainNav.setAttribute('hidden', '');
  } else {
    mainNav.removeAttribute('hidden');
  }
  loadSettingsIntoForm();
  renderCategoriesList();
}

init();
