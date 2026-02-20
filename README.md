# FinanceAha - Student Finance Tracker

A responsive web application for managing personal finances. Built with vanilla HTML, CSS, and JavaScript to help students track expenses, manage budgets, and analyze spending patterns.

## Project Overview

FinanceAha is a client-side finance tracker that allows users to record transactions, categorize expenses, and monitor spending against a monthly budget. The application uses regular expressions for form validation and search functionality, implements WCAG 2.1 AA accessibility standards, and stores all data locally using the browser's localStorage API.

## Live Application

**GitHub Repository:** https://github.com/n-elie7/finance_tracker_n-elie7.git

**Live URL:** https://n-elie7.github.io/finance_tracker_n-elie7/

**Project Video:**  

[![Watch the video](https://img.youtube.com/vi/3hSqWMNTVYI/maxresdefault.jpg)](https://youtu.be/3hSqWMNTVYI)

## Features

### Core Functionality
- **Add, Edit, Delete Transactions** - Full CRUD operations with form validation
- **Six Default Categories** - Food, Books, Transport, Entertainment, Fees, Other (fully editable)
- **Real-time Regex Search** - Live search with match highlighting
- **Multi-column Sorting** - Sort by date, amount, or description
- **Dashboard Statistics** - Total spending, budget tracking, category breakdown
- **7-Day Trend Chart** - Visual bar chart of recent spending
- **Budget Cap with Alerts** - Set monthly budget with ARIA live announcements
- **Multi-currency Support** - USD, EUR, RWF with manual exchange rates
- **Import/Export Data** - JSON file import/export with validation
- **Persistent Storage** - All data saved to localStorage

### Accessibility (WCAG 2.1 AA Compliant)
- **Keyboard-only Navigation** - Full app usable without mouse
- **Screen Reader Support** - ARIA live regions for dynamic updates
- **Semantic HTML** - Proper landmarks and heading hierarchy
- **Color Contrast** - All text meets 4.5:1 minimum ratio
- **Focus Management** - Visible focus indicators and logical tab order
- **Skip Links** - Skip to main content for efficiency

### Responsive Design
- **Mobile-first Approach** - Optimized for 360px+ screens
- **Three Breakpoints** - 480px, 768px, 1024px
- **Card Layout** - Consistent card-based UI across all devices
- **Touch-friendly** - Adequate tap targets on mobile

---

## Key Technologies:
- HTML5 (Semantic elements)
- CSS3 (Flexbox, Grid, Custom Properties)
- JavaScript ES6+ (Modules, DOM manipulation)
- Regular Expressions (Form validation and search)
- localStorage API (Data persistence)

---

## Installation and Setup Locally

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for cloning the repository)
- Live Server (VSCode extension)
### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/n-elie7/finance_tracker_n-elie7.git
cd finance_tracker_n-elie7
```

2. Open the application:
```bash
# Open in VSCode or your favourite IDE
open index.html

# In the left hand side in VSCode right click "index.html" file
# Then click open with live server it will open on localhost

```

3. Load sample data (testing):
   - Navigate to Settings tab
   - Click "Import JSON"
   - Select the `seed.json` file


## Project Structure
```
financeaha/
├── index.html              # Main application
├── tests.html              # Validation tests
├── seed.json               # Sample data
├── styles/
│   ├── main.css           # Variables and base styles
│   ├── layout.css         # Responsive layout
│   ├── components.css     # UI components
└── scripts/
    ├── main.js            # Application logic
    ├── state.js           # State management
    ├── storage.js         # localStorage operations
    ├── validators.js      # Form validation
    ├── search.js          # Regex search
    ├── ui.js              # DOM rendering
    ├── utils.js           # Helper functions
    ├── stats.js           # Statistics calculations
    └── dashboard.js       # Dashboard updates
```

## Regex Patterns

The application implements five validation patterns:

1. **Description:** `/^\S(?:.*\S)?$/` - No leading or trailing whitespace
2. **Amount:** `/^(0|[1-9]\d*)(\.\d{1,2})?$/` - Valid currency format
3. **Date:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` - YYYY-MM-DD format
4. **Category:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` - Letters, spaces, hyphens only
5. **Duplicate Detection:** `/\b(\w+)\s+\1\b/i` - Advanced pattern using back-references

### Searching with Regex

**Basic Search:**
- Type `shawarma` → finds "Shawarma", "shawarma"
- Toggle "Case insensitive" for exact matching

**Advanced Patterns:**
- `(shawarma|pizza)` → finds either
- `\.\d{2}\b` → finds amounts with cents ($12.50)
- `^[A-Z]` → finds descriptions starting with capital
- `\b(\w+)\s+\1\b` → finds duplicate words

**If Invalid:**
- Error message appears below search box
- No results shown (doesn't crash)

---

## Keyboard Navigation

### Global Shortcuts

| Action | Key(s) |
|--------|--------|
| Navigate elements | `Tab` / `Shift+Tab` |
| Activate button/link | `Enter` or `Space` |
| Close modal | `Escape` |
| Skip to main content | Focus skip link → `Enter` |

### Navigation Tabs

| Tab | Shortcut |
|-----|----------|
| Dashboard | Tab to nav → `Enter` on Dashboard |
| Transactions | Tab to nav → `Enter` on Transactions |
| Add Transaction | Tab to nav → `Enter` on Add |
| Settings | Tab to nav → `Enter` on Settings |
| About | Tab to nav → `Enter` on About |

### Forms

| Action | Key |
|--------|-----|
| Move between fields | `Tab` |
| Open dropdown | `Space` or `Arrow Down` |
| Select option | `Arrow Up/Down` → `Enter` |
| Submit form | `Enter` (on any field or button) |
| Cancel | `Tab` to Cancel → `Enter` |

### Transaction List

| Action | Key |
|--------|-----|
| Focus transaction | `Tab` through cards |
| Edit transaction | `Tab` to Edit button → `Enter` |
| Delete transaction | `Tab` to Delete button → `Enter` |
| Confirm delete | `Tab` to Delete in modal → `Enter` |
| Cancel delete | `Tab` to Cancel → `Enter` or `Escape` |

### Search & Sort

| Action | Key |
|--------|-----|
| Focus search | `Tab` to search box |
| Type pattern | Type directly |
| Toggle case | `Tab` to checkbox → `Space` |
| Sort | `Tab` to dropdown → `Arrow Up/Down` → `Enter` |

---

## Accessibility

The application meets WCAG 2.1 Level AA standards:
- Full keyboard navigation support
- Screen reader compatible with ARIA live regions
- Color contrast ratios exceeding 4.5:1
- Semantic HTML structure with proper landmarks
- Focus indicators on all interactive elements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

---

## Testing

### Automated Tests

**Run tests:**
1. Open `tests.html` in browser
2. Tests run automatically
3. See 64 tests with pass/fail status

**Test Coverage:**
- Description validation: 11 tests
- Amount validation: 15 tests
- Date validation: 13 tests
- Category validation: 13 tests
- Duplicate word detection: 10 tests

**All tests should pass** (green indicators)

---

## Contact

**Student:** Niyubwayo Irakoze Elie  
**Email:** n.elie@alueducation.com  
**GitHub:** https://github.com/n-elie7

