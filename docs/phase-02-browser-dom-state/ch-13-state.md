# Chapter 13 — State Management

## Learning Objectives

By the end of this chapter you will be able to:

- Define what "state" means in a web application and explain why separating state from UI matters.
- Implement a single source of truth pattern where one state object drives the entire UI.
- Write immutable state updates using the spread operator and `structuredClone`.
- Build a `render()` function that transforms state into DOM, keeping the UI in sync with data.
- Use `localStorage` and `sessionStorage` to persist state across page loads.
- Design state shape for common UI patterns: lists, selections, loading states, and errors.
- Recognize the problems that arise from scattered, mutable state and how to avoid them.

---

## 13.1 Why State Management Matters

In a simple page, you might read a value from an input, toggle a class on an element, and store a counter in a variable — all in different places. This works for tiny scripts but quickly becomes unmanageable:

- **Lost sync** — the DOM says one thing, your variables say another.
- **Hard to debug** — you cannot inspect the "state" of the app because it is scattered across 15 variables and 30 DOM elements.
- **Difficult to persist** — saving and restoring the app requires reading from the DOM.

The solution is **state-driven rendering**: keep all application data in a single JavaScript object, and write a function that builds the UI from that object. When the state changes, re-render.

---

## 13.2 Single Source of Truth

A single source of truth means there is **one** authoritative state object. The UI is always derived from it:

```js
// State
const state = {
  todos: [
    { id: 1, text: "Learn DOM", done: true },
    { id: 2, text: "Learn Events", done: false },
  ],
  filter: "all", // "all" | "active" | "completed"
};

// The UI is a function of state
function render() {
  // ... build the DOM from state
}

// Every action updates state, then calls render
function addTodo(text) {
  state.todos.push({ id: Date.now(), text, done: false });
  render();
}
```

### Benefits

- **Predictable** — given the same state, `render()` always produces the same UI.
- **Debuggable** — `console.log(state)` shows the entire application state at any point.
- **Serializable** — `JSON.stringify(state)` saves the entire app; `JSON.parse` restores it.

---

## 13.3 State vs UI Separation

A common mistake is storing state **in the DOM** — reading `element.classList.contains("active")` to decide what to do next. This couples your logic to the presentation layer:

```js
// BAD: reading state from the DOM
if (todoItem.classList.contains("completed")) {
  // is it done?
}

// GOOD: reading state from the data
if (state.todos.find(t => t.id === id).done) {
  // is it done?
}
```

The DOM is an **output** of your state, not a **source** of truth.

---

## 13.4 Immutable State Updates

Mutating state directly (e.g., `state.todos.push(...)`) works but makes it impossible to compare old and new state, implement undo, or optimize rendering.

### Spread Operator

```js
// Adding an item
const newState = {
  ...state,
  todos: [...state.todos, { id: Date.now(), text: "New", done: false }],
};

// Toggling a todo
const newState = {
  ...state,
  todos: state.todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  ),
};

// Removing a todo
const newState = {
  ...state,
  todos: state.todos.filter((todo) => todo.id !== id),
};
```

### structuredClone

For deep cloning when you have nested objects:

```js
const snapshot = structuredClone(state);
// snapshot is a completely independent deep copy
```

`structuredClone` handles nested objects, arrays, Maps, Sets, Dates, RegExps, and more. It does **not** copy functions or DOM nodes.

### Why Immutability?

- **Undo/redo** — keep a history array of past states.
- **Change detection** — `oldState !== newState` tells you if anything changed without deep comparison.
- **Debugging** — every state change creates a new snapshot you can inspect.

---

## 13.5 Rendering from State

The `render` function is the bridge between state and UI. It reads the current state and updates the DOM accordingly:

```js
function render() {
  const list = document.querySelector("#todo-list");

  // Determine which todos to show
  const filtered = state.todos.filter((todo) => {
    if (state.filter === "active") return !todo.done;
    if (state.filter === "completed") return todo.done;
    return true;
  });

  // Build the list
  list.replaceChildren();

  for (const todo of filtered) {
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    li.classList.toggle("completed", todo.done);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;

    const span = document.createElement("span");
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    li.append(checkbox, span, deleteBtn);
    list.append(li);
  }

  // Update count
  const active = state.todos.filter((t) => !t.done).length;
  document.querySelector("#count").textContent = `${active} item${active !== 1 ? "s" : ""} left`;
}
```

### Full Re-render vs Targeted Updates

The simplest approach is to rebuild the entire list on every state change. This is perfectly fine for lists under a few hundred items. For large or complex UIs, you can optimize by:

- Updating only the elements that changed.
- Using a virtual DOM library (React, Preact).
- Using `requestAnimationFrame` to batch updates.

For this chapter, full re-render is the correct starting point.

---

## 13.6 localStorage and sessionStorage

### Overview

| Feature | `localStorage` | `sessionStorage` |
|---|---|---|
| Lifetime | Until manually cleared | Until the tab/window is closed |
| Scope | Shared across all tabs for the same origin | Per-tab |
| Capacity | ~5-10 MB per origin | ~5-10 MB per origin |
| API | Identical | Identical |

### API

```js
// Save
localStorage.setItem("todos", JSON.stringify(state.todos));

// Load
const saved = localStorage.getItem("todos");
const todos = saved ? JSON.parse(saved) : [];

// Remove
localStorage.removeItem("todos");

// Clear all
localStorage.clear();
```

### Integrating with State

```js
// Load state from storage on startup
function loadState() {
  try {
    const saved = localStorage.getItem("app-state");
    return saved ? JSON.parse(saved) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

// Save state to storage after each change
function saveState() {
  localStorage.setItem("app-state", JSON.stringify(state));
}

// Update function that saves after every change
function updateState(changes) {
  Object.assign(state, changes);
  saveState();
  render();
}
```

### Storage Events

When one tab modifies `localStorage`, other tabs for the same origin receive a `storage` event:

```js
window.addEventListener("storage", (event) => {
  if (event.key === "app-state") {
    const newState = JSON.parse(event.newValue);
    Object.assign(state, newState);
    render();
  }
});
```

---

## 13.7 State Shape Design

### Lists

```js
const state = {
  todos: [
    { id: 1, text: "Buy groceries", done: false, createdAt: 1700000000000 },
    { id: 2, text: "Read chapter 13", done: true, createdAt: 1700001000000 },
  ],
};
```

Each item has a unique `id` (use `Date.now()` or `crypto.randomUUID()`). Never use the array index as the identity — it changes when items are reordered or deleted.

### Selections

```js
const state = {
  todos: [/* ... */],
  selectedId: null,  // or a todo id
};
```

### Loading and Error States

```js
const state = {
  todos: [],
  loading: false,
  error: null,  // string or null
};
```

### Filters and Sorting

```js
const state = {
  todos: [/* ... */],
  filter: "all",         // "all" | "active" | "completed"
  sortBy: "createdAt",   // "createdAt" | "text"
  sortOrder: "asc",      // "asc" | "desc"
};
```

### Composed State

Keep state flat where possible. Avoid deeply nesting objects — it makes immutable updates harder:

```js
// Flat (good)
const state = {
  todos: [/* ... */],
  filter: "all",
  editingId: null,
};

// Deeply nested (harder to update)
const state = {
  ui: {
    filters: {
      todo: {
        current: "all",
      },
    },
    editing: {
      todoId: null,
    },
  },
};
```

---

## Tricky Things & Gotchas

1. **`localStorage` stores only strings** — you must `JSON.stringify` before saving and `JSON.parse` when loading. Forgetting to parse means your state will be a string, not an object.

2. **`JSON.stringify` drops `undefined` and functions** — if your state contains `undefined` values, they will vanish after a round-trip through `JSON.stringify` / `JSON.parse`. Use `null` instead.

3. **Re-rendering destroys DOM state** — calling `replaceChildren()` removes focus, scroll position, CSS transitions in progress, and the cursor position in input fields. Be mindful of what re-rendering affects.

4. **structuredClone limitations** — it cannot clone functions, DOM nodes, or Error objects. Ensure your state contains only serializable data.

5. **Storage quota** — `localStorage` has a ~5-10 MB limit. Storing large amounts of data can throw a `QuotaExceededError`. Always wrap storage writes in `try/catch`.

6. **State shape migrations** — if you change your state shape in a new version of the app, old data in `localStorage` may cause crashes. Always validate loaded data and provide defaults.

---

## Best Practices

- Keep a single state object as the source of truth for the entire application (or component).
- Derive the UI from state: `render(state) -> DOM`. Never read state from the DOM.
- Use immutable update patterns (spread, `map`, `filter`) so that old and new state can be compared.
- Store only serializable data in state (no functions, no DOM nodes, no class instances).
- Use unique IDs for list items, never array indices.
- Wrap `localStorage` operations in `try/catch` to handle quota errors and private browsing restrictions.
- Validate and provide defaults when loading persisted state to handle schema changes.
- Keep state flat — avoid deep nesting that complicates updates.

---

## Exercises

1. **Counter app.** Build a counter with increment, decrement, and reset buttons. Store the count in a state object. Render the current count to the page on every change. Persist the count in `localStorage`.

2. **Theme switcher.** Create a state-driven theme switcher that stores `{ theme: "light" | "dark" }`. The render function applies the theme class to `<body>`. Persist the choice in `localStorage` and restore it on page load.

3. **Immutable update practice.** Given a state object with a `users` array, write pure functions (no mutation) to: add a user, remove a user by id, update a user's name, and toggle a user's `active` boolean.

4. **Undo/redo.** Extend the counter app with undo and redo buttons. Keep a history array of past states. Undo pops the last state; redo pushes it back.

5. **Filtered list.** Build a state-driven list of items with category tags. Add filter buttons that update `state.filter` and re-render to show only matching items.

6. **State shape design.** Design the state shape for a shopping cart: products with quantities, a coupon code field, shipping method selection, and an "order placed" flag. Write the type as a JSDoc comment. Build the add/remove/update functions.

7. **Cross-tab sync.** Open your todo app in two tabs. Use the `storage` event to keep both tabs in sync when todos are added or removed in either tab.

8. **State validator.** Write a `validateState(loaded)` function that checks whether data loaded from `localStorage` matches the expected shape. If any field is missing or the wrong type, return a corrected state with defaults filled in.

---

## Mini-Lab

Open the interactive example in [`../../examples-web/phase-02/ch-13-state/`](../../examples-web/phase-02/ch-13-state/) to see every concept from this chapter in action. Run it with:

```bash
npm run dev:state
```

The example page provides:
- A fully functional todo list app driven by a single state object
- Add, toggle, and delete todos
- Filter by all / active / completed
- LocalStorage persistence — refresh the page and your todos remain
- A state inspector panel showing the raw JSON state in real time

---

## What's Next

With state management fundamentals in place, Chapter 14 will introduce reactive patterns — making state updates automatically propagate to the UI without manual `render()` calls, bridging the gap to how frameworks like React and Vue work under the hood.
