# Project 4: Capstone — Production-Style CRUD Dashboard

A full-featured task management dashboard built with vanilla JavaScript. This capstone project brings together routing, authentication, state management, CRUD operations, filtering, pagination, and component architecture — all without frameworks.

## Features

- **Authentication** — Mock login/logout with session-based token storage
- **CRUD Operations** — Create, read, update, and delete tasks via a mock API
- **Filtering & Search** — Filter tasks by status, priority, and free-text search
- **Sorting** — Sort tasks by title, priority, status, or date
- **Pagination** — Navigate large task lists with page controls
- **Hash Router** — Client-side routing with route guards for protected pages
- **Centralized State** — Observable store pattern for predictable state management
- **Responsive Design** — Works on desktop, tablet, and mobile
- **XSS Safety** — Uses `textContent` instead of `innerHTML` for user-supplied data
- **Component Architecture** — Modular ES module components with clear separation of concerns

## Architecture

```
index.html            App shell (header, #app container, footer)
style.css             Dashboard styles with CSS custom properties
main.js               Entry point — bootstraps auth, store, router
modules/
  auth.js             Authentication (login, logout, token management)
  api.js              Mock REST API (in-memory data, async operations)
  store.js            Centralized state management (observable store)
  router.js           Hash-based router with route guards
  components/
    login.js          Login page with form validation
    dashboard.js      Main dashboard — filters, task list, pagination
    task-form.js      Create / edit task form with validation
    task-list.js      Task cards with status & priority badges
    pagination.js     Page navigation controls
```

## Milestones

Work through the project in these six steps:

### Milestone 1 — Project Setup & Authentication
Set up the HTML shell, CSS custom properties, and implement the `auth.js` module. Build the login form component. Verify you can log in with the demo credentials (`demo` / `password`) and that the token is stored in `sessionStorage`.

### Milestone 2 — Router & Route Guards
Implement the hash-based router in `router.js`. Register routes for login, dashboard, task creation, and task editing. Add route guards so unauthenticated users are redirected to the login page.

### Milestone 3 — Mock API & Seed Data
Build the mock API in `api.js` with an in-memory array of 15-20 seed tasks. Implement `getTasks`, `getTask`, `createTask`, `updateTask`, and `deleteTask`. Each function should return a `Promise` that resolves after a short delay to simulate network latency.

### Milestone 4 — State Management & Dashboard
Implement the observable store in `store.js`. Build the dashboard component that reads from the store, displays tasks, and re-renders when state changes. Wire up the "Create New Task" button.

### Milestone 5 — CRUD & Task Form
Build the task form component for creating and editing tasks. Validate required fields (title is required). On submit, call the API, update the store, and navigate back to the dashboard.

### Milestone 6 — Filtering, Sorting & Pagination
Add filter controls (status dropdown, priority dropdown, search input) and sorting to the dashboard. Implement pagination so only a fixed number of tasks appear per page. Make sure filters, sorting, and pagination all work together.

## Security Notes

- **XSS Prevention**: All user-supplied text is rendered via `textContent`, never `innerHTML`. This prevents script injection through task titles or descriptions.
- **Session Storage**: The mock token is stored in `sessionStorage` (cleared when the tab closes) rather than `localStorage` for slightly better security in a shared-device scenario.
- **Route Guards**: Protected routes check authentication before rendering. Unauthenticated users are redirected to the login page.
- **Input Validation**: The task form validates required fields before submission. The API layer also validates data before storing it.
- **No eval()**: The router and store avoid `eval`, `Function()`, and `innerHTML` for dynamic content.

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Install Dependencies

```bash
cd projects/project-04-capstone
npm install
```

### Run the Solution

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Run the Starter

```bash
npm run dev:starter
```

### Demo Credentials

| Username | Password   |
|----------|------------|
| `demo`   | `password` |

## Learning Objectives

After completing this project you will be able to:

1. Architect a multi-page SPA with vanilla JavaScript modules
2. Implement client-side authentication with route guards
3. Build a mock REST API that simulates real-world async behavior
4. Manage application state with an observable store pattern
5. Create reusable UI components without a framework
6. Handle CRUD operations with optimistic UI updates
7. Implement filtering, sorting, and pagination on the client side
8. Write defensive code that prevents XSS and other common vulnerabilities
