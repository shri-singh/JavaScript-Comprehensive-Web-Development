# Chapter 23 — Project 2: Reactive Search UI

## Learning Objectives

By the end of this project you will be able to:

- Build a search interface that fetches results from a public REST API.
- Implement debouncing to avoid flooding an API with requests on every keystroke.
- Use `AbortController` to cancel stale in-flight requests when the user types faster than the network responds.
- Render distinct UI states: loading, error, empty results, and populated results.
- Implement pagination (page-based or infinite scroll) to navigate large result sets.
- Organize asynchronous data-fetching logic into a dedicated API module, separate from rendering.

---

## Feature List

The finished application is a **book search interface** powered by the [Open Library Search API](https://openlibrary.org/dev/docs/api/search) (or any public API of your choice) with the following features:

| Feature | Description |
|---|---|
| Search input | A text input that triggers a search. Requests are debounced (300 ms) so the API is not called on every keystroke. |
| Request cancellation | When the user types a new query before the previous request completes, the stale request is aborted via `AbortController`. |
| Loading state | While a request is in flight, a spinner or skeleton UI is displayed. The search input remains usable. |
| Error state | Network failures and non-OK HTTP responses display a clear error message with a "Retry" button. |
| Empty state | When the API returns zero results, a friendly "No results found" message is shown. |
| Results list | Each result card displays the book title, author(s), first publish year, and cover thumbnail (if available). |
| Pagination | "Previous" and "Next" buttons (or infinite scroll) allow navigating through pages of results. The current page and total results are displayed. |
| Accessible markup | Results are rendered in a `<ul>` with meaningful text. The loading announcement uses `aria-live`. Focus management returns focus to the results region after page changes. |

---

## Architecture Overview

```
project-02-reactive-search/
  starter/
    index.html
    css/
      styles.css
    js/
      main.js              ← entry point, wires events to store
      store.js             ← central state + subscribe/dispatch pattern
      api.js               ← fetch wrapper, AbortController management
      utils/
        debounce.js        ← debounce utility function
      components/
        search-input.js    ← renders the search box
        results-list.js    ← renders the list of result cards
        result-card.js     ← renders a single result card
        pagination.js      ← renders page controls
        status-message.js  ← renders loading / error / empty states
```

### Key Design Decisions

1. **Store pattern.** `store.js` exports a lightweight store inspired by the Redux-style pattern from Chapter 14. It has `getState()`, `dispatch(action)`, and `subscribe(listener)` methods. Actions include `SEARCH_START`, `SEARCH_SUCCESS`, `SEARCH_ERROR`, and `SET_PAGE`.

2. **API module.** `api.js` exports a single function `searchBooks(query, page, signal)`. It builds the URL, attaches the `AbortSignal`, calls `fetch`, checks the response status, parses JSON, and returns a normalized result object. It never touches the DOM.

3. **Debounce utility.** `debounce.js` exports a reusable `debounce(fn, delay)` function. The search input's `input` event handler is wrapped in this debounce. Inside the debounced handler, any previous `AbortController` is aborted before a new one is created.

4. **Component functions.** Each component receives state (or a slice of state) and returns a DOM element. `results-list.js` maps over the results array and calls `result-card.js` for each item. `status-message.js` checks `state.loading`, `state.error`, and `state.results.length` to decide what to render.

---

## Milestones

### Milestone 1 — Search Input & API Module

**Deliverables:**
- Create `index.html` with a search input, a results container, and a status region.
- Write `api.js` with a `searchBooks(query, page, signal)` function that calls `https://openlibrary.org/search.json?q={query}&page={page}&limit=10`. Parse the JSON response and return `{ totalResults, books }` where each book has `title`, `authors`, `firstPublishYear`, and `coverId`.
- In `main.js`, add an `input` event listener on the search box that calls `searchBooks` and logs the results to the console.
- Confirm the API call works and data is returned.

**Key concepts:** Fetch API, JSON parsing, URL construction, `async`/`await`.

### Milestone 2 — Debounce & AbortController

**Deliverables:**
- Write `debounce.js`. The function should return a wrapper that delays invocation by `delay` ms and resets the timer if called again before it fires.
- Wrap the search handler from Milestone 1 with `debounce(handler, 300)`.
- Create an `AbortController` before each fetch call. Store it in a module-level variable. Before creating a new controller, call `abort()` on the previous one. Pass `controller.signal` to `searchBooks`.
- In `api.js`, catch `AbortError` and silently ignore it (it is expected when the user types quickly). Rethrow all other errors.
- Test by typing quickly and observing in the Network tab that stale requests are cancelled.

**Key concepts:** Debouncing, `AbortController`, `AbortSignal`, `DOMException` with name `"AbortError"`.

### Milestone 3 — State Store & UI Rendering

**Deliverables:**
- Write `store.js` with the store pattern. State shape:
  ```js
  {
    query: "",
    page: 1,
    totalResults: 0,
    results: [],
    loading: false,
    error: null
  }
  ```
- Dispatch `SEARCH_START` (sets `loading: true`, `error: null`), `SEARCH_SUCCESS` (sets results, totalResults, `loading: false`), and `SEARCH_ERROR` (sets error message, `loading: false`).
- Subscribe a `render()` function to the store. On every state change, re-render the results region.
- Build `results-list.js` and `result-card.js`. Each card shows the book title, author(s), year, and a cover image (use `https://covers.openlibrary.org/b/id/{coverId}-M.jpg` or a placeholder).
- Build `status-message.js` to render a loading spinner, an error message with a "Retry" button, or a "No results" message depending on state.

**Key concepts:** Store / dispatch / subscribe pattern, conditional rendering, state-driven UI.

### Milestone 4 — Pagination

**Deliverables:**
- Build `pagination.js`. Show "Page X of Y" with "Previous" and "Next" buttons. Disable "Previous" on page 1 and "Next" on the last page.
- Dispatch `SET_PAGE` when a pagination button is clicked. The store updates `page`, then the search is re-triggered with the new page number.
- After results load for a new page, move focus to the top of the results list for keyboard users.
- Add an `aria-live="polite"` region that announces "Showing results X to Y of Z" after each page load.

**Key concepts:** Pagination logic, focus management, `aria-live` announcements, derived state (computing page count from total results).

### Milestone 5 — Error Handling & Polish

**Deliverables:**
- Handle network offline: detect `TypeError` from `fetch` (network error) and display "You appear to be offline."
- Handle HTTP errors: if the API returns a non-2xx status, display "Something went wrong. Please try again."
- The "Retry" button should re-dispatch the last search action.
- Add keyboard support: pressing `Enter` in the search input triggers an immediate search (bypassing debounce).
- Style the application: responsive layout, card grid for results, focus-visible outlines, smooth loading transitions.
- Clear results when the search input is emptied.

**Key concepts:** Error classification, retry logic, defensive programming, progressive enhancement.

---

## Stretch Goals

1. **Search history.** Store the last 10 search queries in `localStorage`. Display them as a dropdown below the search input. Clicking a history item populates the input and triggers a search.

2. **Keyboard navigation.** Allow arrow-key navigation through the results list. Pressing `Enter` on a focused result opens its Open Library page in a new tab.

3. **Infinite scroll.** Replace pagination buttons with an `IntersectionObserver` that loads the next page when the user scrolls near the bottom of the results list.

4. **Bookmarks.** Let the user "save" a book to a bookmarks list stored in `localStorage`. Add a bookmarks page that displays saved books.

5. **Multiple API sources.** Add a dropdown to switch between APIs (e.g., Open Library, Google Books, or a mock JSON file). The API module should abstract the source behind a common interface.

---

## What You'll Practice

This project directly applies concepts from the following chapters:

| Chapter | Concept Applied |
|---|---|
| [Chapter 11 — Events](../../docs/phase-02-browser-dom-state/ch-11-events.md) | `input` events, event delegation on dynamic result cards. |
| [Chapter 13 — State](../../docs/phase-02-browser-dom-state/ch-13-state.md) | Central state object, state-driven rendering. |
| [Chapter 14 — Reactivity](../../docs/phase-02-browser-dom-state/ch-14-reactivity.md) | Store pattern with `dispatch` and `subscribe`. |
| [Chapter 15 — Async](../../docs/phase-02-browser-dom-state/ch-15-async.md) | `async`/`await`, `AbortController`, error handling in async code. |
| [Chapter 16 — HTTP + Fetch](../../docs/phase-02-browser-dom-state/ch-16-http-fetch.md) | Fetch API, HTTP status codes, JSON parsing, CORS. |
| [Chapter 17 — Modules](../../docs/phase-03-professional/ch-17-modules.md) | ES module imports/exports, separating API logic from UI. |
| [Chapter 20 — Performance](../../docs/phase-03-professional/ch-20-performance.md) | Debouncing, minimizing unnecessary DOM updates, request cancellation. |

---

## API Reference

This project uses the **Open Library Search API**. No API key is required.

| Endpoint | `https://openlibrary.org/search.json` |
|---|---|
| Method | `GET` |
| Parameters | `q` (search query), `page` (1-indexed), `limit` (results per page) |
| Response fields | `numFound` (total results), `docs` (array of book objects) |
| Book fields | `title`, `author_name` (array), `first_publish_year`, `cover_i` (cover ID) |
| Cover image URL | `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg` |
| Rate limits | Be respectful — debounce and cancel stale requests. |

If the Open Library API is unavailable, you can substitute any public API that supports text search and pagination, or create a local `books.json` mock file.

---

## Starter Code

Find the starter template and completed solution at:

[`../../projects/project-02-reactive-search/`](../../projects/project-02-reactive-search/)

The `starter/` folder contains the HTML shell and empty module files with JSDoc comments describing each function's expected signature. The `solution/` folder contains a complete reference implementation.

---

## What's Next

With API integration and reactive state management in place, the next project builds a full single-page application with client-side routing — no framework required.
