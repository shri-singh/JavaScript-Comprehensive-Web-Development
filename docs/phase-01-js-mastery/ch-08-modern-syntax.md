# Chapter 8 — Modern Syntax

## Learning Objectives

By the end of this chapter you will be able to:

- Destructure arrays and objects, including nested structures, with defaults and renamed bindings.
- Use the spread operator to copy and merge arrays and objects, and rest parameters to collect function arguments.
- Navigate deeply nested data safely with optional chaining (`?.`).
- Distinguish nullish coalescing (`??`) from logical OR (`||`) and choose the correct one for default values.
- Apply logical assignment operators (`||=`, `??=`, `&&=`) to write concise initialisation patterns.
- Use template literals and tagged templates for string interpolation and DSLs.
- Explain the purpose of `Symbol` and when to use it.
- Describe `WeakMap` and `WeakSet` and their garbage-collection benefits.

---

## 8.1 Destructuring

Destructuring extracts values from arrays or properties from objects into distinct variables in a single statement.

### Array Destructuring

```js
const [first, second, third] = [10, 20, 30];

// Skip elements
const [, , thirdOnly] = [10, 20, 30]; // thirdOnly = 30

// Rest element
const [head, ...tail] = [1, 2, 3, 4]; // head = 1, tail = [2, 3, 4]

// Default values
const [a = 0, b = 0, c = 0] = [1, 2]; // c = 0

// Swap variables without a temp
let x = 1, y = 2;
[x, y] = [y, x]; // x = 2, y = 1
```

### Object Destructuring

```js
const { name, age } = { name: "Alice", age: 30 };

// Rename
const { name: userName, age: userAge } = { name: "Bob", age: 25 };

// Defaults
const { theme = "light", lang = "en" } = { theme: "dark" };
// theme = "dark", lang = "en"

// Rename + default
const { role: userRole = "guest" } = {};
// userRole = "guest"
```

### Nested Destructuring

```js
const response = {
  data: {
    user: { id: 1, name: "Alice" },
    meta: { page: 1, total: 100 },
  },
};

const {
  data: {
    user: { name: userName2 },
    meta: { total },
  },
} = response;
```

### Function Parameter Destructuring

```js
const greet = ({ name, greeting = "Hello" }) => `${greeting}, ${name}!`;
greet({ name: "Alice" });            // "Hello, Alice!"
greet({ name: "Bob", greeting: "Hi" }); // "Hi, Bob!"
```

---

## 8.2 Spread and Rest

The `...` syntax serves two purposes depending on context.

### Spread — Expanding

```js
// Arrays
const a = [1, 2, 3];
const b = [...a, 4, 5];              // [1, 2, 3, 4, 5]

// Objects (shallow copy / merge)
const defaults = { theme: "light", lang: "en" };
const prefs = { theme: "dark" };
const config = { ...defaults, ...prefs }; // { theme: "dark", lang: "en" }

// Function arguments
Math.max(...[3, 7, 2]);              // 7
```

### Rest — Collecting

```js
// Function parameters
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);

// Object rest
const { id, ...rest } = { id: 1, name: "Alice", age: 30 };
// id = 1, rest = { name: "Alice", age: 30 }

// Array rest
const [first, ...others] = [10, 20, 30, 40];
// first = 10, others = [20, 30, 40]
```

### Shallow Copy Gotcha

Spread creates a **shallow** copy. Nested objects still share the same reference:

```js
const original = { a: 1, nested: { b: 2 } };
const copy = { ...original };
copy.nested.b = 99;
console.log(original.nested.b); // 99 — same reference!
```

Use `structuredClone(obj)` for a deep copy (available in Node 17+).

---

## 8.3 Optional Chaining (`?.`)

Optional chaining short-circuits to `undefined` if the left-hand side is `null` or `undefined`, preventing `TypeError`:

```js
const user = { profile: { address: { city: "Portland" } } };

user.profile?.address?.city;     // "Portland"
user.settings?.theme;            // undefined (no error)
user.getAddress?.();             // undefined (method does not exist)
user.scores?.[0];                // undefined (property does not exist)
```

### Variants

| Syntax | Use case |
|---|---|
| `obj?.prop` | Property access |
| `obj?.[expr]` | Computed property access |
| `obj?.method()` | Method call |

Optional chaining is **read-only** — you cannot use it on the left side of an assignment.

---

## 8.4 Nullish Coalescing (`??`)

The `??` operator returns the right-hand side only when the left is `null` or `undefined` — not for other falsy values like `0`, `""`, or `false`:

```js
const port = 0;
port || 3000;   // 3000  — wrong! 0 is falsy
port ?? 3000;   // 0     — correct! 0 is not null/undefined

const name = "";
name || "Anonymous"; // "Anonymous" — wrong if empty string is valid
name ?? "Anonymous"; // ""          — correct
```

### When to use which

| Operator | Falls through on |
|---|---|
| `\|\|` | All falsy values: `false`, `0`, `""`, `null`, `undefined`, `NaN` |
| `??` | Only `null` and `undefined` |

Use `??` when `0`, `""`, or `false` are legitimate values.

---

## 8.5 Logical Assignment Operators

ES2021 introduced three assignment shortcuts:

```js
// ||= assigns if the current value is falsy
let greeting = "";
greeting ||= "Hello"; // greeting is now "Hello"

// ??= assigns if the current value is null or undefined
let config = { retries: 0 };
config.retries ??= 3;  // stays 0 (not null/undefined)
config.timeout ??= 5000; // set to 5000 (was undefined)

// &&= assigns if the current value is truthy
let user = { name: "Alice", loggedIn: true };
user.loggedIn &&= false; // set to false (was truthy)
```

These are equivalent to:

```js
x ||= y;   // x || (x = y)
x ??= y;   // x ?? (x = y)
x &&= y;   // x && (x = y)
```

The assignment only happens if the condition is met (short-circuit evaluation).

---

## 8.6 Template Literals

### Basic Interpolation

```js
const name = "World";
console.log(`Hello, ${name}!`);          // Hello, World!
console.log(`2 + 2 = ${2 + 2}`);         // 2 + 2 = 4
console.log(`Multi-line
  strings are
  easy.`);
```

### Tagged Templates

A tag function receives the string parts and interpolated values as separate arguments. This enables powerful patterns like escaping, i18n, and SQL template literals:

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const val = values[i] !== undefined ? `**${values[i]}**` : "";
    return result + str + val;
  }, "");
}

const name2 = "Alice";
const age = 30;
highlight`User ${name2} is ${age} years old`;
// "User **Alice** is **30** years old"
```

---

## 8.7 Symbols

A `Symbol` is a primitive type whose value is **guaranteed unique**. Symbols are mainly used as non-colliding property keys:

```js
const id = Symbol("id");
const obj = { [id]: 123, name: "Alice" };

obj[id];              // 123
Object.keys(obj);     // ["name"] — symbols are not enumerable by default
```

### Well-Known Symbols

JavaScript uses symbols internally for protocols like iteration:

- `Symbol.iterator` — defines the default iterator for an object.
- `Symbol.toPrimitive` — controls type coercion.
- `Symbol.hasInstance` — customises `instanceof`.

---

## 8.8 WeakMap and WeakSet

`WeakMap` and `WeakSet` hold **weak references** to their keys (objects only). When no other reference to the key exists, the entry is garbage-collected automatically.

```js
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = { /* expensive computation */ };
  cache.set(obj, result);
  return result;
}
```

**Key differences from Map / Set:**

| Feature | Map / Set | WeakMap / WeakSet |
|---|---|---|
| Key types | Any | Objects only |
| Enumerable | Yes (`.keys()`, `.size`) | No |
| Garbage collection | Prevents GC of keys | Allows GC of keys |

Use cases: caching metadata about objects, storing private data for class instances, tracking DOM elements.

---

## Tricky Things & Gotchas

1. **Destructuring `null` / `undefined` throws** — `const { x } = null` throws a `TypeError`. Add a default: `const { x } = data ?? {}`.
2. **Spread is shallow** — nested objects and arrays are shared by reference. Use `structuredClone` for deep copies.
3. **`??` cannot be mixed with `||` or `&&` without parentheses** — `a || b ?? c` is a syntax error. Write `(a || b) ?? c` or `a || (b ?? c)`.
4. **Optional chaining with `delete`** — `delete obj?.prop` is valid and returns `true` even if `obj` is `null` (it just no-ops).
5. **Tagged templates receive raw strings** — the `strings.raw` array contains the literal characters without escape processing (e.g., `\\n` stays as two characters).
6. **Symbols are not auto-converted to strings** — `"id: " + Symbol("x")` throws a `TypeError`. Use `String(sym)` or `sym.description`.

---

## Best Practices

- Use destructuring in function parameters to make the expected shape obvious at the call site.
- Prefer `??` over `||` for default values when `0`, `""`, or `false` are valid.
- Use optional chaining to guard deep property access, but do not overuse it as a substitute for proper data validation.
- Use `??=` to lazily initialise properties: `this.cache ??= new Map()`.
- Use `Symbol` for "hidden" metadata keys on objects you do not own.
- Use `WeakMap` instead of `Map` when caching computed data about objects that may be garbage-collected.

---

## Exercises

1. **Nested destructuring.** Given a deeply nested API response object, extract `user.name`, `user.email`, and `meta.pagination.totalPages` into local variables using a single destructuring statement. Provide defaults for missing fields.

2. **Spread merge utility.** Write a `deepMerge(target, source)` function that recursively merges two objects (unlike spread, which is shallow). Handle arrays and primitives correctly.

3. **Optional chaining refactor.** Given a block of code with multiple `if (obj && obj.prop && obj.prop.sub)` checks, refactor to use optional chaining and nullish coalescing.

4. **Tagged template: SQL builder.** Write a `sql` tagged template function that escapes interpolated values by wrapping strings in single quotes and leaving numbers raw. Example: `` sql`SELECT * FROM users WHERE name = ${name} AND age > ${age}` ``.

5. **Logical assignment drill.** Write a `normaliseConfig(cfg)` function that uses `??=` to set defaults for `host`, `port`, `retries`, and `timeout` without overwriting `0` or `""` values that the caller intentionally set.

6. **Symbol registry.** Create a small plugin system where each plugin registers itself using a `Symbol.for("pluginName")` key. Show how `Symbol.for` returns the same symbol across modules.

7. **WeakMap private data.** Implement a `Stack` class that stores its internal array in a `WeakMap` keyed by `this`. Demonstrate that the data is invisible from outside.

8. **Destructuring swap.** Without using a temporary variable, swap the values of three variables `a`, `b`, `c` to become `c`, `a`, `b` using array destructuring.

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-08-modern-syntax/`](../../examples-node/phase-01/ch-08-modern-syntax/) to see every concept from this chapter in action:

- `01-destructuring.js` — array/object destructuring, nested, defaults, rename, function params
- `02-spread-rest.js` — spread arrays/objects, rest params, shallow copy gotcha
- `03-optional-nullish.js` — ?., ??, ??=, ||=, &&= demos

```bash
node examples-node/phase-01/ch-08-modern-syntax/01-destructuring.js
node examples-node/phase-01/ch-08-modern-syntax/02-spread-rest.js
node examples-node/phase-01/ch-08-modern-syntax/03-optional-nullish.js
```

---

## What's Next

In [Chapter 9](./ch-09-errors.md) you will learn about error handling and reliability — built-in error types, try/catch/finally, custom error classes, and defensive coding strategies.
