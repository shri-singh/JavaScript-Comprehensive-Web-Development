/**
 * store.js -- Minimal reactive store
 *
 * Implements a simple state container with a subscribe/notify pattern.
 * Inspired by libraries like Redux and Zustand, but much smaller.
 */

/**
 * Create a reactive store.
 *
 * @param {Object} initialState -- The starting state object.
 * @returns {{ getState: () => Object, setState: (partial: Object) => void, subscribe: (fn: Function) => Function }}
 */
export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(partialState) {
    state = { ...state, ...partialState };
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}
