# FinanceAha - Student Finance Tracker

A responsive web application for managing personal finances. Built with vanilla HTML, CSS, and JavaScript to help students track expenses, manage budgets, and analyze spending patterns.

## Project Overview

FinanceAha is a client-side finance tracker that allows users to record transactions, categorize expenses, and monitor spending against a monthly budget. The application uses regular expressions for form validation and search functionality, implements WCAG 2.1 AA accessibility standards, and stores all data locally using the browser's localStorage API.

**Key Technologies:**
- HTML5 (Semantic elements)
- CSS3 (Flexbox, Grid, Custom Properties)
- JavaScript ES6+ (Modules, DOM manipulation)
- Regular Expressions (Form validation and search)
- localStorage API (Data persistence)

## Live Application

**GitHub Repository:** https://github.com/n-elie7/finance_tracker_n-elie7.git

**Live Demo:** https://n-elie7.github.io/finance_tracker_n-elie7/

**Demo Video:** https://youtu.be/3hSqWMNTVYI

## Installation and Setup

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

3. Load sample data (optional):
   - Navigate to Settings tab
   - Click "Import JSON"
   - Select the `seed.json` file

### Testing

Open `tests.html` in a browser to run the 62 automated validation tests.

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
│   └── animations.css     # Transitions and effects
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

## Contact

**Student:** Niyubwayo Irakoze Elie  
**Email:** n.elie@alueducation.com  
**GitHub:** https://github.com/n-elie7

