/**
 * store.js — Central State Store
 *
 * Exports: createStore(initialState)
 *
 * A minimal state management store following the observer pattern.
 * Components can read state with getState(), update it with setState(),
 * and subscribe to changes with subscribe().
 *
 * Example usage:
 *   const store = createStore({ count: 0 });
 *   store.subscribe((state) => console.log('State changed:', state));
 *   store.setState({ count: 1 });
 *   console.log(store.getState().count); // 1
 */

/**
 * Creates a new store with the given initial state.
 *
 * @param {Object} initialState - The starting state object.
 * @returns {{ getState: Function, setState: Function, subscribe: Function }}
 */
export function createStore(initialState = {}) {
  // TODO: Create a variable to hold the current state (copy initialState).

  // TODO: Create an array to hold subscriber (listener) functions.

  /**
   * getState()
   *
   * Returns a shallow copy of the current state so callers cannot
   * mutate the store directly.
   *
   * TODO: Return a copy of the state object (e.g., using spread syntax).
   */
  function getState() {
    // TODO: Return a copy of the current state
  }

  /**
   * setState(partialState)
   *
   * Merges `partialState` into the current state (like React's setState)
   * and notifies all subscribers.
   *
   * TODO:
   *  1. Merge partialState into the current state using Object.assign or spread.
   *  2. Loop through all subscriber functions and call each one with the new state.
   */
  function setState(partialState) {
    // TODO: Merge and notify
  }

  /**
   * subscribe(listener)
   *
   * Registers a function that will be called whenever state changes.
   * Returns an unsubscribe function.
   *
   * TODO:
   *  1. Push the listener function onto the subscribers array.
   *  2. Return a function that, when called, removes this listener
   *     from the array (so the caller can unsubscribe later).
   */
  function subscribe(listener) {
    // TODO: Add listener and return unsubscribe function
  }

  return { getState, setState, subscribe };
}
