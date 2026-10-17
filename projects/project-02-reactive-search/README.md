# Project 2: Reactive Search UI

A reactive book search application built with vanilla JavaScript. Search the Open Library catalog with real-time results, debounced input, and request cancellation.

## Features

- **Search with Debounce** -- Waits for the user to stop typing before sending a request, reducing unnecessary API calls.
- **AbortController for Stale Requests** -- Cancels in-flight requests when a new search is triggered, preventing race conditions and stale data from overwriting newer results.
- **Loading / Error / Empty States** -- Clear visual feedback for every stage of the request lifecycle: a spinner while loading, an error message on failure, and a friendly notice when no results are found.
- **Results with Pagination** -- Displays book results in a card-based grid with page controls to navigate through large result sets.
- **Open Library API** -- Fetches live data from the [Open Library Search API](https://openlibrary.org/search.json?q=...).

## Architecture

```
main.js                 Entry point -- wires modules together
modules/
  api.js                API layer (fetch + AbortSignal support)
  store.js              Minimal reactive store (getState / setState / subscribe)
  debounce.js           Debounce utility with cancel method
  ui.js                 Pure render functions (results, loading, error, empty, pagination)
```

**Data flow:**

1. User types in the search input.
2. A debounced handler fires after a short delay.
3. Any pending fetch is aborted via `AbortController`.
4. A new fetch is made to the Open Library API.
5. The store is updated with the response (or error).
6. Subscribers re-render the UI based on the new state.

## Milestones

| # | Milestone | Key Concepts |
|---|-----------|-------------|
| 1 | Build the reactive store | Closures, the observer pattern, immutable state updates |
| 2 | Implement debounce | `setTimeout` / `clearTimeout`, higher-order functions |
| 3 | Connect the API layer | `fetch`, `AbortController`, `AbortSignal`, async/await |
| 4 | Render UI from state | DOM creation, template rendering, conditional UI |
| 5 | Add pagination | Derived state (total pages), event delegation |

## How to Run

```bash
# Install dependencies
npm install

# Run the completed solution
npm run dev

# Run the starter (for working through the project yourself)
npm run dev:starter
```

The dev server will open at `http://localhost:5173` (or the next available port).

## API Reference

**Open Library Search API**

```
GET https://openlibrary.org/search.json?q=<query>&page=<page>&limit=12
```

Response shape (relevant fields):

```json
{
  "numFound": 1234,
  "start": 0,
  "docs": [
    {
      "title": "Book Title",
      "author_name": ["Author Name"],
      "first_publish_year": 2000,
      "cover_i": 123456,
      "key": "/works/OL12345W"
    }
  ]
}
```

Book cover images are available at:

```
https://covers.openlibrary.org/b/id/<coverId>-M.jpg
```
