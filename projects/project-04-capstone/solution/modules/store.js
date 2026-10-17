// store.js — Centralized state management (observable store pattern)

/**
 * Creates a centralized store with observable state.
 *
 * @param {object} initialState - The initial state object
 * @returns {object} Store with getState, setState, subscribe methods
 */
export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = [];

  /**
   * Get the current state (shallow copy).
   * @returns {object}
   */
  function getState() {
    return { ...state };
  }

  /**
   * Update the state by merging in partial updates.
   * Notifies all subscribers after the update.
   *
   * @param {object} updates - Partial state to merge
   */
  function setState(updates) {
    state = { ...state, ...updates };
    listeners.forEach((listener) => listener(state));
  }

  /**
   * Subscribe to state changes.
   *
   * @param {Function} listener - Callback invoked with the new state on each change
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
