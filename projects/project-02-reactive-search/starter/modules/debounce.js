/**
 * debounce.js -- Debounce utility
 *
 * Returns a new function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last time the debounced function
 * was called.
 *
 * The returned function also has a `.cancel()` method to clear any
 * pending invocation.
 *
 * Usage:
 *   const debouncedSearch = debounce(search, 400);
 *   input.addEventListener('input', () => debouncedSearch(input.value));
 *   // Later, if needed:
 *   debouncedSearch.cancel();
 */

/**
 * Create a debounced version of a function.
 *
 * @param {Function} fn    -- The function to debounce.
 * @param {number}   delay -- Delay in milliseconds.
 * @returns {Function} A debounced function with a `.cancel()` method.
 */
export function debounce(fn, delay) {
  // TODO: Declare a variable to hold the timeout ID.

  // TODO: Create the debounced function that:
  //   1. Clears any existing timeout.
  //   2. Sets a new timeout that calls fn(...args) after `delay` ms.

  // TODO: Attach a cancel() method to the debounced function
  //   that clears the pending timeout.

  // TODO: Return the debounced function.
}
