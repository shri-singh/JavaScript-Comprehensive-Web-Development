/**
 * main.js -- Application entry point
 *
 * Wires together all the modules:
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

// ---- Constants ----
const RESULTS_PER_PAGE = 12;
const DEBOUNCE_DELAY = 400;

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
const store = createStore({
  query: '',
  books: [],
  totalResults: 0,
  page: 1,
  loading: false,
  error: null,
});

// ---- AbortController ----
let currentController = null;

// ---- Search Function ----
async function performSearch(query, page = 1) {
  if (!query.trim()) {
    store.setState({
      books: [],
      totalResults: 0,
      page: 1,
      loading: false,
      error: null,
    });
    return;
  }

  // Abort any previous in-flight request
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();
  const { signal } = currentController;

  store.setState({ loading: true, error: null });

  try {
    const result = await searchBooks(query, page, signal);
    store.setState({
      books: result.books,
      totalResults: result.totalResults,
      page: result.page,
      loading: false,
    });
  } catch (err) {
    // Ignore aborted requests -- they are intentional
    if (err.name === 'AbortError') {
      return;
    }
    store.setState({
      books: [],
      totalResults: 0,
      loading: false,
      error: err.message || 'Something went wrong. Please try again.',
    });
  }
}

// ---- Debounced Handler ----
const debouncedSearch = debounce((query) => {
  performSearch(query, 1);
}, DEBOUNCE_DELAY);

// ---- Render Function ----
function render(state) {
  const { query, books, totalResults, page, loading, error } = state;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  // Loading
  renderLoading(loadingEl, loading);

  if (loading) {
    errorEl.hidden = true;
    emptyEl.hidden = true;
    resultsInfoEl.hidden = true;
    resultsContainer.innerHTML = '';
    paginationEl.hidden = true;
    return;
  }

  // Error
  if (error) {
    renderError(errorEl, error);
    emptyEl.hidden = true;
    resultsInfoEl.hidden = true;
    resultsContainer.innerHTML = '';
    paginationEl.hidden = true;
    return;
  }

  errorEl.hidden = true;

  // Empty state (query exists but no results)
  if (query && books.length === 0) {
    renderEmpty(emptyEl, query);
    resultsInfoEl.hidden = true;
    resultsContainer.innerHTML = '';
    paginationEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;

  // Results
  if (books.length > 0) {
    resultsInfoEl.hidden = false;
    const start = (page - 1) * RESULTS_PER_PAGE + 1;
    const end = start + books.length - 1;
    resultsInfoEl.querySelector('.results-info__text').textContent =
      `Showing ${start}\u2013${end} of ${totalResults.toLocaleString()} results for "${query}"`;

    renderResults(books, resultsContainer);
    renderPagination(page, totalPages, paginationEl);
    return;
  }

  // Initial blank state
  resultsInfoEl.hidden = true;
  resultsContainer.innerHTML = '';
  paginationEl.hidden = true;
}

// ---- Subscribe to Store ----
store.subscribe(render);

// ---- Event Listeners ----

// Search input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  store.setState({ query });
  debouncedSearch(query);
});

// Retry button
retryBtn.addEventListener('click', () => {
  const { query, page } = store.getState();
  if (query) {
    performSearch(query, page);
  }
});

// Pagination (event delegation)
paginationEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.pagination__btn');
  if (!btn || btn.disabled) return;

  const page = Number(btn.dataset.page);
  if (page > 0) {
    const { query } = store.getState();
    performSearch(query, page);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
