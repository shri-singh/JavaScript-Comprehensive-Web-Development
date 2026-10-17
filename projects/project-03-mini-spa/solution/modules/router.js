/**
 * router.js — Hash-based SPA Router
 *
 * Exports: createRouter(outletSelector)
 *
 * The router listens for hash changes in the URL and swaps the content
 * of the outlet element with the component that matches the current route.
 */

/**
 * Creates a new hash-based router.
 *
 * @param {string} outletSelector - CSS selector for the element where
 *                                  page components will be rendered.
 * @returns {{ addRoute: Function, navigate: Function, start: Function }}
 */
export function createRouter(outletSelector) {
  const outlet = document.querySelector(outletSelector);

  if (!outlet) {
    throw new Error(`Router outlet element "${outletSelector}" not found in the DOM.`);
  }

  /** @type {Map<string, Function>} path -> component function */
  const routes = new Map();

  /**
   * Registers a route.
   *
   * @param {string}   path      - Route path (e.g. '/', '/about', or '*' for 404).
   * @param {Function} component - A function that returns a DOM element.
   */
  function addRoute(path, component) {
    routes.set(path, component);
  }

  /**
   * Programmatically navigate to a path by setting the hash.
   *
   * @param {string} path - The path to navigate to (e.g. '/about').
   */
  function navigate(path) {
    window.location.hash = `#${path}`;
  }

  /**
   * Reads the current hash, resolves the matching component, and renders
   * it into the outlet element. Also updates the active nav link.
   */
  function render() {
    // 1. Extract the path from the hash — default to '/' if empty.
    const hash = window.location.hash.slice(1) || '/';

    // 2. Find the component for this path, falling back to the '*' catch-all.
    const component = routes.get(hash) || routes.get('*');

    if (!component) {
      outlet.innerHTML = '<p>Page not found.</p>';
      return;
    }

    // 3. Call the component function to get a DOM element.
    const pageElement = component();

    // 4. Clear the outlet and append the new page.
    outlet.innerHTML = '';
    outlet.appendChild(pageElement);

    // 5. Re-trigger the fade-in animation.
    outlet.classList.remove('page-transition');
    // Force a reflow so the browser re-starts the animation.
    void outlet.offsetWidth;
    outlet.classList.add('page-transition');

    // 6. Update the active state on nav links.
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      const linkPath = link.getAttribute('data-path');
      if (linkPath === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /**
   * Starts the router: listens for hash changes and renders the initial route.
   */
  function start() {
    window.addEventListener('hashchange', render);
    // Render the page that matches the current URL right away.
    render();
  }

  return { addRoute, navigate, start };
}
