
// validates description input
export function validateDescription(value) {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Description is required' };
  }

  const pattern = /^\S(?:.*\S)?$/;
  
  if (!pattern.test(value)) {
    return { 
      valid: false, 
      error: 'Description cannot have trailing spaces' 
    };
  }

  // Check for double spaces inside
  if (/\s{2,}/.test(value)) {
    return { 
      valid: false, 
      error: 'Description cannot have multiple consecutive spaces' 
    };
  }

  return { valid: true, error: '' };
}

// It validated amount to much format
export function validateAmount(value) {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  
  if (!pattern.test(value)) {
    return { 
      valid: false, 
      error: 'Enter a valid amount. No leading zeros or more than 2 decimals.' 
    };
  }

  const numericValue = parseFloat(value);
  if (numericValue < 0) {
    return { valid: false, error: 'Amount must be positive' };
  }

  if (numericValue > 999999.99) {
    return { valid: false, error: 'Amount is too large (max: 999,999.99)' };
  }

  return { valid: true, error: '' };
}

// it validates date, must not be in future and must be valid not like 31 february
export function validateDate(value) {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Date is required' };
  }

  const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  
  if (!pattern.test(value)) {
    return { 
      valid: false, 
      error: 'Date must be in YYYY-MM-DD format' 
    };
  }

  // check if date is valid for example Feb 31 is not valid
  const dateObj = new Date(value + 'T00:00:00');
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  // check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj > today) {
    return { valid: false, error: 'Date cannot be in the future' };
  }

  return { valid: true, error: '' };
}

// validate category validates rules for category
export function validateCategory(value) {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Category is required' };
  }

  const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  
  if (!pattern.test(value)) {
    return { 
      valid: false, 
      error: 'Category must contain only letters, spaces, and hyphens' 
    };
  }

  return { valid: true, error: '' };
}

// this is advanced regex to check for duplicate words
export function checkDuplicateWords(value) {
  if (!value || value.trim() === '') {
    return { hasDuplicate: false, warning: '' };
  }

  const pattern = /\b(\w+)\s+\1\b/i;
  const match = pattern.exec(value);
  
  if (match) {
    return { 
      hasDuplicate: true, 
      warning: `Duplicate word detected: "${match[1]}"` 
    };
  }

  return { hasDuplicate: false, warning: '' };
}

// this function will check and validate budget validity
export function validateBudget(value) {
  if (!value || value.trim() === '') {
    return { valid: true, error: '' };
  }

  return validateAmount(value);
}
