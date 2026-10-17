/**
 * ui.js -- UI rendering functions
 *
 * Pure functions that create DOM elements based on the current
 * application state. These functions do NOT manage state -- they
 * simply translate data into a visual representation.
 */

const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id';

/**
 * Render book result cards into the results container.
 *
 * @param {Array} books -- Array of book objects from the API.
 * @param {HTMLElement} container -- The results container element.
 */
export function renderResults(books, container) {
  container.innerHTML = '';

  books.forEach((book) => {
    const card = document.createElement('article');
    card.className = 'book-card';

    // Cover image or placeholder
    if (book.coverId) {
      const img = document.createElement('img');
      img.className = 'book-card__cover';
      img.src = `${COVER_BASE_URL}/${book.coverId}-M.jpg`;
      img.alt = `Cover of ${book.title}`;
      img.loading = 'lazy';
      card.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'book-card__cover--placeholder';
      placeholder.textContent = '\uD83D\uDCD6';
      card.appendChild(placeholder);
    }

    // Card body
    const body = document.createElement('div');
    body.className = 'book-card__body';

    const title = document.createElement('h3');
    title.className = 'book-card__title';
    title.textContent = book.title;

    const author = document.createElement('p');
    author.className = 'book-card__author';
    author.textContent = book.author;

    const year = document.createElement('p');
    year.className = 'book-card__year';
    year.textContent = book.year ? `Published ${book.year}` : 'Year unknown';

    body.appendChild(title);
    body.appendChild(author);
    body.appendChild(year);
    card.appendChild(body);

    container.appendChild(card);
  });
}

/**
 * Show or hide the loading spinner.
 *
 * @param {HTMLElement} loadingEl -- The loading container element.
 * @param {boolean} show -- Whether to show or hide.
 */
export function renderLoading(loadingEl, show) {
  loadingEl.hidden = !show;
}

/**
 * Show an error message.
 *
 * @param {HTMLElement} errorEl -- The error container element.
 * @param {string|null} message -- The error message, or null to hide.
 */
export function renderError(errorEl, message) {
  if (message) {
    errorEl.hidden = false;
    errorEl.querySelector('.error__message').textContent = message;
  } else {
    errorEl.hidden = true;
  }
}

/**
 * Show the "no results" empty state.
 *
 * @param {HTMLElement} emptyEl -- The empty state container element.
 * @param {string} query -- The search query that produced no results.
 */
export function renderEmpty(emptyEl, query) {
  emptyEl.hidden = false;
  emptyEl.querySelector('.empty__message').textContent =
    `No results found for "${query}". Try a different search.`;
}

/**
 * Render pagination controls.
 *
 * @param {number} currentPage -- The current page number (1-based).
 * @param {number} totalPages -- Total number of pages.
 * @param {HTMLElement} container -- The pagination container.
 */
export function renderPagination(currentPage, totalPages, container) {
  container.innerHTML = '';

  if (totalPages <= 1) {
    container.hidden = true;
    return;
  }

  // Build the set of page numbers to display
  const pages = buildPageNumbers(currentPage, totalPages);

  // Previous button
  const prevBtn = createPageButton('Prev', currentPage - 1, currentPage === 1);
  container.appendChild(prevBtn);

  // Page numbers with ellipsis gaps
  let lastPage = 0;
  pages.forEach((page) => {
    if (page - lastPage > 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination__ellipsis';
      ellipsis.textContent = '\u2026';
      container.appendChild(ellipsis);
    }

    const btn = createPageButton(String(page), page, false);
    if (page === currentPage) {
      btn.classList.add('pagination__btn--active');
      btn.disabled = true;
    }
    container.appendChild(btn);
    lastPage = page;
  });

  // Next button
  const nextBtn = createPageButton('Next', currentPage + 1, currentPage === totalPages);
  container.appendChild(nextBtn);

  container.hidden = false;
}

// ---- Helpers ----

/**
 * Create a pagination button element.
 */
function createPageButton(label, page, disabled) {
  const btn = document.createElement('button');
  btn.className = 'pagination__btn';
  btn.textContent = label;
  btn.dataset.page = page;
  btn.disabled = disabled;
  return btn;
}

/**
 * Build a smart set of page numbers to show.
 * Always includes first page, last page, and a window around the current page.
 */
function buildPageNumbers(current, total) {
  const pages = new Set();

  // Always show first and last
  pages.add(1);
  pages.add(total);

  // Window around current page
  const windowSize = 2;
  for (let i = current - windowSize; i <= current + windowSize; i++) {
    if (i >= 1 && i <= total) {
      pages.add(i);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}
