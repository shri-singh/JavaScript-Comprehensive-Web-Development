/**
 * main.js -- Application entry point
 *
 * This file wires together all the modules:
 *   - Store for state management
 *   - Debounce for rate-limiting search input
 *   - API for fetching book data
 *   - UI for rendering results, loading, error, and empty states
 *
 * Key concepts:
 *   - AbortController to cancel stale fetch requests
 *   - Reactive rendering via store subscriptions
 */

import { createStore } from './modules/store.js';
import { searchBooks } from './modules/api.js';
import { debounce } from './modules/debounce.js';
import {
  renderResults,
  renderLoading,
  renderError,
  renderEmpty,
  renderPagination,
} from './modules/ui.js';

// ---- DOM Elements ----
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty');
const resultsInfoEl = document.getElementById('results-info');
const paginationEl = document.getElementById('pagination');
const retryBtn = document.getElementById('retry-btn');

// ---- Store ----
// TODO: Create the store with the initial state:
//   { query: '', books: [], totalResults: 0, page: 1, loading: false, error: null }

// ---- AbortController ----
// TODO: Declare a variable to hold the current AbortController instance.
//       Each new search should abort the previous in-flight request.

// ---- Search Function ----
// TODO: Implement performSearch(query, page)
//   1. If query is empty, reset state and return.
//   2. Abort any previous request using the AbortController.
//   3. Create a new AbortController.
//   4. Set loading state to true and clear any previous error.
//   5. Call searchBooks(query, page, signal).
//   6. On success, update the store with books, totalResults, and page.
//   7. On failure, check if the error is an AbortError (ignore it).
//      Otherwise, set the error message in the store.
//   8. Always set loading to false when done.

// ---- Debounced Handler ----
// TODO: Create a debounced version of performSearch (e.g. 400ms delay).
//       The debounced function should be called from the input event listener.

// ---- Render Function ----
// TODO: Implement render(state)
//   This function is called whenever the store state changes.
//   Based on the current state, show/hide the appropriate UI sections:
//     - If loading: show loading spinner, hide everything else.
//     - If error:   show error message, hide everything else.
//     - If no books and query exists: show empty state.
//     - If books exist: show results grid, results info, and pagination.
//     - Otherwise: hide everything (initial blank state).

// ---- Subscribe to Store ----
// TODO: Subscribe the render function to the store so it runs on every state change.

// ---- Event Listeners ----
// TODO: Add an 'input' event listener to the search input.
//       On each input event:
//         1. Get the trimmed value.
//         2. Update the store's query.
//         3. Call the debounced search handler.

// TODO: Add a click listener to the retry button to re-run the current search.

// TODO: Handle pagination clicks.
//       Listen for clicks on pagination buttons (use event delegation on paginationEl).
//       When a page button is clicked, call performSearch with the selected page.
