// store.js — Centralized state management (observable store pattern)

/**
 * Creates a centralized store with observable state.
 *
 * Usage:
 *   const store = createStore({ count: 0 });
 *   store.subscribe((state) => console.log('State changed:', state));
 *   store.setState({ count: 1 });
 *   store.getState().count; // 1
 *
 * @param {object} initialState - The initial state object
 * @returns {object} Store with getState, setState, subscribe methods
 */
export function createStore(initialState = {}) {
  // TODO: Create a local copy of the state (use spread or structuredClone)
  // TODO: Create a listeners array to hold subscriber callbacks

  /**
   * Get the current state (return a shallow copy to prevent direct mutation).
   * @returns {object}
   */
  function getState() {
    // TODO: Return a copy of the state
  }

  /**
   * Update the state by merging in partial updates.
   * Notifies all subscribers after the update.
   *
   * @param {object} updates - Partial state to merge
   */
  function setState(updates) {
    // TODO: Merge updates into the current state (shallow merge)
    // TODO: Notify all listeners with the new state
  }

  /**
   * Subscribe to state changes.
   *
   * @param {Function} listener - Callback invoked with the new state on each change
   * @returns {Function} Unsubscribe function
   */
  function subscribe(listener) {
    // TODO: Add the listener to the listeners array
    // TODO: Return a function that removes this listener (unsubscribe)
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
