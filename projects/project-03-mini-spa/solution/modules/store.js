/**
 * store.js — Central State Store
 *
 * Exports: createStore(initialState)
 *
 * A minimal state management store following the observer pattern.
 * Components can read state with getState(), update it with setState(),
 * and subscribe to changes with subscribe().
 */

/**
 * Creates a new store with the given initial state.
 *
 * @param {Object} initialState - The starting state object.
 * @returns {{ getState: Function, setState: Function, subscribe: Function }}
 */
export function createStore(initialState = {}) {
  /** Current state — a shallow copy of the initial state. */
  let state = { ...initialState };

  /** Subscriber functions that are called on every state change. */
  const listeners = [];

  /**
   * Returns a shallow copy of the current state so external code
   * cannot mutate the store directly.
   *
   * @returns {Object} A copy of the state.
   */
  function getState() {
    return { ...state };
  }

  /**
   * Merges `partialState` into the current state and notifies all subscribers.
   *
   * @param {Object} partialState - An object with the keys/values to update.
   */
  function setState(partialState) {
    state = { ...state, ...partialState };
    listeners.forEach((listener) => listener(getState()));
  }

  /**
   * Registers a listener that will be called whenever state changes.
   *
   * @param {Function} listener - A callback receiving the new state.
   * @returns {Function} An unsubscribe function.
   */
  function subscribe(listener) {
    listeners.push(listener);

    // Return an unsubscribe function.
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  return { getState, setState, subscribe };
}
