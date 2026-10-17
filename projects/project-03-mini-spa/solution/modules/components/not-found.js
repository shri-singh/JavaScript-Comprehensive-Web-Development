/**
 * not-found.js — 404 Not Found Page Component
 *
 * Exports: NotFoundPage()
 *
 * Displays a friendly 404 page with a link back to the home page.
 */

/**
 * Creates the 404 page DOM element.
 *
 * @returns {HTMLElement}
 */
export function NotFoundPage() {
  const page = document.createElement('div');
  page.className = 'page not-found';

  page.innerHTML = `
    <div class="error-code">404</div>
    <h1>Page Not Found</h1>
    <p>
      The page you are looking for does not exist or has been moved.
      Check the URL or head back to the home page.
    </p>
    <a href="#/" class="btn btn-primary">Go Back Home</a>
  `;

  return page;
}
