# Chapter 19 — Testing

## Learning Objectives

By the end of this chapter you will be able to:

- Explain why automated testing matters and what the test pyramid is.
- Distinguish between unit tests, integration tests, and end-to-end tests.
- Write unit tests using Vitest with `describe`, `it`, and `expect`.
- Use common matchers (`toBe`, `toEqual`, `toThrow`, `toContain`, etc.).
- Test asynchronous code with `async/await` in test cases.
- Test DOM manipulation using `happy-dom` or `jsdom` environments.
- Mock functions and modules using `vi.fn()` and `vi.mock()`.
- Organize tests effectively using best practices for file placement and naming.

---

## 19.1 Why Test?

Code without tests works until it does not. Manual testing is slow, inconsistent, and does not scale. Automated tests:

- **Catch bugs early** — before they reach users.
- **Enable refactoring with confidence** — change the implementation, run the tests, and know whether anything broke.
- **Document behavior** — tests describe what the code is supposed to do in executable form.
- **Speed up development** — fixing a bug found by a test takes minutes. Fixing the same bug in production takes hours or days.

The cost of not testing is always higher than the cost of testing. It just arrives later.

---

## 19.2 The Test Pyramid

The test pyramid describes the ideal balance of test types:

```
        /  E2E  \          Few, slow, expensive
       /----------\
      / Integration \      Some, moderate speed
     /----------------\
    /    Unit Tests     \  Many, fast, cheap
   /--------------------\
```

### Unit Tests

- Test a **single function or module** in isolation.
- Fast (milliseconds each), no dependencies on databases, APIs, or the DOM.
- Should make up the **majority** of your tests.
- Example: testing that `add(2, 3)` returns `5`.

### Integration Tests

- Test **multiple modules working together**.
- May involve the DOM, a local database, or a test server.
- Slower than unit tests but catch problems that unit tests miss.
- Example: testing that a form component validates input, calls the API, and updates the UI.

### End-to-End (E2E) Tests

- Test the **entire application** from the user's perspective.
- Run in a real or simulated browser (Playwright, Cypress).
- Slow and expensive, but catch real-world issues.
- Example: testing that a user can sign up, log in, and place an order.

### The Right Balance

Write many unit tests, some integration tests, and a few E2E tests. If your unit tests are solid, higher-level tests can focus on workflows rather than edge cases.

---

## 19.3 Vitest — A Modern Test Runner

Vitest is a fast test runner built on top of Vite. It supports:

- ES modules natively (no transpilation needed).
- The same configuration as Vite (aliases, transforms, plugins).
- Jest-compatible API (`describe`, `it`, `expect`, `vi`).
- Watch mode, coverage, and snapshot testing.

### Setup

```bash
npm install -D vitest
```

Add a test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage"
  }
}
```

### Running Tests

```bash
npx vitest          # Watch mode (re-runs on file changes)
npx vitest run      # Single run (for CI)
npx vitest run --reporter=verbose  # Detailed output
```

---

## 19.4 Writing Unit Tests

### Basic Structure

```js
import { describe, it, expect } from "vitest";
import { add, multiply } from "./math.js";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("handles zero", () => {
    expect(add(0, 0)).toBe(0);
  });
});

describe("multiply", () => {
  it("multiplies two numbers", () => {
    expect(multiply(3, 4)).toBe(12);
  });
});
```

- **`describe`** — groups related tests together.
- **`it`** (or `test`) — defines a single test case.
- **`expect`** — creates an assertion. Chain a matcher to verify the result.

### Common Matchers

| Matcher | Purpose | Example |
|---|---|---|
| `.toBe(value)` | Strict equality (`===`) | `expect(1 + 1).toBe(2)` |
| `.toEqual(value)` | Deep equality (objects/arrays) | `expect({a: 1}).toEqual({a: 1})` |
| `.toBeTruthy()` | Truthy check | `expect("hello").toBeTruthy()` |
| `.toBeFalsy()` | Falsy check | `expect(0).toBeFalsy()` |
| `.toBeNull()` | Strictly `null` | `expect(null).toBeNull()` |
| `.toBeUndefined()` | Strictly `undefined` | `expect(undefined).toBeUndefined()` |
| `.toBeGreaterThan(n)` | `> n` | `expect(10).toBeGreaterThan(5)` |
| `.toBeLessThan(n)` | `< n` | `expect(3).toBeLessThan(7)` |
| `.toContain(item)` | Array/string contains | `expect([1,2,3]).toContain(2)` |
| `.toHaveLength(n)` | Array/string length | `expect("abc").toHaveLength(3)` |
| `.toThrow()` | Function throws an error | `expect(() => fn()).toThrow()` |
| `.toThrow(message)` | Throws with specific message | `expect(() => fn()).toThrow("fail")` |
| `.toMatch(regex)` | String matches regex | `expect("hello").toMatch(/ell/)` |
| `.toHaveProperty(key)` | Object has a property | `expect(obj).toHaveProperty("name")` |

### Negation

Add `.not` before any matcher to invert it:

```js
expect(1 + 1).not.toBe(3);
expect([1, 2, 3]).not.toContain(4);
```

### toBe vs toEqual

- `toBe` uses strict equality (`===`). Use it for primitives.
- `toEqual` checks deep equality. Use it for objects and arrays.

```js
expect({ a: 1 }).toBe({ a: 1 });    // FAILS — different references
expect({ a: 1 }).toEqual({ a: 1 }); // PASSES — same structure
```

---

## 19.5 Testing Async Code

### async/await in Tests

Vitest handles async tests naturally — just make the test function `async`:

```js
import { describe, it, expect } from "vitest";

async function fetchUser(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  return response.json();
}

describe("fetchUser", () => {
  it("returns a user with the correct id", async () => {
    const user = await fetchUser(1);
    expect(user.id).toBe(1);
    expect(user.name).toBeDefined();
  });
});
```

### Testing Rejected Promises

Use `rejects` to test that a promise rejects:

```js
async function failingOperation() {
  throw new Error("Something broke");
}

it("rejects with an error", async () => {
  await expect(failingOperation()).rejects.toThrow("Something broke");
});
```

### Testing Resolved Promises

Use `resolves` for the opposite:

```js
async function getValue() {
  return 42;
}

it("resolves to 42", async () => {
  await expect(getValue()).resolves.toBe(42);
});
```

### Timers and Fake Time

If your code uses `setTimeout` or `setInterval`, use fake timers:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function delayedGreeting(callback) {
  setTimeout(() => callback("Hello!"), 1000);
}

describe("delayedGreeting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls the callback after 1 second", () => {
    const callback = vi.fn();
    delayedGreeting(callback);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledWith("Hello!");
  });
});
```

---

## 19.6 Testing DOM Manipulation

### Setup with happy-dom or jsdom

By default, Vitest runs in a Node.js environment (no `document`, no `window`). To test DOM code, configure a DOM environment:

```js
// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom", // or "jsdom"
  },
});
```

Or set it per-file with a comment:

```js
// @vitest-environment happy-dom
```

### DOM Test Example

```js
import { describe, it, expect, beforeEach } from "vitest";

function createCounter(container) {
  const button = document.createElement("button");
  let count = 0;

  button.textContent = `Count: ${count}`;
  button.addEventListener("click", () => {
    count += 1;
    button.textContent = `Count: ${count}`;
  });

  container.appendChild(button);
  return button;
}

describe("createCounter", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("renders a button with initial count of 0", () => {
    const button = createCounter(container);
    expect(button.textContent).toBe("Count: 0");
  });

  it("increments count on click", () => {
    const button = createCounter(container);
    button.click();
    expect(button.textContent).toBe("Count: 1");
    button.click();
    button.click();
    expect(button.textContent).toBe("Count: 3");
  });
});
```

**`happy-dom`** is faster than `jsdom` and sufficient for most tests. Use `jsdom` if you need more complete browser API emulation.

---

## 19.7 Mocking

### Why Mock?

Tests should be fast and deterministic. Mocking replaces real implementations with controlled substitutes:

- Replace a network call with a fake response.
- Replace a database query with test data.
- Verify that a function was called with the right arguments.

### vi.fn() — Mock Functions

`vi.fn()` creates a mock function that tracks calls:

```js
import { it, expect, vi } from "vitest";

it("tracks calls", () => {
  const mockFn = vi.fn();

  mockFn("hello");
  mockFn("world");

  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith("hello");
  expect(mockFn).toHaveBeenLastCalledWith("world");
});
```

### Mock Return Values

```js
const mockFn = vi.fn()
  .mockReturnValueOnce(10)
  .mockReturnValueOnce(20)
  .mockReturnValue(0); // default for subsequent calls

console.log(mockFn()); // 10
console.log(mockFn()); // 20
console.log(mockFn()); // 0
```

### Mock Implementations

```js
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ id: 1, name: "Alice" }),
});
```

### vi.mock() — Module Mocking

Replace an entire module with a mock:

```js
import { describe, it, expect, vi } from "vitest";

// Mock the entire module
vi.mock("./api.js", () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: "Alice" }),
  fetchPosts: vi.fn().mockResolvedValue([]),
}));

// Now import uses the mock
import { fetchUser } from "./api.js";

describe("with mocked API", () => {
  it("returns the mock user", async () => {
    const user = await fetchUser(1);
    expect(user.name).toBe("Alice");
    expect(fetchUser).toHaveBeenCalledWith(1);
  });
});
```

### vi.spyOn() — Spy on Existing Methods

Spy on an existing method without replacing it (or with a custom implementation):

```js
const obj = {
  greet(name) {
    return `Hello, ${name}!`;
  },
};

const spy = vi.spyOn(obj, "greet");

obj.greet("Alice");

expect(spy).toHaveBeenCalledWith("Alice");
expect(spy).toHaveReturnedWith("Hello, Alice!");

spy.mockRestore(); // Restore the original implementation
```

---

## 19.8 Test Organization Best Practices

### File Placement

Two common approaches:

**Co-located tests** (recommended):
```
src/
  math.js
  math.test.js      ← right next to the source
  cart.js
  cart.test.js
```

**Separate test directory**:
```
src/
  math.js
  cart.js
tests/
  math.test.js
  cart.test.js
```

Co-located tests are easier to find and maintain. When you rename or move a source file, the test file is right there.

### Naming Conventions

- Test files: `<module>.test.js` or `<module>.spec.js`.
- Describe blocks: use the module or function name.
- Test names: describe the behavior, not the implementation.

```js
// Good — describes behavior
it("returns the sum of two numbers", () => { ... });

// Bad — describes implementation
it("calls the add function and checks the result", () => { ... });
```

### Arrange, Act, Assert (AAA)

Structure each test in three phases:

```js
it("calculates the total with tax", () => {
  // Arrange — set up test data
  const items = [{ price: 10 }, { price: 20 }];
  const taxRate = 0.1;

  // Act — execute the code under test
  const total = calculateTotal(items, taxRate);

  // Assert — verify the result
  expect(total).toBe(33); // (10 + 20) * 1.1
});
```

### Test Independence

Each test should be independent. Do not rely on the order tests run in. Use `beforeEach` to set up fresh state:

```js
let cart;

beforeEach(() => {
  cart = new ShoppingCart(); // Fresh cart for every test
});
```

### What to Test

- **Happy path** — the normal, expected usage.
- **Edge cases** — empty inputs, boundary values, large data sets.
- **Error cases** — invalid inputs, network failures, missing data.

### What NOT to Test

- Third-party library internals (test your usage of them, not their code).
- Implementation details (test behavior, not how it is achieved).
- Trivial code with no logic (simple getters/setters).

---

## Tricky Things & Gotchas

1. **`toBe` vs `toEqual`** — `expect({}).toBe({})` fails because they are different objects. Use `toEqual` for deep comparison of objects and arrays.

2. **Forgetting `await` in async tests** — if you forget `await`, the test passes even if the assertion would fail, because the promise is not awaited.

3. **Mocks persist between tests** — always call `vi.restoreAllMocks()` in `afterEach` or configure `restoreMocks: true` in your Vitest config.

4. **`toThrow` requires wrapping in a function** — `expect(fn()).toThrow()` calls `fn` immediately and tests the return value. Write `expect(() => fn()).toThrow()` to catch the thrown error.

5. **Import order with `vi.mock`** — `vi.mock()` calls are hoisted to the top of the file, so they run before imports. This can be confusing if you are not aware of it.

6. **Snapshot tests can become stale** — snapshots are easy to create but easy to rubber-stamp when they change. Review snapshot diffs carefully.

7. **Testing private functions** — if you find yourself wanting to test a private function, consider whether it should be a separate module or whether you can test it through the public API.

8. **Too many mocks make tests brittle** — heavily mocked tests can pass even when the real code is broken. Mock sparingly and prefer testing real behavior.

---

## Best Practices

- Write tests alongside your code, not after the fact.
- Follow the AAA pattern (Arrange, Act, Assert) for clarity.
- Prefer testing behavior over implementation details.
- Use `beforeEach` for setup and `afterEach` for cleanup to keep tests independent.
- Mock external dependencies (APIs, databases), but not internal logic.
- Run tests in watch mode during development for instant feedback.
- Aim for meaningful coverage, not 100% coverage. Cover critical paths and edge cases.
- Use descriptive test names that read like documentation.

---

## Exercises

1. **First test.** Create a `reverse(str)` function and write tests for it: normal string, empty string, single character, string with spaces, palindrome.

2. **Object testing.** Write a `createUser(name, age)` function that returns `{ name, age, id: crypto.randomUUID() }`. Test that it returns an object with the correct name and age, and that the id is a string. (Hint: you cannot test the exact id value.)

3. **Error testing.** Write a `divide(a, b)` function that throws when `b` is zero. Write tests that verify the error is thrown with the correct message and that valid divisions return the correct result.

4. **Async testing.** Write an async `fetchData(url)` function. Write tests that mock `fetch` and verify the function handles both successful responses and errors correctly.

5. **Mock function.** Write a `forEach(array, callback)` function. Test it using `vi.fn()` to verify the callback is called the right number of times with the right arguments.

6. **DOM testing.** Write a function that creates a `<ul>` from an array of strings. Test it in a `happy-dom` environment, verifying the correct number of `<li>` elements and their text content.

7. **Timer testing.** Write a `debounce(fn, ms)` function. Test it using `vi.useFakeTimers()` to verify that the debounced function only fires after the delay and that rapid calls reset the timer.

8. **Full module test.** Write a `ShoppingCart` class with `addItem`, `removeItem`, `getTotal`, and `clear` methods. Write a comprehensive test suite covering all methods, edge cases, and error conditions.

---

## Mini-Lab

Run the test examples in [`../../examples-node/phase-03/ch-19-testing/`](../../examples-node/phase-03/ch-19-testing/):

```bash
# Install vitest first if not already installed
npm install -D vitest

# Run the tests
npx vitest run examples-node/phase-03/ch-19-testing/
```

The examples cover:
- Unit tests with `describe`, `it`, and `expect` for a math module
- Testing async functions with `async/await` and mock implementations

---

## What's Next

With testing skills in hand, Chapter 20 covers web performance — understanding the rendering pipeline, optimizing with debounce and throttle, lazy loading, and measuring Web Vitals.
