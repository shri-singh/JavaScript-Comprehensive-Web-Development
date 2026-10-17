// ──────────────────────────────────────────────
// Chapter 14 — Reactivity Patterns: Interactive Demo
// ──────────────────────────────────────────────

// ── Logging Utility ──────────────────────────
const logPanel = document.querySelector("#log");

function log(label, message) {
  const entry = document.createElement("div");
  entry.classList.add("log-entry");

  const labelSpan = document.createElement("span");
  labelSpan.classList.add("log-label");
  labelSpan.textContent = `[${label}]`;

  entry.append(labelSpan, ` ${message}`);
  logPanel.prepend(entry);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO 1: Simple Store with dispatch + subscribe
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a Redux-style store.
 * @param {Function} reducer - Pure function: (state, action) => newState
 * @param {*} initialState - The starting state
 * @returns {{ getState, dispatch, subscribe }}
 */
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

      if (state !== prevState) {
        for (const subscriber of subscribers) {
          subscriber(state, prevState);
        }
      }

      return action;
    },

    subscribe(fn) {
      subscribers.add(fn);
      // Return unsubscribe function
      return () => subscribers.delete(fn);
    },
  };
}

// Counter reducer — pure function, no side effects
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

// Create the store
const counterStore = createStore(counterReducer, { count: 0 });

// Subscribe: update the DOM display
const counterDisplay = document.querySelector("#counter-display");

counterStore.subscribe((state) => {
  counterDisplay.textContent = state.count;
  log("Store", `Counter changed to ${state.count}`);
});

// Wire up buttons
document.querySelector("#inc-btn").addEventListener("click", () => {
  counterStore.dispatch({ type: "INCREMENT" });
});

document.querySelector("#dec-btn").addEventListener("click", () => {
  counterStore.dispatch({ type: "DECREMENT" });
});

document.querySelector("#inc-5-btn").addEventListener("click", () => {
  counterStore.dispatch({ type: "INCREMENT", payload: 5 });
});

document.querySelector("#dec-5-btn").addEventListener("click", () => {
  counterStore.dispatch({ type: "DECREMENT", payload: 5 });
});

document.querySelector("#reset-btn").addEventListener("click", () => {
  counterStore.dispatch({ type: "RESET" });
});

log("Store", "Counter store created with initial count: 0");

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO 2: Proxy-Based Reactive State — Todo List
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a deep reactive proxy that calls onChange whenever any property
 * (including nested properties) is set or deleted.
 */
function deepReactive(target, onChange) {
  // Recursively wrap nested objects/arrays
  for (const key of Object.keys(target)) {
    if (target[key] !== null && typeof target[key] === "object") {
      target[key] = deepReactive(target[key], onChange);
    }
  }

  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];

      // Wrap new objects/arrays in a proxy too
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

// Create reactive state for the todo list
const todoState = deepReactive(
  {
    todos: [
      { id: crypto.randomUUID(), text: "Try the store counter above", done: false },
      { id: crypto.randomUUID(), text: "Add a new todo here", done: false },
      { id: crypto.randomUUID(), text: "Check out the signals demo", done: false },
    ],
  },
  (prop, newVal) => {
    // This fires on EVERY property change (including nested)
    // We debounce renders to batch rapid changes
    scheduleRender();
    log("Proxy", `Property "${prop}" changed`);
  },
);

let renderScheduled = false;

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  queueMicrotask(() => {
    renderTodos();
    renderScheduled = false;
  });
}

function renderTodos() {
  const list = document.querySelector("#proxy-todo-list");
  const countEl = document.querySelector("#proxy-todo-count");
  const todos = todoState.todos;

  list.replaceChildren();

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-state");
    empty.textContent = "No todos yet. Add one above!";
    list.append(empty);
  } else {
    for (const todo of todos) {
      const li = document.createElement("li");
      li.dataset.id = todo.id;
      if (todo.done) li.classList.add("completed");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "not done" : "done"}`);

      const text = document.createElement("span");
      text.classList.add("todo-text");
      text.textContent = todo.text;

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("todo-delete");
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete "${todo.text}"`);

      li.append(checkbox, text, deleteBtn);
      list.append(li);
    }
  }

  const active = todos.filter((t) => !t.done).length;
  countEl.textContent = `${active} of ${todos.length} remaining`;
}

// Event delegation for todo list
document.querySelector("#proxy-todo-list").addEventListener("click", (event) => {
  const li = event.target.closest("li[data-id]");
  if (!li) return;

  const id = li.dataset.id;
  const index = todoState.todos.findIndex((t) => t.id === id);
  if (index === -1) return;

  if (event.target.matches("input[type='checkbox']")) {
    // Direct mutation — the Proxy detects it and triggers render
    todoState.todos[index] = {
      ...todoState.todos[index],
      done: !todoState.todos[index].done,
    };
    log("Proxy", `Toggled: "${todoState.todos[index].text}"`);
    return;
  }

  if (event.target.closest(".todo-delete")) {
    const text = todoState.todos[index].text;
    // Replace the array to trigger the proxy
    todoState.todos = todoState.todos.filter((t) => t.id !== id);
    log("Proxy", `Deleted: "${text}"`);
    return;
  }
});

// Add todo
const todoInput = document.querySelector("#proxy-todo-input");
const addBtn = document.querySelector("#proxy-add-btn");

function addProxyTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  // Direct mutation via proxy — auto-triggers render
  todoState.todos = [
    ...todoState.todos,
    { id: crypto.randomUUID(), text, done: false },
  ];
  todoInput.value = "";
  todoInput.focus();
  log("Proxy", `Added: "${text}"`);
}

addBtn.addEventListener("click", addProxyTodo);
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addProxyTodo();
});

// Initial render
renderTodos();
log("Proxy", "Reactive todo list initialized with 3 items");

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO 3: Signals — Fine-Grained Reactivity
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimal signals implementation.
 * Signals track which effects read them, and re-run those effects when the
 * signal value changes.
 */

let currentEffect = null;

/**
 * Creates a reactive signal.
 * @param {*} initialValue
 * @returns {[() => T, (value: T) => void]} — [getter, setter]
 */
function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function read() {
    // Automatic dependency tracking
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  }

  function write(newValue) {
    if (Object.is(value, newValue)) return;
    value = newValue;

    // Notify all effects that depend on this signal
    const toRun = [...subscribers];
    for (const effect of toRun) {
      effect();
    }
  }

  return [read, write];
}

/**
 * Creates a computed signal (read-only, derived from other signals).
 * @param {Function} fn - A function that reads other signals
 * @returns {() => T} — getter
 */
function createComputed(fn) {
  const [read, write] = createSignal(undefined);

  createEffect(() => {
    write(fn());
  });

  return read;
}

/**
 * Creates an effect that re-runs whenever its signal dependencies change.
 * @param {Function} fn
 */
function createEffect(fn) {
  const execute = () => {
    // Set this effect as the "current" one so signals can track it
    const prevEffect = currentEffect;
    currentEffect = execute;
    try {
      fn();
    } finally {
      currentEffect = prevEffect;
    }
  };
  execute(); // Run immediately to register dependencies
}

// Create signals
const [price, setPrice] = createSignal(10);
const [qty, setQty] = createSignal(1);

// Computed signal: total = price * qty
const total = createComputed(() => price() * qty());

// DOM elements
const priceEl = document.querySelector("#signal-price");
const qtyEl = document.querySelector("#signal-qty");
const totalEl = document.querySelector("#signal-total");

// Effects that update the DOM — each only re-runs when its specific signals change
createEffect(() => {
  priceEl.textContent = price().toFixed(2);
  log("Signal", `Price effect ran: $${price().toFixed(2)}`);
});

createEffect(() => {
  qtyEl.textContent = qty();
  log("Signal", `Quantity effect ran: ${qty()}`);
});

createEffect(() => {
  totalEl.textContent = `$${total().toFixed(2)}`;
  log("Signal", `Total effect ran: $${total().toFixed(2)}`);
});

// Wire up signal buttons
document.querySelector("#price-up").addEventListener("click", () => {
  setPrice(price() + 1);
});

document.querySelector("#price-down").addEventListener("click", () => {
  setPrice(Math.max(0, price() - 1));
});

document.querySelector("#qty-up").addEventListener("click", () => {
  setQty(qty() + 1);
});

document.querySelector("#qty-down").addEventListener("click", () => {
  setQty(Math.max(0, qty() - 1));
});

document.querySelector("#signal-reset").addEventListener("click", () => {
  setPrice(10);
  setQty(1);
  log("Signal", "Reset to defaults");
});

log("Signal", "Signals demo initialized: price=$10, qty=1");

// ═══════════════════════════════════════════════════════════════════════════════
// Ready
// ═══════════════════════════════════════════════════════════════════════════════
log("Ready", "All three reactivity demos loaded. Try interacting with each one!");
