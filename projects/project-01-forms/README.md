# Project 1: Forms + Validation + Local Persistence

A multi-step registration form that validates user input in real time, provides
accessible error feedback, measures password strength, and persists draft data to
`localStorage` so nothing is lost on accidental page reloads.

---

## Features

| Area | Details |
|------|---------|
| **Multi-step form** | Three steps -- Personal Info, Account Details, Preferences -- with animated transitions and a progress bar. |
| **Field validation** | Required-field checks, email format, password strength (length + character complexity), confirm-password match, and custom error messages. |
| **Accessible errors** | Each error is linked to its field with `aria-describedby` and announced via an `aria-live` region. |
| **Password strength meter** | Visual bar that updates on every keystroke showing Weak / Fair / Strong / Very Strong. |
| **Local persistence** | Every field change is automatically saved to `localStorage`. Data is restored on page load and cleared on successful submission. |
| **Keyboard & screen-reader friendly** | Proper `<label>`, `<fieldset>`, `<legend>`, focus management on step change. |

---

## Architecture

```
project-01-forms/
├── package.json
├── README.md
├── starter/          # Student starting point (skeletons with TODOs)
│   ├── index.html
│   ├── style.css
│   ├── main.js
│   └── modules/
│       ├── validation.js
│       ├── persistence.js
│       └── ui.js
└── solution/         # Complete working implementation
    ├── index.html
    ├── style.css
    ├── main.js
    └── modules/
        ├── validation.js
        ├── persistence.js
        └── ui.js
```

### Module responsibilities

| Module | Exports | Purpose |
|--------|---------|---------|
| `validation.js` | `validateField()`, `validateStep()`, `getFieldError()` | Pure validation logic -- no DOM access. |
| `persistence.js` | `saveDraft()`, `loadDraft()`, `clearDraft()` | Thin wrapper around `localStorage`. |
| `ui.js` | `showStep()`, `updateProgress()`, `showError()`, `clearError()`, `updatePasswordStrength()` | All DOM reads/writes for step navigation, progress bar, error display, and strength meter. |
| `main.js` | *(entry point)* | Wires modules together: event listeners, orchestration logic. |

---

## Milestones

Students are expected to work through the project in four milestones:

### Milestone 1 -- Step Navigation & Progress Bar
- Implement `showStep()` and `updateProgress()` in `ui.js`.
- Wire the Next / Back buttons in `main.js` so the user can move between steps.

### Milestone 2 -- Field Validation
- Implement `validateField()` and `getFieldError()` in `validation.js`.
- Implement `showError()` and `clearError()` in `ui.js`.
- Add blur-event listeners in `main.js` that validate individual fields.
- Implement `validateStep()` so the Next button validates all fields in the current step before advancing.

### Milestone 3 -- Password Strength Meter
- Add strength-calculation logic inside `validateField()` (or a helper).
- Implement `updatePasswordStrength()` in `ui.js` to update the visual meter.
- Wire the `input` event on the password field in `main.js`.

### Milestone 4 -- Local Persistence
- Implement `saveDraft()`, `loadDraft()`, and `clearDraft()` in `persistence.js`.
- Call `saveDraft()` on every input change in `main.js`.
- Restore form data with `loadDraft()` on `DOMContentLoaded`.
- Call `clearDraft()` after a successful form submission.

---

## How to Run

### Prerequisites

- **Node.js** >= 18
- **npm** (comes with Node.js)

### Install dependencies

```bash
cd projects/project-01-forms
npm install
```

### Run the solution (complete implementation)

```bash
npm run dev
# or: npx vite solution
```

### Run the starter (student skeleton)

```bash
npm run dev:starter
# or: npx vite starter
```

Both commands start a local Vite dev server (default `http://localhost:5173`) with
hot-module reloading.

### Preview a production build

```bash
npm run preview
```

---

## Key Concepts Practiced

- ES Modules (`import` / `export`)
- DOM manipulation and event delegation
- `localStorage` API
- Regular expressions for validation
- WAI-ARIA attributes (`aria-live`, `aria-describedby`, `aria-invalid`)
- CSS custom properties and transitions
