# Chapter 24 — Project 3: Mini SPA

## Learning Objectives

By the end of this project you will be able to:

- Build a single-page application with client-side routing using only vanilla JavaScript — no framework, no library.
- Implement a hash-based router that listens to the `hashchange` event and maps URL fragments to page components.
- Write component render functions that return DOM elements, following a consistent pattern across all pages.
- Manage shared application state in a central store module that any component can read from and write to.
- Highlight the active navigation link based on the current route.
- Handle unknown routes with a 404 page.

---

## Feature List

The finished application is a **multi-page personal site** (or small content app) with client-side routing. It has the following features:

| Feature | Description |
|---|---|
| Hash-based routing | URLs like `#/`, `#/about`, `#/contact`, and `#/anything-else` (404) each render a different page without a full-page reload. |
| Navigation bar | A persistent `<nav>` with links to each page. The active link is visually highlighted based on the current hash. |
| Page components | Each route maps to a component function that returns a DOM tree. Components are lazy — they build their DOM only when navigated to. |
| Central store | A shared state module holds data accessible to all pages (e.g., a visitor counter, a theme preference, or a list of items). |
| 404 page | Any unrecognized hash renders a "Page not found" component with a link back to home. |
| Accessible routing | When the route changes, focus is moved to the new page's main heading and an `aria-live` region announces the page title. |

---

## Architecture Overview

```
project-03-mini-spa/
  starter/
    index.html
    css/
      styles.css
    js/
      main.js              ← entry point, initializes router and renders shell
      router.js            ← hash-based router: register routes, listen, navigate
      store.js             ← central state with getState / setState / subscribe
      components/
        nav.js             ← renders the navigation bar with active state
        home.js            ← home page component
        about.js           ← about page component
        contact.js         ← contact page component (with a form)
        not-found.js       ← 404 page component
```

### Key Design Decisions

1. **Hash-based router.** The router listens for the `hashchange` event on `window`. A route table maps hash patterns (e.g., `"/"`, `"/about"`) to component functions. When the hash changes, the router looks up the component, calls it, and replaces the content of a `<main>` outlet element. If no route matches, the 404 component is rendered. This approach requires no server configuration and works with static file servers.

2. **Component convention.** Every page component is a function that returns a `DocumentFragment` or a root `HTMLElement`. Components may accept a `params` object (for future route parameters) and may read from the store. This convention is consistent and predictable — the same pattern used in Projects 1 and 2.

3. **Central store.** `store.js` is a minimal state container. It holds a plain object, exposes `getState()` and `setState(partial)`, and notifies subscribers when state changes. This lets the contact form (for example) save a message to the store, and the home page can display a "Messages sent" count.

4. **Shell layout.** `index.html` contains a static shell: a `<header>` with the nav (rendered by `nav.js`), a `<main id="outlet">` where page components are swapped in, and a `<footer>`. The shell never re-renders — only the outlet content changes.

---

## Milestones

### Milestone 1 — Router Module & Basic Page Rendering

**Deliverables:**
- Create `index.html` with a static `<header>`, a `<main id="outlet">`, and a `<footer>`.
- Write `router.js` with the following API:
  ```js
  // Register a route
  router.addRoute(path, componentFn);

  // Start listening for hash changes
  router.start();

  // Programmatic navigation
  router.navigate(path);
  ```
- Internally, `router.start()` reads `location.hash`, strips the `#` prefix, looks up the matching component function, calls it, and replaces the content of `#outlet`.
- Register the `hashchange` event listener so navigation works when the user clicks links or uses the browser back/forward buttons.
- Create a minimal `home.js` that returns a `<section>` with an `<h1>` and a paragraph. Register it at `"/"`.
- Verify that loading the page shows the home component, and manually changing the hash to `#/` also shows it.

**Key concepts:** `hashchange` event, `location.hash`, route table (plain object or `Map`), DOM replacement.

### Milestone 2 — Multiple Pages & 404 Handling

**Deliverables:**
- Create `about.js`: returns a section with information about the site/app.
- Create `contact.js`: returns a section with a simple contact form (name, email, message). The form does not submit to a server — it captures data with the `FormData` API and stores it in the central store.
- Create `not-found.js`: returns a section with a "Page not found" heading and a link to `#/`.
- Register all routes in `main.js`:
  ```js
  router.addRoute("/", home);
  router.addRoute("/about", about);
  router.addRoute("/contact", contact);
  router.setNotFound(notFound);
  ```
- Add `setNotFound(componentFn)` to the router. If no registered route matches the current hash, render this component.
- Test by navigating to `#/about`, `#/contact`, `#/nonexistent`, and `#/`.

**Key concepts:** Route registration, fallback routes, component function pattern.

### Milestone 3 — Navigation Bar with Active State

**Deliverables:**
- Write `nav.js`: a function that returns a `<nav>` element with `<a>` links for Home (`#/`), About (`#/about`), and Contact (`#/contact`).
- On every route change, update the nav to highlight the active link. Add an `aria-current="page"` attribute to the active link and a CSS class (e.g., `.active`) for visual styling.
- Render the nav once in `main.js` and insert it into the `<header>`. Subscribe to route changes (either via a callback from the router or by re-evaluating `location.hash` on `hashchange`).
- Use event delegation: attach a single `click` listener on the `<nav>` element rather than one per link.
- Style the nav: horizontal link list, highlighted active link, hover and focus states.

**Key concepts:** `aria-current="page"`, event delegation, CSS active states, subscription to route changes.

### Milestone 4 — Central Store & Cross-Page State

**Deliverables:**
- Write `store.js`:
  ```js
  const store = createStore({
    messagesSubmitted: 0,
    lastVisitedPage: "/",
    theme: "light"
  });
  ```
  Expose `getState()`, `setState(partialState)`, and `subscribe(listener)`.
- In `contact.js`, when the form is submitted, increment `messagesSubmitted` via `setState` and display a "Thank you" confirmation.
- In `home.js`, read `messagesSubmitted` from the store and display it: "You have sent X messages."
- Update `lastVisitedPage` in the router whenever a route changes.
- Persist the store to `sessionStorage` so state survives page refreshes within the same tab.

**Key concepts:** Central state management, `subscribe` pattern, `sessionStorage`, cross-component communication via shared state.

### Milestone 5 — Accessibility & Polish

**Deliverables:**
- **Focus management:** After a route change, move focus to the `<h1>` of the new page. This ensures keyboard and screen reader users know the page has changed. Set `tabindex="-1"` on the heading so it can receive programmatic focus.
- **Route announcement:** Add a visually hidden `<div aria-live="polite">` to the shell. On every route change, update its text content to the new page title (e.g., "Navigated to About").
- **Skip link:** Add a "Skip to content" link at the top of the page that jumps focus to `#outlet`.
- **Document title:** Update `document.title` on every route change to reflect the current page.
- **Styling:** Responsive layout, transitions when swapping page content (CSS fade or slide), consistent spacing and typography.

**Key concepts:** Focus management in SPAs, `aria-live` announcements, skip navigation, `document.title`.

---

## Stretch Goals

1. **History API router.** Replace the hash-based router with one that uses `history.pushState` and the `popstate` event. URLs become clean paths like `/about` instead of `#/about`. Note: this requires a dev server that serves `index.html` for all paths.

2. **Page transitions.** Add CSS animations when pages enter and exit. Use a pattern where the exiting page fades out, the new page fades in, and the router waits for the animation to complete before removing the old DOM.

3. **Nested routes.** Extend the router to support nested routes (e.g., `/about/team`, `/about/history`). The About page would have its own sub-navigation and outlet.

4. **Route parameters.** Support dynamic segments in routes (e.g., `/post/:id`). The router extracts the parameter and passes it to the component function: `component({ id: "42" })`.

5. **Route guards.** Add a `beforeNavigate` hook that can prevent navigation (e.g., "You have unsaved changes. Are you sure you want to leave?").

---

## What You'll Practice

This project directly applies concepts from the following chapters:

| Chapter | Concept Applied |
|---|---|
| [Chapter 10 — DOM](../../docs/phase-02-browser-dom-state/ch-10-dom.md) | Creating DOM trees, replacing node content, `DocumentFragment`. |
| [Chapter 11 — Events](../../docs/phase-02-browser-dom-state/ch-11-events.md) | `hashchange` event, `click` event delegation, `submit` event. |
| [Chapter 12 — Forms](../../docs/phase-02-browser-dom-state/ch-12-forms.md) | Contact form with `FormData`, validation. |
| [Chapter 13 — State](../../docs/phase-02-browser-dom-state/ch-13-state.md) | Central state, `sessionStorage` persistence, state-driven rendering. |
| [Chapter 14 — Reactivity](../../docs/phase-02-browser-dom-state/ch-14-reactivity.md) | Subscribe/notify pattern in the store, reactive nav updates. |
| [Chapter 17 — Modules](../../docs/phase-03-professional/ch-17-modules.md) | Module-per-component architecture, barrel exports. |
| [Chapter 20 — Performance](../../docs/phase-03-professional/ch-20-performance.md) | Only rendering the active page, avoiding unnecessary DOM creation. |

---

## Starter Code

Find the starter template and completed solution at:

[`../../projects/project-03-mini-spa/`](../../projects/project-03-mini-spa/)

The `starter/` folder contains the HTML shell and empty module files with JSDoc comments describing each function's expected signature. The `solution/` folder contains a complete reference implementation.

---

## What's Next

The final project is the capstone: a production-style CRUD dashboard that combines routing, state management, authentication, and everything else from the entire course.
