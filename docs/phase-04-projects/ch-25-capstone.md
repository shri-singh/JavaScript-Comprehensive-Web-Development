# Chapter 25 — Capstone: Production-Style CRUD Dashboard

## Learning Objectives

By the end of this project you will be able to:

- Architect a full-featured, production-style single-page application from scratch using vanilla JavaScript.
- Implement mock authentication with login, logout, and protected routes.
- Build complete CRUD (Create, Read, Update, Delete) operations for a data resource.
- Add filtering, sorting, and pagination to a data list.
- Apply form validation to both creation and editing flows.
- Handle loading and error states consistently throughout the entire application.
- Apply security best practices: XSS prevention via safe DOM manipulation, input sanitization, and avoiding `innerHTML` with user data.

---

## Feature List

The finished application is a **Task Manager Dashboard** (or a Contacts Manager — choose whichever domain interests you) with the following features:

| Feature | Description |
|---|---|
| Mock authentication | A login page that checks credentials against a hardcoded user list (or `localStorage`). On success, a session token is stored. A logout button clears the session. |
| Protected routes | The dashboard, create, and edit pages are only accessible when logged in. Unauthenticated visitors are redirected to the login page. |
| Task list with CRUD | View all tasks in a table or card layout. Create new tasks via a form. Edit existing tasks. Delete tasks with a confirmation dialog. |
| Filtering | Filter tasks by status (e.g., "All", "Active", "Completed") using a dropdown or tabs. |
| Sorting | Sort tasks by title (alphabetical), date created, or priority. Toggling a sort column reverses the direction. |
| Pagination | Display tasks in pages of 10 (or a configurable number). Show "Page X of Y" with navigation controls. |
| Form validation | The create and edit forms validate all fields (title required, description max length, due date in the future) with real-time feedback. |
| Loading states | Every asynchronous operation (login, fetching tasks, saving, deleting) shows a loading indicator. Buttons are disabled during requests to prevent double submission. |
| Error states | Network failures and validation errors display clear messages. Errors are dismissible and do not crash the application. |
| Security | All user-provided text is rendered with `textContent` or sanitized before insertion. No raw `innerHTML` with user data anywhere. |

---

## Architecture Overview

```
project-04-capstone/
  starter/
    index.html
    css/
      styles.css
      components.css       ← component-specific styles (cards, tables, forms)
    js/
      main.js              ← entry point, initializes auth, router, and store
      router.js            ← hash-based router with route guards
      store.js             ← central state management (dispatch / subscribe)
      auth/
        auth.js            ← login, logout, isAuthenticated, getCurrentUser
        auth-guard.js      ← route guard that redirects to login if unauthenticated
      api/
        task-api.js         ← mock API service (CRUD operations with simulated delay)
      components/
        app-shell.js       ← renders header, nav, outlet, footer
        login-page.js      ← login form component
        dashboard-page.js  ← task list with filters, sort, pagination
        task-form.js       ← shared create/edit form component
        task-row.js        ← single task row/card in the list
        confirm-dialog.js  ← reusable confirmation modal
        loading-spinner.js ← reusable loading indicator
        error-banner.js    ← reusable dismissible error message
      utils/
        sanitize.js        ← input sanitization helpers
        validate.js        ← pure validation functions for task fields
        format.js          ← date formatting, text truncation
```

### Key Design Decisions

1. **Mock API with simulated latency.** `task-api.js` stores tasks in `localStorage` and wraps every operation in a `Promise` with a `setTimeout` delay (200-500 ms). This simulates real network behavior so the application must handle asynchronous states properly. The API surface mirrors a real REST API:
   - `getTasks({ filter, sort, page, limit })` returns `{ data, total }`.
   - `getTask(id)` returns a single task.
   - `createTask(task)` returns the created task with a generated `id`.
   - `updateTask(id, updates)` returns the updated task.
   - `deleteTask(id)` returns `{ success: true }`.

2. **Auth module.** `auth.js` manages a session token in `sessionStorage`. `login(username, password)` validates credentials, generates a token, and stores it. `logout()` clears the token and navigates to the login page. `isAuthenticated()` checks for a valid token. `getCurrentUser()` returns the logged-in user's information.

3. **Route guards.** `auth-guard.js` exports a function that the router calls before rendering a protected route. If `isAuthenticated()` returns `false`, the guard redirects to `#/login`. This pattern cleanly separates authorization logic from components.

4. **Reusable components.** `confirm-dialog.js`, `loading-spinner.js`, and `error-banner.js` are generic components used throughout the application. They accept configuration via parameters and can be dropped into any page.

5. **Security by default.** `sanitize.js` exports a `sanitizeText(input)` function that trims whitespace and escapes HTML entities. Every component uses `textContent` for rendering user-provided strings. The project avoids `innerHTML` entirely, reinforcing the patterns from Chapter 21.

---

## Milestones

### Milestone 1 — Project Scaffold & Auth Module

**Deliverables:**
- Set up the project structure: `index.html`, CSS files, and all module files (empty, with JSDoc signatures).
- Build `auth.js`:
  - `login(username, password)` — check against a hardcoded user list (e.g., `admin` / `password123`). On success, store a token in `sessionStorage` and return the user object. On failure, throw an error.
  - `logout()` — clear the session and navigate to `#/login`.
  - `isAuthenticated()` — return `true` if a valid token exists.
  - `getCurrentUser()` — return the current user's name and role.
- Build `login-page.js`: a login form with username and password fields, a submit button, and an error message area. On submit, call `auth.login()`. On success, navigate to `#/`. On failure, display the error.
- Wire the router with two routes: `#/login` (login page) and `#/` (a placeholder dashboard page that just says "Welcome").
- Verify login and logout work end to end.

**Key concepts:** Authentication flow, `sessionStorage`, form submission handling, error display.

### Milestone 2 — Mock API & Task List

**Deliverables:**
- Build `task-api.js` with all five CRUD functions. Seed `localStorage` with 25 sample tasks on first load. Each task has: `id`, `title`, `description`, `status` ("active" or "completed"), `priority` ("low", "medium", "high"), `createdAt` (ISO timestamp), and `dueDate`.
- Build `dashboard-page.js`: fetch tasks from the mock API and render them in a table or card grid. Each row shows title, status, priority, due date, and action buttons (Edit, Delete).
- Build `task-row.js`: renders a single task. All text fields use `textContent`. Status is shown with a visual badge (color-coded).
- Add `loading-spinner.js`: displayed while tasks are loading.
- Add `error-banner.js`: displayed if the API call fails. Include a "Dismiss" button.
- Wire the route guard: `#/` requires authentication. If not logged in, redirect to `#/login`.

**Key concepts:** Mock API design, `localStorage` as a data store, `async`/`await`, loading/error states, route protection.

### Milestone 3 — Create & Edit Forms

**Deliverables:**
- Build `task-form.js`: a reusable form component that works for both creating and editing. Accept an optional `task` parameter — if provided, pre-populate the fields (edit mode). If not, render empty fields (create mode).
- Write `validate.js` with pure validation functions:
  - `validateTitle(value)` — required, 3-100 characters.
  - `validateDescription(value)` — optional, max 500 characters.
  - `validateDueDate(value)` — if provided, must be a valid date in the future.
  - `validatePriority(value)` — must be one of "low", "medium", "high".
- Add real-time validation on `input` and `blur` events with accessible error messages (`aria-describedby`, `aria-live`).
- Add routes: `#/tasks/new` (create) and `#/tasks/:id/edit` (edit). The edit route extracts the task ID from the hash, fetches the task from the API, and passes it to the form.
- On submit: call `createTask` or `updateTask`, show a loading state on the submit button, and navigate back to the dashboard on success.

**Key concepts:** Reusable form component, create vs. edit mode, route parameters, form validation, optimistic navigation.

### Milestone 4 — Filtering, Sorting & Pagination

**Deliverables:**
- **Filtering:** Add a status filter dropdown ("All", "Active", "Completed") above the task list. When changed, re-fetch tasks with the filter applied. The filter value is stored in the central store so it persists across navigation.
- **Sorting:** Make table column headers (Title, Date, Priority) clickable. Clicking a header sorts by that column. Clicking again reverses the sort direction. Show an arrow icon indicating the current sort direction.
- **Pagination:** Display 10 tasks per page. Show "Page X of Y" with "Previous" and "Next" buttons. Disable buttons at the boundaries. Filter and sort parameters are included in the API call so pagination reflects the filtered/sorted data.
- Update `task-api.js` to support filter, sort, and pagination parameters in `getTasks()`.
- All three features (filter, sort, page) are tracked in the store. Changing any one resets the page to 1.

**Key concepts:** Parameterized API calls, derived state, multi-criteria queries, stateful UI controls.

### Milestone 5 — Delete Confirmation & Error Handling

**Deliverables:**
- Build `confirm-dialog.js`: a modal overlay with a message, a "Confirm" button, and a "Cancel" button. It returns a `Promise` that resolves to `true` (confirm) or `false` (cancel). The modal traps focus: tab cycles only within the modal, and pressing `Escape` cancels.
- Wire the Delete button on each task row to open the confirmation dialog. On confirm, call `deleteTask(id)`, show a loading state, remove the task from the list, and display a success message.
- Implement consistent error handling across the application:
  - API errors show an error banner at the top of the page.
  - Form validation errors show inline.
  - Auth errors redirect to the login page.
  - All errors are logged to the console for debugging.
- Add a global error handler: `window.addEventListener("unhandledrejection", ...)` to catch any unhandled promise rejections and display a generic error banner.

**Key concepts:** Modal dialog accessibility (focus trap, Escape key), `Promise`-based dialog API, error handling strategy, `unhandledrejection`.

### Milestone 6 — Security Audit & Final Polish

**Deliverables:**
- **Security review:** Audit every component. Confirm that no user-provided data is rendered via `innerHTML`. Verify that `sanitize.js` is called on all form inputs before saving. Check that the auth token is stored in `sessionStorage` (not `localStorage`) and is cleared on logout.
- **XSS test:** Try entering `<script>alert('xss')</script>` and `<img src=x onerror=alert(1)>` in every text field. Confirm that the payload is rendered as harmless text.
- **Keyboard accessibility:** Navigate the entire application using only the keyboard. Verify that every interactive element is reachable, focus order is logical, and modals trap focus.
- **Screen reader testing:** Verify that route changes are announced, errors are announced via `aria-live`, and form errors are linked via `aria-describedby`.
- **Responsive design:** Ensure the dashboard works on mobile screen sizes (stack table columns or switch to a card layout).
- **Code cleanup:** Remove `console.log` statements, add JSDoc comments to all exported functions, and verify that all modules use strict ES module syntax.

**Key concepts:** Security auditing, XSS testing, accessibility testing, responsive design, code quality.

---

## Stretch Goals

1. **Dark mode.** Add a theme toggle (light/dark) in the header. Store the preference in `localStorage`. Apply the theme by toggling a `.dark` class on `<html>` and using CSS custom properties for all colors.

2. **Export CSV.** Add an "Export" button to the dashboard that generates a CSV file from the current (filtered, sorted) task list and triggers a download using `Blob` and `URL.createObjectURL`.

3. **Optimistic updates.** When the user toggles a task's status, update the UI immediately (before the API responds). If the API call fails, revert the change and show an error. This improves perceived performance.

4. **Undo delete.** Instead of immediately deleting a task, show a "Task deleted. Undo?" toast notification for 5 seconds. If the user clicks "Undo," restore the task. Only commit the delete to the API after the timeout expires.

5. **Dashboard analytics.** Add a summary bar at the top of the dashboard: total tasks, active count, completed count, and a percentage completion bar. Update these numbers reactively when tasks change.

6. **Multi-user simulation.** Add a user switcher that lets you log in as different users, each with their own task list. Store tasks keyed by user ID in `localStorage`.

---

## What You'll Practice

This capstone project brings together concepts from every phase of the course:

| Chapter | Concept Applied |
|---|---|
| [Chapter 5 — Functions](../../docs/phase-01-js-mastery/ch-05-functions.md) | Pure validation functions, higher-order functions for event handlers. |
| [Chapter 6 — Objects](../../docs/phase-01-js-mastery/ch-06-objects-prototypes.md) | Task data objects, shallow copying for immutable updates. |
| [Chapter 7 — Arrays](../../docs/phase-01-js-mastery/ch-07-arrays-iteration.md) | `filter`, `sort`, `map`, `slice` for data manipulation. |
| [Chapter 8 — Modern Syntax](../../docs/phase-01-js-mastery/ch-08-modern-syntax.md) | Destructuring, spread, template literals, optional chaining. |
| [Chapter 9 — Errors](../../docs/phase-01-js-mastery/ch-09-errors.md) | `try`/`catch`, custom error handling strategy, `unhandledrejection`. |
| [Chapter 10 — DOM](../../docs/phase-02-browser-dom-state/ch-10-dom.md) | Creating and updating DOM elements, `DocumentFragment`, safe rendering. |
| [Chapter 11 — Events](../../docs/phase-02-browser-dom-state/ch-11-events.md) | Event delegation, form submission, keyboard events, `hashchange`. |
| [Chapter 12 — Forms](../../docs/phase-02-browser-dom-state/ch-12-forms.md) | `FormData` API, Constraint Validation, accessible error messages. |
| [Chapter 13 — State](../../docs/phase-02-browser-dom-state/ch-13-state.md) | Central store, state-driven rendering, `localStorage` / `sessionStorage` persistence. |
| [Chapter 14 — Reactivity](../../docs/phase-02-browser-dom-state/ch-14-reactivity.md) | Store with `dispatch` / `subscribe`, reactive UI updates. |
| [Chapter 15 — Async](../../docs/phase-02-browser-dom-state/ch-15-async.md) | `async`/`await`, `Promise`-based dialog, simulated async operations. |
| [Chapter 16 — HTTP + Fetch](../../docs/phase-02-browser-dom-state/ch-16-http-fetch.md) | API module design, request/response handling patterns. |
| [Chapter 17 — Modules](../../docs/phase-03-professional/ch-17-modules.md) | Feature-folder organization, ES module imports/exports. |
| [Chapter 19 — Testing](../../docs/phase-03-professional/ch-19-testing.md) | Testable module design (pure validation functions, separated API layer). |
| [Chapter 20 — Performance](../../docs/phase-03-professional/ch-20-performance.md) | Efficient DOM updates, debounced inputs, minimal re-rendering. |
| [Chapter 21 — Security](../../docs/phase-03-professional/ch-21-security.md) | XSS prevention, input sanitization, safe DOM manipulation, `textContent` over `innerHTML`. |

---

## Security Notes

This project deliberately reinforces secure coding practices. Pay close attention to the following throughout your implementation:

1. **Never use `innerHTML` with user data.** Every task title, description, and user input must be rendered via `textContent` or `createElement` + `textContent`. If you must build HTML strings (you should not need to), sanitize with a library like DOMPurify.

2. **Sanitize all inputs on save.** Before storing any user input, trim whitespace and strip or escape HTML entities. The `sanitize.js` module should be used in every form submission handler.

3. **Auth tokens belong in `sessionStorage`.** Unlike `localStorage`, `sessionStorage` is scoped to the tab and cleared when the tab closes. This limits the window of exposure for session tokens.

4. **Validate on the "server" side too.** Even though the mock API is client-side JavaScript, write `task-api.js` to validate incoming data (check required fields, enforce max lengths). This builds the habit of server-side validation.

5. **Escape user data in CSV export.** If a task title contains a comma or double quote, the CSV export must properly escape it. Fields containing commas should be wrapped in double quotes, and embedded double quotes should be doubled.

---

## Starter Code

Find the starter template and completed solution at:

[`../../projects/project-04-capstone/`](../../projects/project-04-capstone/)

The `starter/` folder contains the HTML shell, CSS files, and all module files with JSDoc comments describing each function's expected signature. The `solution/` folder contains a complete reference implementation.

---

## What's Next

Congratulations. If you have completed this capstone, you have built a production-style single-page application entirely from scratch — with routing, authentication, CRUD operations, state management, form validation, accessibility, and security — using nothing but vanilla JavaScript, HTML, and CSS. You are ready to pick up any framework and understand what it does under the hood, because you have built it yourself.
