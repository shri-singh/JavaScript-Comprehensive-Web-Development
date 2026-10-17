# Chapter 22 — Project 1: Forms + Validation + Local Persistence

## Learning Objectives

By the end of this project you will be able to:

- Build a multi-step registration form with real-time client-side validation.
- Use the `FormData` API to collect and process form input programmatically.
- Apply the Constraint Validation API alongside custom validation logic for complex rules like password strength.
- Create accessible error messages using `aria-live` regions, `aria-describedby`, and proper label associations.
- Persist form drafts to `localStorage` so users can close the browser and resume later.
- Organize code into clearly separated modules: validation, persistence, rendering, and state management.

---

## Feature List

The finished application is a **multi-step account registration form** with the following features:

| Feature | Description |
|---|---|
| Multi-step form | Three or more steps (e.g., Account, Profile, Confirmation) with a progress indicator. |
| Real-time validation | Fields validate on `input` and `blur`, showing inline error messages immediately. |
| Password strength meter | A visual indicator that updates in real time as the user types a password. |
| FormData collection | On each step, data is collected via the `FormData` API rather than manual `querySelector` calls. |
| Accessible errors | Every error message is associated with its field via `aria-describedby` and announced via `aria-live="polite"`. |
| Draft persistence | The form state is saved to `localStorage` on every change. On page reload, the draft is restored automatically. |
| Progress indicator | A visual bar or step indicator showing which step the user is on and which steps are complete. |
| Summary & submit | A final confirmation step that displays all entered data for review before submission. |

---

## Architecture Overview

```
project-01-forms/
  starter/
    index.html
    css/
      styles.css
    js/
      main.js              ← entry point, wires everything together
      state.js             ← central state object + update/render cycle
      validation.js        ← pure validation functions (no DOM)
      persistence.js       ← localStorage read/write helpers
      components/
        step-account.js    ← renders step 1 (email, password)
        step-profile.js    ← renders step 2 (name, bio, avatar)
        step-confirm.js    ← renders step 3 (review all data)
        progress-bar.js    ← renders the progress indicator
        password-meter.js  ← renders the password strength meter
```

### Key Design Decisions

1. **State-driven rendering.** A single `state` object holds all form data, the current step index, and validation errors. A top-level `render()` function reads state and updates the DOM. This pattern was introduced in Chapter 13.

2. **Pure validation module.** `validation.js` exports functions like `validateEmail(value)` and `validatePassword(value)` that return either `null` (valid) or an error message string. These functions have no side effects and are easy to test.

3. **Persistence module.** `persistence.js` exports `saveDraft(state)` and `loadDraft()`. Internally these call `JSON.stringify` / `JSON.parse` and handle `localStorage` errors gracefully (quota exceeded, private browsing mode).

4. **Component functions.** Each step is a function that receives state and returns a DOM element (or updates a container). This mirrors the component pattern explored in Chapter 14.

---

## Milestones

### Milestone 1 — HTML Structure & Single-Step Form

**Deliverables:**
- Create `index.html` with a semantic `<form>` element, a heading, and a container for dynamic content.
- Build `step-account.js`: render an email field and a password field with proper `<label>` elements.
- Wire up `main.js` to call the component and insert it into the page.
- Verify that the form displays correctly with no JavaScript errors.

**Key concepts:** Semantic HTML, `<label>` + `for` attribute, `createElement` / `textContent`.

### Milestone 2 — Validation Module & Real-Time Feedback

**Deliverables:**
- Write `validation.js` with at least four pure functions: `validateEmail`, `validatePassword`, `validateRequired`, and `validateMinLength`.
- `validatePassword` should return a strength level (`weak`, `medium`, `strong`) in addition to error messages. Check for length, mixed case, digits, and special characters.
- Hook validation into `input` and `blur` events on the form fields.
- Display inline error messages below each field. Each error `<span>` must have a unique `id` and the corresponding input must reference it with `aria-describedby`. Wrap errors in an `aria-live="polite"` container so screen readers announce them.
- Build `password-meter.js` to render a strength bar that updates on every keystroke.

**Key concepts:** Constraint Validation API, `aria-describedby`, `aria-live`, event delegation, pure functions.

### Milestone 3 — Multi-Step Navigation & Progress Indicator

**Deliverables:**
- Add `step-profile.js` (name, bio, optional avatar URL) and `step-confirm.js` (read-only summary of all data).
- Add `currentStep` to the state object. Render only the active step's component.
- Build "Next" and "Back" buttons. "Next" triggers validation on the current step's fields; if any fail, block navigation and show errors.
- Build `progress-bar.js`: a horizontal bar or numbered step list that highlights the current step and marks completed steps.
- Wire the progress bar to update whenever `currentStep` changes.

**Key concepts:** State-driven rendering, conditional rendering, form step navigation.

### Milestone 4 — LocalStorage Persistence

**Deliverables:**
- Write `persistence.js` with `saveDraft(state)` and `loadDraft()`.
- Call `saveDraft` inside the state update function so every change is automatically persisted.
- On page load in `main.js`, call `loadDraft()`. If a draft exists, restore state and render the correct step.
- Add a "Clear Draft" button that calls `localStorage.removeItem` and resets state.
- Handle edge cases: corrupted JSON, missing keys in old drafts, `localStorage` unavailable.

**Key concepts:** `localStorage`, `JSON.stringify` / `JSON.parse`, defensive parsing, graceful degradation.

### Milestone 5 — Polish & Accessibility Audit

**Deliverables:**
- Tab through the entire form using only the keyboard. Ensure every interactive element is reachable and focus order is logical.
- Test with a screen reader (or browser accessibility inspector). Verify that error messages are announced and that the progress indicator conveys state.
- Add `role="alert"` to any error container that appears on submit attempts.
- Add a submission success message: after the final step, display a "Registration complete" message with `role="status"`.
- Style the form with CSS: visual focus indicators (`:focus-visible`), error states (red borders, icons), and a clean layout.

**Key concepts:** Keyboard navigation, ARIA roles, `:focus-visible`, accessible design patterns.

---

## Stretch Goals

1. **Settings page.** After "registration," navigate to a settings page where the user can edit their profile. Re-use the same validation module and persistence layer.

2. **Export data as JSON.** Add a "Download my data" button that creates a JSON blob from the current state and triggers a download using `URL.createObjectURL` and a temporary `<a>` element.

3. **Form analytics.** Track how long users spend on each step and which fields cause the most validation errors. Display a summary in the console or in a hidden admin panel.

4. **Theming.** Add a light/dark mode toggle that persists its preference to `localStorage` alongside the form draft.

5. **Animated transitions.** Add CSS transitions or animations when navigating between form steps (slide left/right).

---

## What You'll Practice

This project directly applies concepts from the following chapters:

| Chapter | Concept Applied |
|---|---|
| [Chapter 10 — DOM](../../docs/phase-02-browser-dom-state/ch-10-dom.md) | Creating and updating DOM elements programmatically. |
| [Chapter 11 — Events](../../docs/phase-02-browser-dom-state/ch-11-events.md) | Listening for `input`, `blur`, `submit`, and `click` events; event delegation. |
| [Chapter 12 — Forms](../../docs/phase-02-browser-dom-state/ch-12-forms.md) | `FormData` API, Constraint Validation API, accessible form patterns. |
| [Chapter 13 — State](../../docs/phase-02-browser-dom-state/ch-13-state.md) | Single source of truth, state-driven rendering, `localStorage` persistence. |
| [Chapter 14 — Reactivity](../../docs/phase-02-browser-dom-state/ch-14-reactivity.md) | Reactive render cycle, component functions that return DOM. |
| [Chapter 17 — Modules](../../docs/phase-03-professional/ch-17-modules.md) | ES module imports/exports, separating concerns into files. |
| [Chapter 21 — Security](../../docs/phase-03-professional/ch-21-security.md) | Input sanitization, safe DOM manipulation with `textContent`. |

---

## Starter Code

Find the starter template and completed solution at:

[`../../projects/project-01-forms/`](../../projects/project-01-forms/)

The `starter/` folder contains the HTML shell and empty module files with JSDoc comments describing each function's expected signature. The `solution/` folder contains a complete reference implementation.

---

## What's Next

With a form-heavy application under your belt, the next project tackles asynchronous data fetching: building a reactive search UI powered by a public API.
