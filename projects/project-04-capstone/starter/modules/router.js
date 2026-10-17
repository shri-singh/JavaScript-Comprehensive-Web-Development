// router.js — Hash-based client-side router
// Routes: #/login, #/dashboard, #/tasks/new, #/tasks/:id/edit

/**
 * Creates a hash-based router.
 *
 * Usage:
 *   const router = createRouter('#app');
 *   router.addRoute('#/login', () => LoginPage());
 *   router.addRoute('#/dashboard', () => DashboardPage(), { guard: requireAuth });
 *   router.start();
 *
 * @param {string} outletSelector - CSS selector for the element where pages render
 * @returns {object} Router instance with addRoute, navigate, start, and getParams methods
 */
export function createRouter(outletSelector) {
  // TODO: Store registered routes as an array of { pattern, handler, guard } objects
  // TODO: Store the outlet element reference

  /**
   * Register a route.
   * @param {string} pattern - Hash pattern, e.g. '#/tasks/:id/edit'
   * @param {Function} handler - Function that returns a DOM element or HTML string
   * @param {object} [options] - Optional config: { guard: Function }
   */
  function addRoute(pattern, handler, options = {}) {
    // TODO: Push { pattern, handler, guard: options.guard } onto the routes array
    // TODO: Convert pattern to a RegExp that captures :param segments
    //       e.g. '#/tasks/:id/edit' -> /^#\/tasks\/([^/]+)\/edit$/
  }

  /**
   * Navigate to a hash.
   * @param {string} hash
   */
  function navigate(hash) {
    // TODO: Set window.location.hash = hash
  }

  /**
   * Resolve the current hash against registered routes and render the matching page.
   */
  function resolve() {
    // TODO: Get the current hash (default to '#/login' if empty)
    // TODO: Iterate over routes and test each pattern against the hash
    // TODO: If a guard is defined, call it — if it returns false, skip (guard handles redirect)
    // TODO: Extract route params from the regex match
    // TODO: Call the handler with params
    // TODO: Render the returned element into the outlet
    // TODO: If no route matches, show a 404 message
  }

  /**
   * Start listening for hash changes.
   */
  function start() {
    // TODO: Listen for 'hashchange' event on window -> call resolve()
    // TODO: Call resolve() once to handle the initial hash
  }

  return {
    addRoute,
    navigate,
    resolve,
    start,
  };
}
