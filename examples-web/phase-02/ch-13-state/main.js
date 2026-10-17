// ──────────────────────────────────────────────
// Chapter 13 — State Management: Todo App Demo
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

// ── Storage Key ──────────────────────────────
const STORAGE_KEY = "ch13-todo-state";

// ── Default State ────────────────────────────
function getDefaultState() {
  return {
    todos: [
      { id: crypto.randomUUID(), text: "Learn DOM fundamentals", done: true, createdAt: Date.now() - 3000 },
      { id: crypto.randomUUID(), text: "Master event handling", done: true, createdAt: Date.now() - 2000 },
      { id: crypto.randomUUID(), text: "Build forms with validation", done: false, createdAt: Date.now() - 1000 },
      { id: crypto.randomUUID(), text: "Understand state management", done: false, createdAt: Date.now() },
    ],
    filter: "all",
  };
}

// ── Load State from localStorage ─────────────
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      log("Storage", "No saved state found — using defaults");
      return getDefaultState();
    }

    const parsed = JSON.parse(saved);

    // Validate shape
    if (!Array.isArray(parsed.todos)) {
      log("Storage", "Invalid state shape — using defaults");
      return getDefaultState();
    }

    log("Storage", `Loaded ${parsed.todos.length} todos from localStorage`);
    return parsed;
  } catch {
    log("Storage", "Failed to parse saved state — using defaults");
    return getDefaultState();
  }
}

// ── Save State to localStorage ───────────────
function saveState() {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    updateStorageSize(json.length);
  } catch (error) {
    log("Storage", `Failed to save: ${error.message}`);
  }
}

function updateStorageSize(bytes) {
  document.querySelector("#storage-size").textContent = bytes;
}

// ── Application State (Single Source of Truth) ─
let state = loadState();

// ── State Update Helper (Immutable Pattern) ──
function setState(updater) {
  const oldState = state;
  state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
  saveState();
  render();
  updateStateInspector();
}

// ── Actions ──────────────────────────────────

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTodo = {
    id: crypto.randomUUID(),
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  };

  setState((prev) => ({
    ...prev,
    todos: [...prev.todos, newTodo],
  }));

  log("Action", `Added: "${trimmed}"`);
}

function toggleTodo(id) {
  setState((prev) => ({
    ...prev,
    todos: prev.todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ),
  }));

  const todo = state.todos.find((t) => t.id === id);
  log("Action", `Toggled: "${todo.text}" → ${todo.done ? "completed" : "active"}`);
}

function deleteTodo(id) {
  const todo = state.todos.find((t) => t.id === id);
  setState((prev) => ({
    ...prev,
    todos: prev.todos.filter((t) => t.id !== id),
  }));

  log("Action", `Deleted: "${todo?.text}"`);
}

function setFilter(filter) {
  setState({ filter });
  log("Action", `Filter changed to: "${filter}"`);
}

function toggleAll() {
  const allDone = state.todos.every((t) => t.done);
  setState((prev) => ({
    ...prev,
    todos: prev.todos.map((t) => ({ ...t, done: !allDone })),
  }));

  log("Action", `Toggled all → ${allDone ? "active" : "completed"}`);
}

function clearCompleted() {
  const completedCount = state.todos.filter((t) => t.done).length;
  setState((prev) => ({
    ...prev,
    todos: prev.todos.filter((t) => !t.done),
  }));

  log("Action", `Cleared ${completedCount} completed todo(s)`);
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  state = getDefaultState();
  saveState();
  render();
  updateStateInspector();
  log("Storage", "Cleared localStorage and reset to defaults");
}

// ── Render Function (State → DOM) ────────────

function render() {
  const list = document.querySelector("#todo-list");
  const countEl = document.querySelector("#todo-count");

  // Determine which todos to show based on filter
  const filtered = state.todos.filter((todo) => {
    if (state.filter === "active") return !todo.done;
    if (state.filter === "completed") return todo.done;
    return true;
  });

  // Clear and rebuild the list
  list.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-state");
    empty.textContent =
      state.filter === "all"
        ? "No todos yet. Add one above!"
        : state.filter === "active"
          ? "No active todos. You are all caught up!"
          : "No completed todos yet.";
    list.append(empty);
  } else {
    for (const todo of filtered) {
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

  // Update count
  const activeCount = state.todos.filter((t) => !t.done).length;
  const total = state.todos.length;
  countEl.textContent = `${activeCount} of ${total} remaining`;

  // Update filter button styles
  for (const btn of document.querySelectorAll(".filter-btn")) {
    btn.classList.toggle("active-filter", btn.dataset.filter === state.filter);
  }
}

// ── State Inspector ──────────────────────────

function updateStateInspector() {
  const inspector = document.querySelector("#state-inspector");

  // Create a display-friendly version
  const display = {
    filter: state.filter,
    todos: state.todos.map((t) => ({
      id: t.id.slice(0, 8) + "...",
      text: t.text,
      done: t.done,
      createdAt: new Date(t.createdAt).toLocaleTimeString(),
    })),
  };

  inspector.textContent = JSON.stringify(display, null, 2);
}

// ── Event Delegation (single listener) ───────

// Todo list: toggle and delete via delegation
document.querySelector("#todo-list").addEventListener("click", (event) => {
  const li = event.target.closest("li[data-id]");
  if (!li) return;

  const id = li.dataset.id;

  if (event.target.matches("input[type='checkbox']")) {
    toggleTodo(id);
    return;
  }

  if (event.target.closest(".todo-delete")) {
    deleteTodo(id);
    return;
  }
});

// Add todo
const todoInput = document.querySelector("#todo-input");
const addBtn = document.querySelector("#add-btn");

addBtn.addEventListener("click", () => {
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo(todoInput.value);
    todoInput.value = "";
  }
});

// Filters
for (const btn of document.querySelectorAll(".filter-btn")) {
  btn.addEventListener("click", () => {
    setFilter(btn.dataset.filter);
  });
}

// Bulk actions
document.querySelector("#complete-all-btn").addEventListener("click", toggleAll);
document.querySelector("#clear-completed-btn").addEventListener("click", clearCompleted);
document.querySelector("#clear-storage-btn").addEventListener("click", clearStorage);

// ── Cross-Tab Sync via storage Event ─────────

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try {
      state = JSON.parse(event.newValue);
      render();
      updateStateInspector();
      log("Sync", "State updated from another tab");
    } catch {
      log("Sync", "Failed to parse state from another tab");
    }
  }
});

// ── Initial Render ───────────────────────────
render();
updateStateInspector();
log("Ready", "Todo app loaded. State is the single source of truth — every UI change flows from state.");
