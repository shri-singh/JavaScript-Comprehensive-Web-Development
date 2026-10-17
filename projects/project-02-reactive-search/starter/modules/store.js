/**
 * store.js -- Minimal reactive store
 *
 * Implements a simple state container with a subscribe/notify pattern.
 * Inspired by libraries like Redux and Zustand, but much smaller.
 *
 * Usage:
 *   const store = createStore({ count: 0 });
 *   const unsubscribe = store.subscribe((state) => console.log(state));
 *   store.setState({ count: 1 }); // logs { count: 1 }
 *   unsubscribe(); // stops listening
 */

/**
 * Create a reactive store.
 *
 * @param {Object} initialState -- The starting state object.
 * @returns {{ getState: () => Object, setState: (partial: Object) => void, subscribe: (fn: Function) => Function }}
 */
export function createStore(initialState) {
  // TODO: Store the current state in a local variable (use spread to copy initialState).

  // TODO: Create a Set (or array) to hold subscriber functions.

  // TODO: Implement getState() -- returns the current state.

  // TODO: Implement setState(partialState) --
  //   1. Merge partialState into the current state using spread: { ...state, ...partialState }.
  //   2. Notify all subscribers by calling each one with the new state.

  // TODO: Implement subscribe(listener) --
  //   1. Add the listener to the subscribers set.
  //   2. Return an unsubscribe function that removes the listener.

  // TODO: Return { getState, setState, subscribe }.
}
