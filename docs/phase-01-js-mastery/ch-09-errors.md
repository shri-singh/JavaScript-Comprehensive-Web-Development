# Chapter 9 — Errors and Reliability

## Learning Objectives

By the end of this chapter you will be able to:

- Identify and explain the built-in error types: `TypeError`, `ReferenceError`, `SyntaxError`, `RangeError`, `URIError`, and `EvalError`.
- Use `try` / `catch` / `finally` to handle errors gracefully without crashing the program.
- Throw errors intentionally with `throw` and understand when throwing is appropriate.
- Create custom error classes by extending `Error` for domain-specific error handling.
- Apply defensive coding patterns (guard clauses, input validation, fail-fast) to prevent errors before they happen.
- Use debugging strategies (stack traces, breakpoints, logging) to diagnose and fix problems efficiently.

---

## 9.1 Built-In Error Types

JavaScript provides several built-in error constructors. Each creates an object with a `message`, `name`, and `stack` property.

### TypeError

Thrown when a value is not the expected type — for example, calling something that is not a function or reading a property of `undefined`:

```js
null.toString();             // TypeError: Cannot read properties of null
undefined();                 // TypeError: undefined is not a function
```

### ReferenceError

Thrown when accessing a variable that has not been declared or is in the Temporal Dead Zone:

```js
console.log(x);              // ReferenceError: x is not defined
console.log(y);              // ReferenceError: Cannot access 'y' before initialization
let y = 10;
```

### SyntaxError

Thrown at parse time when the code contains invalid syntax. You cannot catch a `SyntaxError` from the same script because the code never runs:

```js
JSON.parse("{bad json}");    // SyntaxError: Unexpected token b in JSON
eval("if (");                // SyntaxError: Unexpected end of input
```

### RangeError

Thrown when a value is outside an allowable range:

```js
new Array(-1);               // RangeError: Invalid array length
(1).toFixed(200);            // RangeError: toFixed() digits argument must be between 0 and 100
function f() { f(); } f();   // RangeError: Maximum call stack size exceeded
```

### URIError

Thrown by `decodeURI` or `decodeURIComponent` when given a malformed URI:

```js
decodeURIComponent("%");     // URIError: URI malformed
```

---

## 9.2 try / catch / finally

### Basic Structure

```js
try {
  // Code that might throw
  const data = JSON.parse(input);
} catch (error) {
  // Handle the error
  console.error("Parse failed:", error.message);
} finally {
  // Always runs — whether an error occurred or not
  console.log("Cleanup complete");
}
```

### The Error Object

Every caught error has at minimum:

| Property | Description |
|---|---|
| `name` | The error type (e.g., `"TypeError"`) |
| `message` | A human-readable description |
| `stack` | A string showing the call stack at the point of the error |

### catch Without a Binding

If you do not need the error object, the binding can be omitted (ES2019+):

```js
try {
  riskyOperation();
} catch {
  console.log("Something went wrong");
}
```

### finally Guarantees

`finally` always executes — even if the `try` or `catch` block returns or throws. This makes it ideal for cleanup (closing files, releasing resources):

```js
function readFile() {
  try {
    return "data";
  } finally {
    console.log("cleanup"); // still runs before "data" is returned
  }
}
```

---

## 9.3 Throwing Errors

Use `throw` to signal that something went wrong. You can throw any value, but best practice is to throw `Error` instances (or subclasses) so that callers always get a `message` and `stack` trace:

```js
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

function parseAge(input) {
  const age = Number(input);
  if (Number.isNaN(age)) throw new TypeError(`Invalid age: ${input}`);
  if (age < 0 || age > 150) throw new RangeError(`Age out of range: ${age}`);
  return age;
}
```

### Rethrowing

Catch errors you can handle; rethrow ones you cannot:

```js
try {
  processData(input);
} catch (error) {
  if (error instanceof ValidationError) {
    showWarning(error.message);
  } else {
    throw error; // not our problem — let it propagate
  }
}
```

---

## 9.4 Custom Error Classes

Extending the built-in `Error` class lets you create domain-specific error types that can be caught selectively:

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.id = id;
  }
}
```

Custom errors integrate naturally with `instanceof`:

```js
try {
  throw new ValidationError("email", "Invalid format");
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Field: ${error.field}, Message: ${error.message}`);
  }
}
```

---

## 9.5 Defensive Coding Patterns

### Guard Clauses

Validate inputs at the top of a function and return or throw early:

```js
function processUser(user) {
  if (!user) throw new TypeError("user is required");
  if (typeof user.name !== "string") throw new TypeError("user.name must be a string");
  // ... rest of the logic
}
```

### Fail Fast

The earlier you detect a problem, the easier it is to debug. Check preconditions at the boundaries of your code (API handlers, public functions), not deep inside implementation details.

### Default Values

Use nullish coalescing and optional chaining to handle missing data gracefully:

```js
const port = config?.server?.port ?? 3000;
const name = user?.profile?.name ?? "Anonymous";
```

### Type Checking at Boundaries

```js
function createUser(name, age) {
  if (typeof name !== "string") throw new TypeError("name must be a string");
  if (!Number.isInteger(age) || age < 0) throw new RangeError("age must be a non-negative integer");
  return { name, age };
}
```

---

## 9.6 Debugging Strategies

1. **Read the stack trace** — the first line is the error message, and subsequent lines show the call chain from most recent to oldest.
2. **Use `console.error`** — it writes to stderr and is visually distinct in most terminals.
3. **Breakpoints** — use `debugger;` in code or set breakpoints in VS Code / Chrome DevTools to pause execution and inspect state.
4. **Narrow the scope** — binary-search the problem by commenting out code or adding targeted `console.log` calls.
5. **Reproduce first** — before fixing, write a test or minimal script that reliably triggers the error.
6. **Check error.cause** — ES2022 introduced `error.cause` for chaining:

```js
try {
  JSON.parse(badInput);
} catch (parseError) {
  throw new Error("Config loading failed", { cause: parseError });
}
```

---

## Tricky Things & Gotchas

1. **`finally` overrides return** — if `finally` contains a `return` statement, it overrides the return value from `try` or `catch`. Avoid returning from `finally`.
2. **Catching `SyntaxError`** — you can only catch syntax errors thrown by `JSON.parse`, `eval`, or `new Function`, not from the parser reading your source file.
3. **Error swallowing** — an empty `catch {}` block silences errors completely. At minimum, log the error.
4. **Non-Error throws** — `throw "oops"` or `throw 42` is legal but provides no stack trace. Always throw `Error` instances.
5. **Async errors** — `try/catch` does not catch errors from callbacks or unhandled Promise rejections. Use `try/catch` inside `async` functions or `.catch()` on Promises (covered in a later chapter).
6. **`instanceof` across realms** — `error instanceof Error` may return `false` if the error was created in a different iframe or VM context.

---

## Best Practices

- Always throw `Error` instances (or subclasses), never primitives.
- Catch only the errors you know how to handle; rethrow the rest.
- Use custom error classes for distinct failure modes in your application.
- Never leave `catch` blocks empty — at minimum log the error.
- Use `finally` for cleanup, not for control flow.
- Validate function inputs early with guard clauses.
- Use `error.cause` (ES2022) to chain errors and preserve the original stack.
- Write meaningful error messages that help the developer identify the problem without reading the source code.

---

## Exercises

1. **Error identification.** Write code snippets that intentionally trigger each of the five built-in error types (`TypeError`, `ReferenceError`, `RangeError`, `URIError`, and runtime `SyntaxError` via `JSON.parse`). Wrap each in `try/catch` and log the error name and message.

2. **Safe JSON parser.** Write a `safeJsonParse(str)` function that returns `{ ok: true, data }` on success and `{ ok: false, error }` on failure, without ever throwing.

3. **Retry with backoff.** Write a `retry(fn, maxAttempts, delayMs)` function that calls `fn()` up to `maxAttempts` times, doubling the delay between each attempt. Return the result on success or throw the last error on exhaustion.

4. **Custom error hierarchy.** Create an `AppError` base class and derive `HttpError` (with `statusCode`), `ValidationError` (with `fields` array), and `DatabaseError` (with `query` string). Write a function that catches each type differently.

5. **Input validator.** Write a `validateEmail(email)` function that throws a `ValidationError` for empty strings, non-string inputs, and strings without an `@` sign. Write a corresponding `try/catch` test harness.

6. **finally investigation.** Write a function with `try/catch/finally` that returns different values from each block. Predict and verify which value is actually returned.

7. **Error cause chain.** Write a three-level function chain where each level catches the error from the level below and rethrows with `{ cause }`. At the top level, walk the cause chain and print all messages.

8. **Defensive utility.** Write a `safeDivide(a, b)` function that validates both parameters (must be numbers, `b` must not be zero) and returns an object `{ result }` or `{ error }`. Never throws.

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-09-errors/`](../../examples-node/phase-01/ch-09-errors/) to see every concept from this chapter in action:

- `01-error-types.js` — trigger each built-in error type
- `02-try-catch.js` — try/catch/finally, rethrowing, nested try
- `03-custom-errors.js` — extending Error, validation patterns

```bash
node examples-node/phase-01/ch-09-errors/01-error-types.js
node examples-node/phase-01/ch-09-errors/02-try-catch.js
node examples-node/phase-01/ch-09-errors/03-custom-errors.js
```

---

## What's Next

In the next phase, you will build on this foundation to tackle asynchronous JavaScript — callbacks, Promises, `async`/`await`, and the event loop — where error handling takes on new dimensions with rejected Promises and unhandled rejections.
