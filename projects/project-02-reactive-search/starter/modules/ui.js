/**
 * ui.js -- UI rendering functions
 *
 * Pure functions that create and return DOM elements (or HTML strings)
 * based on the current application state. These functions do NOT manage
 * state -- they simply translate data into a visual representation.
 */

/**
 * Render book result cards into the results container.
 *
 * Each book card should display:
 *   - Cover image (from covers.openlibrary.org/b/id/<coverId>-M.jpg)
 *     or a placeholder if coverId is null.
 *   - Title
 *   - Author
 *   - Year (if available)
 *
 * @param {Array} books -- Array of book objects from the API.
 * @param {HTMLElement} container -- The results container element.
 */
export function renderResults(books, container) {
  // TODO: Clear the container.

  // TODO: For each book, create a card element with the class "book-card".
  //   - If book.coverId exists, create an <img> with class "book-card__cover"
  //     and src = `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`.
  //   - If no coverId, create a placeholder <div> with class "book-card__cover--placeholder".
  //   - Create a body <div> with class "book-card__body" containing:
  //     - A <h3> with class "book-card__title" for the title.
  //     - A <p> with class "book-card__author" for the author.
  //     - A <p> with class "book-card__year" for the year (show "Year unknown" if null).

  // TODO: Append each card to the container.
}

/**
 * Show or hide the loading spinner.
 *
 * @param {HTMLElement} loadingEl -- The loading container element.
 * @param {boolean} show -- Whether to show or hide.
 */
export function renderLoading(loadingEl, show) {
  // TODO: Set the `hidden` property on loadingEl based on `show`.
}

/**
 * Show an error message.
 *
 * @param {HTMLElement} errorEl -- The error container element.
 * @param {string|null} message -- The error message, or null to hide.
 */
export function renderError(errorEl, message) {
  // TODO: If message is truthy, show errorEl and set the message text
  //       in the .error__message element.
  //       If message is falsy, hide errorEl.
}

/**
 * Show the "no results" empty state.
 *
 * @param {HTMLElement} emptyEl -- The empty state container element.
 * @param {string} query -- The search query that produced no results.
 */
export function renderEmpty(emptyEl, query) {
  // TODO: Show emptyEl and set .empty__message text to something like
  //       `No results found for "${query}". Try a different search.`
}

/**
 * Render pagination controls.
 *
 * @param {number} currentPage -- The current page number (1-based).
 * @param {number} totalPages -- Total number of pages.
 * @param {HTMLElement} container -- The pagination container.
 */
export function renderPagination(currentPage, totalPages, container) {
  // TODO: Clear the container.

  // TODO: If totalPages <= 1, hide the container and return.

  // TODO: Create a "Previous" button (disabled if on page 1).

  // TODO: Create page number buttons. For large page counts, show ellipsis:
  //       e.g., 1 2 3 ... 8 9 10 ... 98 99 100
  //       Always show first page, last page, and a window around the current page.

  // TODO: Create a "Next" button (disabled if on the last page).

  // TODO: Each page button should have a `data-page` attribute with its page number.

  // TODO: Show the container.
}
