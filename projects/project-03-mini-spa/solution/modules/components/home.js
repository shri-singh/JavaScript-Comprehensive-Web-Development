/**
 * home.js — Home Page Component
 *
 * Exports: HomePage(store)
 *
 * Displays a welcoming page with a visit counter and navigation cards.
 */

/**
 * Creates the home page DOM element.
 *
 * @param {Object} store - The application store.
 * @returns {HTMLElement}
 */
export function HomePage(store) {
  const page = document.createElement('div');
  page.className = 'page';

  const { visits } = store.getState();

  page.innerHTML = `
    <h1>Welcome to Mini SPA</h1>
    <p class="subtitle">
      A single-page application built entirely with vanilla JavaScript &mdash;
      no frameworks, no libraries, just ES modules and the DOM API.
    </p>

    <div class="stat-badge">
      Page visits: <strong>${visits}</strong>
    </div>

    <div class="card-grid">
      <a href="#/about" class="card" aria-label="Go to About page">
        <h3>About</h3>
        <p>Learn how this mini SPA works under the hood and what techniques it demonstrates.</p>
      </a>
      <a href="#/contact" class="card" aria-label="Go to Contact page">
        <h3>Contact</h3>
        <p>Try the contact form &mdash; messages are stored in the central store and persist across page navigations.</p>
      </a>
      <a href="#/nowhere" class="card" aria-label="See the 404 page">
        <h3>404 Page</h3>
        <p>Click here to see how the router handles unknown routes with a friendly fallback page.</p>
      </a>
    </div>
  `;

  return page;
}
