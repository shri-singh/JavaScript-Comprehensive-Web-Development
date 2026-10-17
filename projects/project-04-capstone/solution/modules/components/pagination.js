// pagination.js — Pagination controls component

/**
 * Renders pagination controls with previous/next buttons and page numbers.
 *
 * @param {number} currentPage - The current active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback invoked with the new page number
 * @returns {HTMLElement}
 */
export function Pagination(currentPage, totalPages, onPageChange) {
  const container = document.createElement('div');
  container.className = 'pagination';

  // No pagination needed for 0 or 1 page
  if (totalPages <= 1) {
    return container;
  }

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-outline';
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  });
  container.appendChild(prevBtn);

  // Page number buttons
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  for (const item of pageNumbers) {
    if (item === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'btn btn-outline';
      ellipsis.textContent = '...';
      ellipsis.style.cursor = 'default';
      ellipsis.style.pointerEvents = 'none';
      container.appendChild(ellipsis);
    } else {
      const pageBtn = document.createElement('button');
      pageBtn.className = `btn btn-outline${item === currentPage ? ' active' : ''}`;
      pageBtn.textContent = item;
      pageBtn.addEventListener('click', () => {
        if (item !== currentPage) {
          onPageChange(item);
        }
      });
      container.appendChild(pageBtn);
    }
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-outline';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  });
  container.appendChild(nextBtn);

  // Page info
  const info = document.createElement('span');
  info.className = 'pagination-info';
  info.textContent = `Page ${currentPage} of ${totalPages}`;
  container.appendChild(info);

  return container;
}

/**
 * Calculate which page numbers to show with ellipsis for large page counts.
 *
 * @param {number} current
 * @param {number} total
 * @returns {Array<number|string>}
 */
function getPageNumbers(current, total) {
  // If 7 or fewer pages, show all
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show first page
  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  // Show pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  // Always show last page
  pages.push(total);

  return pages;
}
