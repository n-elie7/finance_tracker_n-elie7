export function validateRegex(pattern, flags = 'gi') {
  if (!pattern || pattern.trim() === '') {
    return null;
  }

  try {
    return new RegExp(pattern, flags);
  } catch (error) {
    console.error('Invalid regex pattern:', error);
    return null;
  }
}

// this function hightlight matches of regex pattern search
export function highlightMatches(text, regex) {
  if (!text) {
    return '';
  }

  if (!regex) {
    return escapeHtml(text);
  }

  // escape html tags
  const escaped = escapeHtml(text);

  
  // we need to recreate regex with same pattern to avoid state issues
  const pattern = regex.source;
  const flags = regex.flags;
  const safeRegex = new RegExp(pattern, flags);

  // replace matches with <mark> tags
  return escaped.replace(safeRegex, function(match) {
    return `<mark>${match}</mark>`;
  });
}

// this function will help to filter
// out and escape HTML tags to avoid contamination 
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function validatePattern(text, regex) {
  if (!regex) {
    return true; // No pattern = match all
  }

  if (!text) {
    return false;
  }

  return regex.test(text);
}
