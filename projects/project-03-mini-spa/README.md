# Project 3: Mini SPA (Router + Components Without React)

Build a single-page application from scratch using vanilla JavaScript. No frameworks
— just ES modules, a custom hash-based router, a central store, and component render
functions.

## Features

- **Hash-based routing** — navigate between pages without full page reloads using
  `window.location.hash` and the `hashchange` event.
- **Component render functions** — each page is a plain function that returns a DOM
  element, keeping the architecture simple and testable.
- **Central store** — a lightweight `getState` / `setState` / `subscribe` store that
  any component can read from or write to.
- **Navigation with active state** — the nav bar highlights the current route so the
  user always knows where they are.
- **404 page** — unrecognised routes display a friendly "Not Found" page with a link
  back to home.

## Architecture

```
index.html          ← SPA shell (nav, #app container, footer)
style.css           ← Global styles, nav highlight, page transitions
main.js             ← Entry point: creates store & router, registers routes
modules/
  router.js         ← createRouter() — hash-based routing engine
  store.js          ← createStore()  — central state management
  components/
    home.js         ← HomePage()     — welcome page with visit counter
    about.js        ← AboutPage()    — course / app information
    contact.js      ← ContactPage()  — contact form that saves messages
    not-found.js    ← NotFoundPage() — 404 fallback
```

## Milestones

1. **Milestone 1 — Project shell** Set up `index.html` with a nav bar, `#app`
   container, and footer. Add base styles in `style.css`.
2. **Milestone 2 — Router** Implement `createRouter()` in `router.js`. Register
   routes and listen for `hashchange` events. Swap `#app` content on navigation.
3. **Milestone 3 — Components** Build each page component as a function that returns
   a DOM element. Wire them into the router.
4. **Milestone 4 — Store** Implement `createStore()` with `getState`, `setState`,
   and `subscribe`. Connect the visit counter and contact form to the store.
5. **Milestone 5 — Polish** Add active-link highlighting, 404 handling, page
   transition CSS, and responsive layout.

## How to Run

```bash
# Install dependencies
npm install

# Run the completed solution
npm run dev

# Run the starter (for working through the project yourself)
npm run dev:starter
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Learning Objectives

- Understand how SPA routers work under the hood.
- Practice building UI with plain DOM APIs instead of JSX or templates.
- Learn the observer pattern via a simple pub/sub store.
- Appreciate what frameworks automate by doing it manually first.
