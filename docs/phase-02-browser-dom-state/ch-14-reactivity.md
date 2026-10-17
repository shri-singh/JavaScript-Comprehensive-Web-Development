# Chapter 14 — Reactivity Patterns

## Learning Objectives

By the end of this chapter you will be able to:

- Explain the publish/subscribe (pub/sub) pattern and implement it from scratch.
- Describe the observer pattern and compare it with pub/sub.
- Build a simple store with `dispatch`, `getState`, and `subscribe` methods inspired by Redux.
- Use `Proxy` to create reactive state that automatically notifies subscribers on mutation.
- Understand the concept of signals and fine-grained reactivity as used in modern frameworks.
- Compare reactivity patterns and choose the right one for a given use case.
- Recognize the trade-offs between manual re-rendering and automatic reactivity.

---

## 14.1 Why Reactivity?

In Chapter 13 we built state-driven UIs by calling `render()` manually after every state change. This works, but it has drawbacks:

- **Easy to forget** — if you mutate state and forget to call `render()`, the UI is out of sync.
- **All-or-nothing** — the entire UI re-renders even when only one field changed.
- **Tightly coupled** — the code that changes state must know about the rendering function.

Reactivity solves these problems by making state changes **automatically propagate** to interested consumers. When state changes, listeners are notified without the caller needing to know who is listening.

---

## 14.2 The Publish/Subscribe Pattern

Pub/sub decouples **publishers** (who emit events) from **subscribers** (who react to events) through a central event bus:

```js
function createEventBus() {
  const listeners = new Map();

  return {
    on(event, callback) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);

      // Return an unsubscribe function
      return () => listeners.get(event).delete(callback);
    },

    emit(event, data) {
      if (!listeners.has(event)) return;
      for (const callback of listeners.get(event)) {
        callback(data);
      }
    },
  };
}
```

### Usage

```js
const bus = createEventBus();

// Subscriber — does not know who publishes
const unsub = bus.on("counter:changed", (count) => {
  console.log(`Counter is now ${count}`);
});

// Publisher — does not know who subscribes
bus.emit("counter:changed", 42); // "Counter is now 42"

// Cleanup
unsub();
bus.emit("counter:changed", 99); // (nothing logged)
```

### When to Use Pub/Sub

- Cross-module communication where modules should not reference each other directly.
- Plugin systems where third parties hook into your app.
- UI event buses that broadcast actions like "toast:show" or "modal:open".

---

## 14.3 The Observer Pattern

The observer pattern is similar to pub/sub but **the subject itself** manages its observers, rather than routing through a central bus:

```js
function createSubject(initialValue) {
  let value = initialValue;
  const observers = new Set();

  return {
    get() {
      return value;
    },

    set(newValue) {
      if (Object.is(value, newValue)) return; // skip if unchanged
      value = newValue;
      for (const observer of observers) {
        observer(value);
      }
    },

    subscribe(observer) {
      observers.add(observer);
      return () => observers.delete(observer);
    },
  };
}
```

### Pub/Sub vs Observer

| Feature | Pub/Sub | Observer |
|---|---|---|
| Coupling | Fully decoupled via event bus | Observers subscribe directly to the subject |
| Event types | String-based event names | Implicit — "the value changed" |
| Multiple subjects | Single bus handles many topics | Each subject manages its own list |
| Debugging | Harder to trace (events are strings) | Easier — you can inspect the subject |

---

## 14.4 A Simple Store (dispatch + subscribe)

Combining the observer pattern with a reducer function gives us a store similar to Redux:

```js
function createStore(reducer, initialState) {
  let state = initialState;
  const subscribers = new Set();

  return {
    getState() {
      return state;
    },

    dispatch(action) {
      const prevState = state;
      state = reducer(state, action);

      // Only notify if state actually changed
      if (state !== prevState) {
        for (const subscriber of subscribers) {
          subscriber(state, prevState);
        }
      }
    },

    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}
```

### Using the Store

```js
// Reducer: a pure function that returns new state
function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + (action.payload ?? 1) };
    case "DECREMENT":
      return { ...state, count: state.count - (action.payload ?? 1) };
    case "RESET":
      return { ...state, count: 0 };
    default:
      return state;
  }
}

const store = createStore(counterReducer, { count: 0 });

// Subscribe to changes
store.subscribe((state) => {
  document.querySelector("#count").textContent = state.count;
});

// Dispatch actions
store.dispatch({ type: "INCREMENT" });           // count: 1
store.dispatch({ type: "INCREMENT", payload: 5 }); // count: 6
store.dispatch({ type: "RESET" });                 // count: 0
```

### Why This Pattern Works

- **Predictable** — all state changes go through the reducer, a pure function you can test.
- **Traceable** — every `dispatch` carries an action object that describes what happened.
- **Extensible** — middleware can intercept dispatches to add logging, analytics, or async side effects.

---

## 14.5 Reactive State with Proxy

`Proxy` intercepts fundamental operations on an object (get, set, delete). This lets us detect mutations and automatically notify subscribers — no `dispatch` needed:

```js
function reactive(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;

      if (!Object.is(oldValue, value)) {
        onChange(prop, value, oldValue);
      }

      return true; // indicates success
    },

    deleteProperty(obj, prop) {
      const oldValue = obj[prop];
      delete obj[prop];
      onChange(prop, undefined, oldValue);
      return true;
    },
  });
}
```

### Usage

```js
const state = reactive({ count: 0, name: "Alice" }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} -> ${newVal}`);
  render(); // automatic re-render on any mutation
});

state.count++;    // "count: 0 -> 1"  — render() called
state.name = "Bob"; // "name: Alice -> Bob" — render() called
```

### Deep Reactivity

The basic proxy only watches top-level properties. To watch nested objects, wrap them recursively:

```js
function deepReactive(target, onChange) {
  // Wrap nested objects
  for (const key of Object.keys(target)) {
    if (target[key] !== null && typeof target[key] === "object") {
      target[key] = deepReactive(target[key], onChange);
    }
  }

  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];

      // If the new value is an object, make it reactive too
      if (value !== null && typeof value === "object") {
        value = deepReactive(value, onChange);
      }

      obj[prop] = value;

      if (!Object.is(oldValue, value)) {
        onChange(prop, value, oldValue);
      }

      return true;
    },

    deleteProperty(obj, prop) {
      const oldValue = obj[prop];
      delete obj[prop];
      onChange(prop, undefined, oldValue);
      return true;
    },
  });
}
```

---

## 14.6 Signals: Fine-Grained Reactivity

Signals are a reactivity primitive popularized by SolidJS, Angular, Preact, and others. A signal holds a value, and computations that read the signal automatically re-run when it changes:

```js
let currentComputation = null;

function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function read() {
    // Track: if a computation is running, record it as a subscriber
    if (currentComputation) {
      subscribers.add(currentComputation);
    }
    return value;
  }

  function write(newValue) {
    if (Object.is(value, newValue)) return;
    value = newValue;

    // Notify all tracked computations
    for (const subscriber of subscribers) {
      subscriber();
    }
  }

  return [read, write];
}

function createEffect(fn) {
  const execute = () => {
    currentComputation = execute;
    fn();
    currentComputation = null;
  };
  execute(); // run once to register dependencies
}
```

### Usage

```js
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal("Alice");

// This effect automatically re-runs when count() or name() changes
createEffect(() => {
  console.log(`${name()} has count: ${count()}`);
});
// Logs: "Alice has count: 0"

setCount(5);
// Logs: "Alice has count: 5"

setName("Bob");
// Logs: "Bob has count: 5"
```

### Why Signals Matter

- **Fine-grained** — only the specific DOM nodes or computations that read a signal update, not the entire UI.
- **Automatic tracking** — no need to declare dependencies; reading a signal inside an effect is enough.
- **No diffing** — unlike virtual DOM frameworks, signals update exactly what changed.
- **Framework convergence** — signals are becoming the standard reactivity primitive (SolidJS, Preact Signals, Angular Signals, proposed TC39 Signals).

---

## 14.7 Comparing Patterns

| Pattern | Coupling | Granularity | Boilerplate | Use Case |
|---|---|---|---|---|
| **Pub/Sub** | Loose | Event-based | Low | Cross-module messaging, plugin systems |
| **Observer** | Medium | Value-based | Low | Single values that need watchers |
| **Store (dispatch)** | Medium | Action-based | Medium | Predictable state with time-travel debugging |
| **Proxy** | Low | Property-based | Low | Drop-in reactivity for plain objects |
| **Signals** | Low | Fine-grained | Low | Performance-critical UI updates |

### Decision Guide

- **"I need modules to communicate without importing each other"** — use pub/sub.
- **"I want predictable state with a history of actions"** — use a store with dispatch/reduce.
- **"I want plain object syntax with automatic change detection"** — use Proxy.
- **"I want the most efficient DOM updates possible"** — use signals.

---

## Tricky Things & Gotchas

1. **Proxy traps must return `true`** — the `set` trap must return `true` to indicate success; returning a falsy value throws a `TypeError` in strict mode.

2. **Proxy identity** — `proxy !== target`. If you store the original object somewhere else and mutate it directly, the proxy will not detect the change. Always interact through the proxy.

3. **Signals require calling the getter** — unlike a regular variable, a signal is a function call: `count()`, not `count`. Forgetting the parentheses reads the function reference, not the value.

4. **Memory leaks from unsubscribing** — every `subscribe` or `on` call should return an `unsubscribe` function. Forgetting to call it when a component is removed leaks memory. Always clean up.

5. **Circular notifications** — if a subscriber dispatches another action or sets another signal during notification, you can get infinite loops. Guard against re-entrant updates.

6. **Proxy does not trigger on nested mutations** — `state.todos.push(item)` modifies the array directly; the proxy on `state` only sees `set` on `state.todos`. You need deep reactivity or immutable updates.

7. **`Object.is` semantics** — `Object.is(NaN, NaN)` is `true`, but `Object.is(0, -0)` is `false`. This is usually the correct equality check for reactivity, but be aware of edge cases.

---

## Best Practices

- Use the simplest pattern that meets your needs. Do not reach for signals when pub/sub suffices.
- Always return an unsubscribe/cleanup function from subscriptions.
- Keep reducers pure — no side effects, no async code, no DOM manipulation inside them.
- Use `Object.is` (not `===`) for comparing old and new values, since it correctly handles `NaN`.
- Batch multiple state changes when possible to avoid redundant notifications.
- Avoid storing non-serializable data (DOM nodes, functions, class instances) in reactive state.
- When using Proxy, always interact through the proxy reference, never the underlying target.
- Document which pattern your codebase uses and be consistent throughout the project.

---

## Exercises

1. **Event bus.** Build a `createEventBus()` with `on`, `off`, and `emit` methods. Write tests that verify subscribers are called with the correct data and that `off` removes them.

2. **Store with middleware.** Extend the `createStore` from this chapter to support middleware. A middleware function receives `(store, next, action)` and can modify, delay, or log actions before they reach the reducer.

3. **Undo with store.** Add undo/redo capability to the store. Keep a history of past states. Dispatch `{ type: "UNDO" }` to pop the last state, and `{ type: "REDO" }` to restore it.

4. **Deep reactive object.** Implement `deepReactive()` that watches nested objects and arrays. Verify that `state.user.address.city = "NYC"` triggers the change handler.

5. **Computed signals.** Implement a `createComputed(fn)` function that creates a read-only signal whose value is derived from other signals. It should re-compute only when its dependencies change.

6. **Reactive DOM binding.** Using the `reactive()` Proxy helper, build a function `bind(element, state, prop)` that sets `element.textContent` to `state[prop]` and automatically updates whenever the property changes.

7. **Pub/sub with wildcard.** Extend the event bus to support wildcard subscriptions: `bus.on("counter:*", fn)` should fire for `counter:increment`, `counter:reset`, and any event starting with `counter:`.

8. **Performance comparison.** Create a benchmark that updates 1,000 items in a list using (a) manual render, (b) Proxy-based reactivity, and (c) signals. Measure how many milliseconds each approach takes. Document your findings.

---

## Mini-Lab

Open the interactive example in [`../../examples-web/phase-02/ch-14-reactivity/`](../../examples-web/phase-02/ch-14-reactivity/) to see every concept from this chapter in action. Run it with:

```bash
npm run dev:reactivity
```

The example page provides:
- A reactive counter using a dispatch/subscribe store
- A todo list driven by Proxy-based reactive state
- A signals demo showing fine-grained updates
- A live log panel showing every subscription notification in real time

---

## What's Next

With reactivity patterns in hand, Chapter 15 dives into asynchronous JavaScript — callbacks, Promises, and async/await — the foundation for fetching data, handling timers, and building responsive applications.
