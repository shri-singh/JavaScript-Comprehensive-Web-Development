// router.js — Hash-based client-side router with route guards

/**
 * Creates a hash-based router.
 *
 * @param {string} outletSelector - CSS selector for the element where pages render
 * @returns {object} Router instance
 */
export function createRouter(outletSelector) {
  const routes = [];
  const outlet = document.querySelector(outletSelector);

  /**
   * Register a route.
   *
   * @param {string} pattern - Hash pattern, e.g. '#/tasks/:id/edit'
   * @param {Function} handler - Returns a DOM element to render
   * @param {object} [options] - { guard: Function }
   */
  function addRoute(pattern, handler, options = {}) {
    // Convert :param segments into named capture groups
    const paramNames = [];
    const regexStr = pattern
      .replace(/:[a-zA-Z]+/g, (match) => {
        paramNames.push(match.slice(1)); // remove the leading ':'
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp('^' + regexStr + '$');

    routes.push({
      pattern,
      regex,
      paramNames,
      handler,
      guard: options.guard || null,
    });
  }

  /**
   * Navigate to a hash.
   * @param {string} hash
   */
  function navigate(hash) {
    window.location.hash = hash;
  }

  /**
   * Resolve the current hash and render the matching page.
   */
  function resolve() {
    const hash = window.location.hash || '#/login';

    for (const route of routes) {
      const match = hash.match(route.regex);
      if (!match) continue;

      // Run the guard if present
      if (route.guard && !route.guard()) {
        return; // guard handled the redirect
      }

      // Extract params
      const params = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1]);
      });

      // Call handler and render
      const element = route.handler(params);

      if (!outlet) return;
      outlet.innerHTML = '';

      if (element instanceof HTMLElement) {
        outlet.appendChild(element);
      } else if (typeof element === 'string') {
        outlet.innerHTML = element;
      }

      return;
    }

    // No route matched — show 404
    if (outlet) {
      outlet.innerHTML = '';
      const notFound = document.createElement('div');
      notFound.className = 'empty-state';
      const h3 = document.createElement('h3');
      h3.textContent = 'Page Not Found';
      const p = document.createElement('p');
      p.textContent = 'The page you are looking for does not exist.';
      notFound.appendChild(h3);
      notFound.appendChild(p);
      outlet.appendChild(notFound);
    }
  }

  /**
   * Start listening for hash changes.
   */
  function start() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return {
    addRoute,
    navigate,
    resolve,
    start,
  };
}
