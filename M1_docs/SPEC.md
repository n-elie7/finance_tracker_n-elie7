# M1 - Specification & Wireframes
**Student Finance Tracker** called **FinanceAha**

## Project Overview
FinanceAha is a fully accessible, responsive web application for tracking student finances. Built with pure HTML, CSS, and JavaScript to help students manage their budgets, categorize expenses, and analyze spending patterns.

---

## Data Model

### Transaction Record
```javascript
{
  id: String,              // Format: "aha_" + timestamp (e.g., "aha_1727640000000")
  description: String,     // Transaction description
  amount: Number,          // Currency amount with up to 2 decimal places
  category: String,        // predefined categories
  date: String,           // ISO date format: "YYYY-MM-DD"
  createdAt: String,      // ISO timestamp: "2025-09-29T14:30:00.000Z"
  updatedAt: String       // ISO timestamp, changes on edit
}
```

**Example:**
```javascript
{
  "id": "aha_1727640000000",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2026-02-10",
  "createdAt": "2026-02-10T14:30:00.000Z",
  "updatedAt": "2026-02-10T14:30:00.000Z"
}
```

### Settings Configuration
```javascript
{
  baseCurrency: String,           // Default: "USD"
  exchangeRates: {
    [currency]: Number            // Manual exchange rates
  },
  budgetCap: Number,             // Monthly budget limit
  categories: Array<String>      // Editable list of categories
}
```

**Example:**
```javascript
{
  "baseCurrency": "USD",
  "exchangeRates": {
    "EUR": 0.85,
    "RWF": 1454
  },
  "budgetCap": 500.00,
  "categories": ["Food", "Books", "Transport", "Entertainment", "Fees", "Other"]
}
```

### LocalStorage Keys
- `financeTracker:transactions` - Array of all transaction records
- `financeTracker:settings` - Settings configuration object
- `financeTracker:appState` - UI state (current view, filters, sort order)

---

## Features Specification

### 1. Pages/Sections

#### a) About Page (`#about`)
- **Purpose**: Project description and student information
- **Content**:
  - App purpose and feature overview
  - Student name
  - Contact: GitHub profile link, email

#### b) Dashboard (`#dashboard`)
- **Statistics Display**:
  - Total number of transactions
  - Total amount spent (in base currency)
  - Budget remaining (with visual indicator)
  - Top spending category (by total amount)
  - Last 7 days spending trend
  
- **Visual Elements**:
  - Stat cards (grid layout, responsive)
  - Simple bar chart for 7-day trend (CSS-based)
  - Progress bar for budget cap
  - ARIA live region for budget alerts

- **Currency Display**:
  - Show amounts in base currency
  - Toggle to view in EUR or RWF (using manual exchange rates)

#### c) Transactions List (`#transactions`)
- **Display Modes**:
  - Stacked cards (one per transaction)
  
- **Features**:
  - Regex search input with case-insensitive toggle
  - Sort controls (date, description, amount)
  - Inline edit button per row
  - Delete button with confirmation modal
  - Highlight search matches using `<mark>`
  - Empty state message when no results
  
- **Fields**:
  - Description (with search highlighting)
  - Amount (formatted currency)
  - Category (badge/pill styling)
  - Date (formatted: MMM DD, YYYY)
  - Actions (edit, delete buttons)

#### d) Add/Edit Form (`#add-transaction`)
- **Form Fields**:
  1. Description (text input, required)
  2. Amount (number input, required, step="0.01")
  3. Category (select dropdown, required)
  4. Date (date input, required, default to today)
  
- **Form States**:
  - Add mode: Empty form, "Add Transaction" heading
  - Edit mode: Pre-filled form, "Edit Transaction" heading
  
- **Validation**:
  - Real-time validation on blur
  - Display errors below each field
  - Disable submit until all valid
  - Success message on save (ARIA live)

#### e) Settings (`#settings`)
- **Currency Settings**:
  - Base currency selector (USD, EUR, RWF)
  - Manual exchange rate inputs (2 other currencies)
  - Preview of converted amounts
  
- **Budget Settings**:
  - Monthly budget cap input
  - Save/reset buttons
  
- **Category Management**:
  - List of current categories (editable)
  - Add new category input
  - Remove category button (with warning if in use)
  
- **Data Management**:
  - Import JSON file (with validation)
  - Export JSON button (downloads file)
  - Clear all data (with double confirmation)

---

## Validation Rules (Regex)

### 1. Description Validation
**Pattern:** `/^\S(?:.*\S)?$/`
- **Purpose**: No leading/trailing whitespace, no empty strings
- **Valid**: `"Lunch at cafeteria"`, `"Coffee"`, `"A"`
- **Invalid**: `" Leading space"`, `"Trailing "`, `"  "`, `""`

### 2. Amount Validation
**Pattern:** `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
- **Purpose**: Valid currency format (up to 2 decimals)
- **Valid**: `"0"`, `"12"`, `"12.5"`, `"12.50"`, `"999.99"`
- **Invalid**: `"12.345"`, `"-5"`, `"$12"`, `"12."`, `"01"`

### 3. Date Validation
**Pattern:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
- **Purpose**: Enforce YYYY-MM-DD format
- **Valid**: `"2025-09-29"`, `"2025-01-01"`, `"2025-12-31"`
- **Invalid**: `"25-09-29"`, `"2025-9-29"`, `"2025-13-01"`, `"2025-09-32"`

### 4. Category Validation
**Pattern:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
- **Purpose**: Letters, spaces, hyphens only; no trailing/leading spaces
- **Valid**: `"Food"`, `"Fast Food"`, `"Health-Wellness"`
- **Invalid**: `"Food123"`, `" Food"`, `"Food "`, `"Fast  Food"` (double space)

### 5. Advanced: Duplicate Word Detection (for description warnings)
**Pattern:** `/\b(\w+)\s+\1\b/i`
- **Purpose**: Catch accidentally repeated words (using back-reference)
- **Examples**: 
  - Matches: `"the the"`, `"paid paid invoice"`
  - Warning, not error (user can override)

### 6. Search Patterns (user-entered)

**Cents Detection:**
**Pattern:** `/\.\d{2}\b/`
- Finds transactions with cents (e.g., `"12.50"`, `"0.99"`)

**Beverage Keywords:**
**Pattern:** `/(coffee|tea|juice|soda)/i`
- Case-insensitive search for common beverages

**Amount Range (advanced):**
**Pattern:** `/\b([5-9]\d|[1-9]\d{2,})\.\d{2}\b/`
- Finds amounts $50+ with cents (uses alternation & quantifiers)

---

## Accessibility Plan

### Semantic Structure
- **Landmarks**: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- **Headings**: Logical hierarchy (h1 → h2 → h3), no skipped levels
- **Lists**: Use `<ul>`, `<ol>` for navigation and categories

### Keyboard Navigation
| Action | Key(s) | Implementation |
|--------|--------|----------------|
| Navigate focusable elements | `Tab` / `Shift+Tab` | Native HTML focus order |
| Activate buttons/links | `Enter` / `Space` | Native behavior |
| Close modals | `Escape` | Event listener on modal |
| Skip to main content | Focus on skip link → `Enter` | Custom skip link |

**Focus Management:**
- Visible focus indicator (2px solid outline, high contrast)
- Focus trap in modals (focus loops within modal, returns on close)
- Skip-to-content link (visible on focus)
- Logical tab order (no `tabindex > 0`)

### ARIA Implementation

**Live Regions:**
```html
<!-- Budget alert (changes based on threshold) -->
<div role="status" aria-live="polite" aria-atomic="true" id="budget-status">
  <!-- "You have $50.00 remaining in your budget" -->
</div>

<!-- When over budget -->
<div role="alert" aria-live="assertive" aria-atomic="true" id="budget-alert">
  <!-- "Warning: You have exceeded your budget by $25.00" -->
</div>

<!-- Form validation messages -->
<span role="status" aria-live="polite" id="description-error">
  <!-- "Error: Description cannot have leading or trailing spaces" -->
</span>

<!-- Success/error notifications -->
<div role="status" aria-live="polite" class="notification">
  <!-- "Transaction saved successfully" -->
</div>
```

**Labels & Descriptions:**
- Every `<input>` paired with `<label for="id">`
- Complex inputs use `aria-describedby` for hints
- Form errors linked via `aria-describedby`
- Buttons have descriptive text or `aria-label`

**Example:**
```html
<label for="amount">Amount ($)</label>
<input 
  type="number" 
  id="amount" 
  name="amount"
  aria-describedby="amount-hint amount-error"
  aria-invalid="false"
  required
>
<span id="amount-hint">Enter amount in dollars (e.g., 12.50)</span>
<span id="amount-error" role="status"></span>
```

### Color & Contrast
- **Text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast
- **Interactive elements**: 3:1 contrast for boundaries
- **color indicators**: text
  - Success: Green
  - Error: Red
  - Warning: Yellow

### Focus Indicators
```css
:focus-visible {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

/* High contrast for links */
a:focus-visible {
  outline: 3px solid #000;
  background: #FFEB3B;
  color: #000;
}
```

### Screen Reader Considerations
- Decorative images: `alt=""`
- Informative images: Descriptive alt text
- Icon-only buttons: `aria-label`
- Loading states: `aria-busy="true"`
- Hidden content: `aria-hidden="true"` (visual only)
- Dynamic content: ARIA live regions

---

## Responsive Breakpoints

### Mobile First Approach
Base styles for 360px+ (small mobile)

**Breakpoint 1: 480px (Large Mobile)**
- Slightly larger touch targets
- Two-column stat grid

**Breakpoint 2: 768px (Tablet)**
- Horizontal navigation (no hamburger)
- Table view for transactions (no cards)
- Three-column stat grid
- Inline form layout (two columns)

**Breakpoint 3: 1024px (Desktop)**
- Four-column stat grid
- Wider content max-width (1200px)
- Enhanced spacing and typography
- Sidebar layout option for dashboard

### Layout Strategy
```css
/* Mobile: Stacked cards */
.transaction-card { display: block; }

/* Tablet+: Table view */
@media (min-width: 768px) {
  .transaction-card { display: none; }
  .transaction-table { display: table; }
}
```

---

## Animations & Transitions

### Micro-interactions
1. **Button Hover/Focus** (150ms ease)
   ```css
   button {
     transition: background-color 150ms ease, transform 100ms ease;
   }
   button:hover {
     transform: translateY(-2px);
   }
   ```

2. **Form Validation** (200ms ease)
   - Input border color change
   - Error message slide-in

3. **Page Transitions** (300ms ease)
   - Fade in new section
   - Slide up content

4. **Budget Progress Bar** (500ms ease)
   - Smooth width transition on data change

### Accessibility Considerations
- Respect `prefers-reduced-motion`
- Animations under 5 seconds (WCAG)
- No parallax or motion that could trigger vestibular disorders

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Technology Stack
- **HTML5**: Semantic elements, form validation
- **CSS3**: Flexbox, Grid, custom properties, media queries
- **JavaScript (ES6+)**: Modules, localStorage, Regex, DOM manipulation

---

## File Structure (Planned)
```
student-finance-tracker/
├── index.html
├── README.md
├── seed.json
├── tests.html
├── styles/
│   ├── main.css          (variables, reset, base)
│   ├── layout.css        (flexbox, grid, responsive)
│   ├── components.css    (buttons, cards, forms)
│   └── animations.css    (transitions, keyframes)
├── scripts/
│   ├── main.js           (app initialization)
│   ├── state.js          (data management)
│   ├── storage.js        (localStorage helpers)
│   ├── ui.js             (DOM rendering)
│   ├── validators.js     (regex validation)
│   ├── search.js         (regex search & highlighting)
│   └── utils.js          (date formatting, currency, etc.)
└── M1_docs/
    └── assets/
        └── desktop/       (Desktop sketches)
        └── mobile/        (Mobile sketches)
        └── tablet/        (Tablet sketches)
```

---

## Testing Strategy

### Unit Tests (tests.html)
1. **Validation Functions**
   - Test each regex with valid/invalid inputs
   - Edge cases (empty, special chars, boundary values)

2. **Data Operations**
   - Create, update, delete transactions
   - Calculate stats correctly
   - Sort and filter logic

3. **Search/Highlighting**
   - Safe regex compilation
   - Match highlighting without breaking HTML
   - Case-insensitive toggle

### Manual Testing
- Keyboard-only navigation
- Screen reader testing
- Mobile device testing (real device or emulator)
- Cross-browser (Chrome, Firefox, Safari, Edge)
- Color contrast validation (WebAIM)
