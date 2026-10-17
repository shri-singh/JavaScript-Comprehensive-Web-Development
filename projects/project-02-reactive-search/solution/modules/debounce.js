/**
 * debounce.js -- Debounce utility
 *
 * Returns a new function that delays invoking `fn` until after `delay`
 * milliseconds have elapsed since the last time the debounced function
 * was called.
 *
 * The returned function also has a `.cancel()` method to clear any
 * pending invocation.
 */

/**
 * Create a debounced version of a function.
 *
 * @param {Function} fn    -- The function to debounce.
 * @param {number}   delay -- Delay in milliseconds.
 * @returns {Function} A debounced function with a `.cancel()` method.
 */
export function debounce(fn, delay) {
  let timeoutId = null;

  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
