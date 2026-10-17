/**
 * router.js — Hash-based SPA Router
 *
 * Exports: createRouter(outletSelector)
 *
 * The router listens for hash changes in the URL and swaps the content
 * of the outlet element with the component that matches the current route.
 *
 * Example usage:
 *   const router = createRouter('#app');
 *   router.addRoute('/', HomePage);
 *   router.addRoute('/about', AboutPage);
 *   router.addRoute('*', NotFoundPage);
 *   router.start();
 */

/**
 * Creates a new hash-based router.
 *
 * @param {string} outletSelector - CSS selector for the element where
 *                                  page components will be rendered.
 * @returns {{ addRoute: Function, navigate: Function, start: Function }}
 */
export function createRouter(outletSelector) {
  // TODO: Get a reference to the outlet DOM element using outletSelector.

  // TODO: Create a Map (or plain object) to store path → component mappings.

  /**
   * addRoute(path, component)
   *
   * Registers a route. `path` is a string like '/' or '/about'.
   * Use '*' for a catch-all (404) route.
   * `component` is a function that returns a DOM element.
   *
   * TODO: Store the path and component in your routes collection.
   */
  function addRoute(path, component) {
    // TODO: Add the route
  }

  /**
   * navigate(path)
   *
   * Programmatically navigate to a path by setting window.location.hash.
   *
   * TODO: Set the hash to the given path (e.g., '#/about').
   */
  function navigate(path) {
    // TODO: Change the hash
  }

  /**
   * render()
   *
   * Called whenever the hash changes. Reads the current hash, finds the
   * matching component, and replaces the outlet's content.
   *
   * TODO:
   *  1. Read window.location.hash and extract the path (strip the '#').
   *     If the hash is empty, default to '/'.
   *  2. Look up the path in the routes Map.
   *     - If found, call the component function to get a DOM element.
   *     - If not found, use the '*' (catch-all) route, or show a fallback.
   *  3. Clear the outlet element and append the new component element.
   *  4. Update the active state on nav links:
   *     - Query all '.nav-link' elements.
   *     - Remove the 'active' class from all of them.
   *     - Add the 'active' class to the one whose data-path matches.
   *  5. (Bonus) Re-trigger the page-transition animation on the outlet.
   */
  function render() {
    // TODO: Implement rendering logic
  }

  /**
   * start()
   *
   * Kick-starts the router.
   *
   * TODO:
   *  1. Add an event listener for the 'hashchange' event that calls render().
   *  2. Call render() once immediately to handle the initial URL.
   */
  function start() {
    // TODO: Listen for hashchange and render the initial route
  }

  return { addRoute, navigate, start };
}
