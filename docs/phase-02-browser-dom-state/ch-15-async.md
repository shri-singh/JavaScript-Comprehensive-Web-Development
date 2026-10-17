# Chapter 15 — Asynchronous JavaScript

## Learning Objectives

By the end of this chapter you will be able to:

- Explain why JavaScript is single-threaded and how the event loop enables asynchronous behavior.
- Identify "callback hell" and explain why deeply nested callbacks are hard to maintain.
- Create and consume Promises, including chaining with `.then` and `.catch`.
- Use `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any` for concurrent operations.
- Write async functions with `async/await` and handle errors with `try/catch`.
- Describe the difference between the microtask queue and the task (macro-task) queue.
- Cancel asynchronous operations using `AbortController` and `AbortSignal`.
- Use top-level `await` in ES modules.

---

## 15.1 The Single-Threaded Problem

JavaScript runs on a **single thread**. If a long operation blocks that thread — reading a file, making a network request, waiting for a timer — the entire page freezes. No clicks, no scrolling, nothing.

The solution: **asynchronous programming**. Instead of waiting for a result, you schedule a callback to run later when the result is ready, and the engine continues executing other code in the meantime.

---

## 15.2 Callbacks and Callback Hell

A **callback** is a function passed to another function to be called when an operation completes:

```js
function fetchUser(id, callback) {
  setTimeout(() => {
    callback(null, { id, name: "Alice" });
  }, 100);
}

fetchUser(1, (err, user) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(user.name); // "Alice"
});
```

### Callback Hell

When operations depend on each other, callbacks nest deeply:

```js
fetchUser(1, (err, user) => {
  fetchOrders(user.id, (err, orders) => {
    fetchOrderDetails(orders[0].id, (err, details) => {
      fetchProduct(details.productId, (err, product) => {
        console.log(product.name); // four levels deep
      });
    });
  });
});
```

Problems:
- **Hard to read** — the "pyramid of doom" makes logic hard to follow.
- **Hard to handle errors** — you need `if (err)` at every level.
- **Hard to compose** — running operations in parallel requires manual bookkeeping.

---

## 15.3 Promises

A **Promise** represents a value that may not be available yet. It has three states:

| State | Meaning |
|---|---|
| **pending** | The operation has not completed yet |
| **fulfilled** | The operation succeeded; the promise has a value |
| **rejected** | The operation failed; the promise has a reason (error) |

Once settled (fulfilled or rejected), a promise **never changes state again**.

### Creating a Promise

```js
const promise = new Promise((resolve, reject) => {
  // Async work here...
  const success = true;

  if (success) {
    resolve("Result data");
  } else {
    reject(new Error("Something went wrong"));
  }
});
```

### Consuming a Promise

```js
promise
  .then((value) => {
    console.log("Fulfilled:", value);
  })
  .catch((error) => {
    console.error("Rejected:", error.message);
  })
  .finally(() => {
    console.log("Always runs, regardless of outcome");
  });
```

### Chaining

Each `.then` returns a **new promise**, enabling flat chains instead of nested callbacks:

```js
fetchUser(1)
  .then((user) => fetchOrders(user.id))
  .then((orders) => fetchOrderDetails(orders[0].id))
  .then((details) => fetchProduct(details.productId))
  .then((product) => console.log(product.name))
  .catch((error) => console.error("Failed:", error.message));
```

The chain is flat, readable, and has a single error handler at the end.

### Promise Static Methods

```js
// Wait for ALL to fulfill (rejects if any rejects)
const results = await Promise.all([fetchA(), fetchB(), fetchC()]);

// Wait for ALL to settle (never rejects)
const outcomes = await Promise.allSettled([fetchA(), fetchB()]);
// [{ status: "fulfilled", value: ... }, { status: "rejected", reason: ... }]

// First to settle wins (fulfill or reject)
const fastest = await Promise.race([fetchA(), fetchB()]);

// First to FULFILL wins (ignores rejections unless ALL reject)
const firstSuccess = await Promise.any([fetchA(), fetchB()]);
```

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | All fulfill | Any one rejects |
| `Promise.allSettled` | All settle | Never |
| `Promise.race` | First settles | First settles (if rejection) |
| `Promise.any` | First fulfills | All reject (`AggregateError`) |

---

## 15.4 async/await

`async/await` is syntactic sugar over Promises that makes asynchronous code look synchronous:

```js
async function getUserProduct(userId) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(user.id);
  const details = await fetchOrderDetails(orders[0].id);
  const product = await fetchProduct(details.productId);
  return product;
}
```

### Key Rules

- An `async` function **always returns a Promise**.
- `await` pauses execution of the async function until the promise settles.
- `await` can only be used inside an `async` function (or at the top level of an ES module).

### Error Handling with try/catch

```js
async function loadData() {
  try {
    const user = await fetchUser(1);
    const orders = await fetchOrders(user.id);
    console.log(orders);
  } catch (error) {
    console.error("Failed to load data:", error.message);
  } finally {
    console.log("Cleanup runs regardless");
  }
}
```

### Parallel Execution

`await` is sequential by default. To run operations in parallel, use `Promise.all`:

```js
// SEQUENTIAL — slow (each waits for the previous)
const users = await fetchUsers();
const products = await fetchProducts();

// PARALLEL — fast (both run at the same time)
const [users, products] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
]);
```

### Common Mistake: await in Loops

```js
// BAD: sequential — each iteration waits for the previous
for (const id of ids) {
  const user = await fetchUser(id); // one at a time
}

// GOOD: parallel — all fetches run simultaneously
const users = await Promise.all(ids.map((id) => fetchUser(id)));
```

---

## 15.5 The Event Loop: Microtasks vs Tasks

The event loop processes two types of queues:

### Task Queue (Macro-Tasks)
- `setTimeout`, `setInterval`
- I/O callbacks
- UI rendering events

### Microtask Queue
- Promise `.then` / `.catch` / `.finally` callbacks
- `queueMicrotask()`
- `MutationObserver` callbacks

**Microtasks always run before the next task.** After each task completes, the engine drains the entire microtask queue before picking up the next task.

```js
console.log("1 - synchronous");

setTimeout(() => console.log("4 - task (setTimeout)"), 0);

Promise.resolve().then(() => console.log("3 - microtask (Promise)"));

queueMicrotask(() => console.log("3b - microtask (queueMicrotask)"));

console.log("2 - synchronous");

// Output order: 1, 2, 3, 3b, 4
```

### Why This Matters

- **Promise callbacks run sooner than `setTimeout`**, even with a 0ms delay.
- **An infinite microtask loop blocks everything** — if a microtask queues another microtask endlessly, tasks and rendering never get a chance to run.
- **Understanding the order helps debug timing-sensitive code** — knowing when your callback will actually execute prevents subtle race conditions.

---

## 15.6 AbortController for Cancellation

`AbortController` provides a standard way to cancel async operations:

```js
const controller = new AbortController();
const { signal } = controller;

// Pass the signal to an abortable operation
fetch("/api/data", { signal })
  .then((response) => response.json())
  .catch((error) => {
    if (error.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      console.error("Request failed:", error.message);
    }
  });

// Cancel the request
controller.abort();
```

### AbortSignal.timeout (ES2022)

Create a signal that automatically aborts after a timeout:

```js
// Abort if the request takes longer than 5 seconds
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
});
```

### Combining Signals

You can combine multiple abort conditions:

```js
const userController = new AbortController();

// Abort on user action OR timeout — whichever comes first
const signal = AbortSignal.any([
  userController.signal,
  AbortSignal.timeout(10_000),
]);

fetch("/api/data", { signal });

// User clicks cancel
cancelButton.addEventListener("click", () => userController.abort());
```

### Custom Abortable Functions

You can make your own functions support cancellation:

```js
function delay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
```

---

## 15.7 Top-Level await

In ES modules, you can use `await` at the top level without wrapping it in an async function:

```js
// config.js (ES module)
const response = await fetch("/api/config");
export const config = await response.json();
```

### Caveats

- Only works in **ES modules** (files with `type: "module"` in `package.json` or `<script type="module">`).
- The module's execution is **paused** until the await resolves, which **delays** any module that imports it.
- Use sparingly — top-level await in a deeply imported module can slow down your entire application startup.

---

## Tricky Things & Gotchas

1. **Forgetting to `await`** — an async function returns a Promise, not the value. If you forget `await`, you get a Promise object instead of the result: `const user = fetchUser(1)` gives you a Promise, not a user.

2. **Unhandled rejections** — if a Promise rejects and there is no `.catch` or `try/catch`, Node.js will emit an `unhandledRejection` event. In browsers, this shows as a console error. Always handle rejections.

3. **`await` in `forEach` does nothing useful** — `Array.forEach` does not await the callback. Use a `for...of` loop or `Promise.all` with `.map` instead.

4. **Error swallowed by missing `catch`** — in a `.then` chain, if you forget `.catch` at the end, errors are silently swallowed in some environments.

5. **`Promise.all` fails fast** — if one promise rejects, the entire `Promise.all` rejects immediately. The other promises continue running but their results are discarded. Use `Promise.allSettled` if you need all results regardless.

6. **Microtask timing** — `queueMicrotask(() => ...)` runs before the next `setTimeout(() => ..., 0)`. This matters for order-dependent logic.

7. **`AbortError` is not a generic Error** — it is a `DOMException` with `name: "AbortError"`. Check `error.name === "AbortError"` rather than using `instanceof`.

8. **async functions always return Promises** — even if you return a plain value, it gets wrapped in a Promise. `async function f() { return 42; }` returns `Promise<42>`.

---

## Best Practices

- Prefer `async/await` over raw `.then` chains for readability.
- Always handle errors: use `try/catch` with `async/await` or `.catch` with promise chains.
- Use `Promise.all` for independent async operations that can run in parallel.
- Use `Promise.allSettled` when you need results from all operations, even if some fail.
- Provide cancellation via `AbortController` for long-running or user-initiated requests.
- Avoid `await` inside `forEach` — use `for...of` or `Promise.all(array.map(...))`.
- Keep `async` functions focused: one async function should do one logical operation.
- Use `AbortSignal.timeout()` to prevent requests from hanging indefinitely.

---

## Exercises

1. **Promise from scratch.** Create a function `wait(ms)` that returns a promise which resolves after `ms` milliseconds. Then chain three calls: `wait(500).then(...).then(...)` to log messages at 500ms intervals.

2. **Sequential to parallel.** Given an array of 5 URLs, first fetch them sequentially using a `for...of` loop with `await`. Then refactor to fetch all 5 in parallel using `Promise.all`. Compare the timing.

3. **Promise.allSettled reporter.** Write a function that takes an array of promises and returns a summary: `{ fulfilled: 3, rejected: 2, total: 5 }`. Use `Promise.allSettled`.

4. **Retry with backoff.** Write `retryFetch(url, maxRetries)` that retries a failed fetch up to `maxRetries` times, with exponential backoff (wait 1s, 2s, 4s, ...). Use async/await.

5. **Event loop quiz.** Without running the code, predict the output order of this snippet, then verify:
    ```js
    console.log("A");
    setTimeout(() => console.log("B"), 0);
    Promise.resolve().then(() => console.log("C"));
    queueMicrotask(() => console.log("D"));
    console.log("E");
    ```

6. **Cancellable delay.** Implement `cancellableDelay(ms)` that returns `{ promise, cancel }`. The promise resolves after `ms` milliseconds, but calling `cancel()` rejects it with an `AbortError`. Use `AbortController` internally.

7. **Timeout wrapper.** Write `withTimeout(promise, ms)` that rejects with a `TimeoutError` if the given promise does not settle within `ms` milliseconds. The original promise should be unaffected.

8. **Async generator.** Write an async generator `paginate(url)` that fetches pages from a paginated API. Each call to `next()` fetches the next page. Stop when there are no more pages.

---

## Mini-Lab

Run the Node.js examples in [`../../examples-node/phase-02/ch-15-async/`](../../examples-node/phase-02/ch-15-async/) to see every concept from this chapter in action:

```bash
node examples-node/phase-02/ch-15-async/01-promises.js
node examples-node/phase-02/ch-15-async/02-async-await.js
node examples-node/phase-02/ch-15-async/03-abort-controller.js
```

The examples cover:
- Creating and chaining Promises, with `Promise.all`, `allSettled`, and `race`
- async/await with error handling, parallel execution, and sequential vs parallel comparison
- AbortController with fetch simulation, timeouts, and custom abortable functions

---

## What's Next

With asynchronous JavaScript mastered, Chapter 16 covers HTTP, the Fetch API, and working with real APIs — putting your async skills to practical use.
