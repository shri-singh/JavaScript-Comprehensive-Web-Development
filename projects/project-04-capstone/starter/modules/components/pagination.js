// pagination.js — Pagination controls component

/**
 * Renders pagination controls with previous/next buttons and page numbers.
 *
 * @param {number} currentPage - The current active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback invoked with the new page number when user clicks
 * @returns {HTMLElement}
 */
export function Pagination(currentPage, totalPages, onPageChange) {
  const container = document.createElement('div');
  container.className = 'pagination';

  // TODO: If totalPages <= 1, return the empty container (no pagination needed)

  // TODO: Create a "Previous" button
  //   - Disabled if currentPage === 1
  //   - On click: call onPageChange(currentPage - 1)

  // TODO: Create page number buttons
  //   - For each page from 1 to totalPages, create a button
  //   - Add 'active' class to the current page button
  //   - On click: call onPageChange(pageNumber)
  //   - (Optional) For many pages, show ellipsis: 1 ... 4 5 6 ... 20

  // TODO: Create a "Next" button
  //   - Disabled if currentPage === totalPages
  //   - On click: call onPageChange(currentPage + 1)

  // TODO: (Optional) Add a "Page X of Y" info span

  return container;
}
