# Chapter 17 — ES Modules & Code Organization

## Learning Objectives

By the end of this chapter you will be able to:

- Use ES module syntax (`import`/`export`) for named exports, default exports, and re-exports.
- Explain module scope and why top-level variables in a module are not global.
- Use dynamic `import()` to load modules on demand.
- Compare CommonJS (`require`/`module.exports`) with ES modules and know when each applies.
- Organize a codebase using barrel files and feature folders.
- Identify and avoid circular dependency pitfalls.

---

## 17.1 Why Modules?

Before modules, all JavaScript shared a single global scope. Every `<script>` tag could read and overwrite any variable from any other script. This led to name collisions, implicit dependencies, and code that was impossible to reason about in large projects.

Modules solve this by giving each file its own scope. A module explicitly declares what it exports (makes available to others) and what it imports (needs from others). The result is predictable, maintainable, and testable code.

---

## 17.2 ES Module Syntax

### Named Exports

A module can export any number of named bindings:

```js
// math.js
export const PI = 3.141592653589793;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

### Named Imports

```js
// main.js
import { add, multiply, PI } from "./math.js";

console.log(add(2, 3));      // 5
console.log(multiply(4, PI)); // 12.566...
```

You can rename imports to avoid collisions:

```js
import { add as sum } from "./math.js";
console.log(sum(2, 3)); // 5
```

### Importing Everything (Namespace Import)

```js
import * as math from "./math.js";
console.log(math.add(1, 2));  // 3
console.log(math.PI);          // 3.141592653589793
```

### Default Exports

Each module can have **one** default export. This is useful when a module has a single primary value:

```js
// logger.js
export default function log(message) {
  console.log(`[LOG] ${message}`);
}
```

Importing a default export — you choose the name:

```js
import log from "./logger.js";
log("Hello"); // [LOG] Hello
```

You can also import default and named exports together:

```js
import log, { someHelper } from "./logger.js";
```

### Export List Syntax

You can declare everything first, then export at the bottom:

```js
const PI = 3.14159;
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }

export { PI, add, subtract };
```

You can rename exports:

```js
export { add as sum, subtract as difference };
```

---

## 17.3 Re-Exports

Re-exports let you forward exports from one module through another without importing them into the current scope:

```js
// utils/index.js (barrel file)
export { add, multiply } from "./math.js";
export { default as log } from "./logger.js";
export { formatDate } from "./date.js";
```

Now consumers import from a single entry point:

```js
import { add, log, formatDate } from "./utils/index.js";
```

### Re-Export Variations

```js
// Re-export everything from a module
export * from "./math.js";

// Re-export everything under a namespace
export * as math from "./math.js";

// Re-export a default as a named export
export { default as Logger } from "./logger.js";
```

---

## 17.4 Module Scope

Every ES module has its own top-level scope. Variables declared at the top of a module are **not** added to the global object:

```js
// counter.js
let count = 0; // Private to this module

export function increment() {
  count += 1;
  return count;
}

export function getCount() {
  return count;
}
```

```js
// main.js
import { increment, getCount } from "./counter.js";

increment(); // 1
increment(); // 2
console.log(getCount()); // 2
console.log(typeof count); // "undefined" — count is not accessible here
```

### Modules Are Singletons

A module is evaluated **once**, no matter how many files import it. All importers share the same module instance:

```js
// fileA.js
import { increment } from "./counter.js";
increment(); // 1

// fileB.js
import { getCount } from "./counter.js";
console.log(getCount()); // 1 — same counter instance
```

### Imports Are Live Bindings

Named imports are **live read-only bindings** to the exported variable, not copies:

```js
// counter.js
export let count = 0;
export function increment() { count += 1; }

// main.js
import { count, increment } from "./counter.js";
console.log(count); // 0
increment();
console.log(count); // 1 — the binding updated
// count = 5; // TypeError — imports are read-only
```

---

## 17.5 Dynamic import()

Static `import` declarations are hoisted and resolved before any code runs. Sometimes you want to load a module **conditionally** or **on demand**. That is what dynamic `import()` does:

```js
// Load a module only when needed
async function loadChart() {
  const { renderChart } = await import("./chart.js");
  renderChart(data);
}
```

### Use Cases

1. **Code splitting** — load heavy modules only when the user navigates to a feature.
2. **Conditional loading** — load polyfills only in browsers that need them.
3. **Computed module paths** — build the path dynamically (not possible with static `import`).

```js
// Conditional loading
if (needsPolyfill()) {
  await import("./polyfills.js");
}

// Computed path
const locale = getUserLocale(); // "en", "fr", etc.
const messages = await import(`./i18n/${locale}.js`);
```

### Dynamic import() Returns a Promise

`import()` always returns a Promise that resolves to the module's namespace object:

```js
const module = await import("./math.js");
console.log(module.add(1, 2));    // 3
console.log(module.default);       // the default export, if any
```

---

## 17.6 CommonJS vs ES Modules

Node.js historically used CommonJS (CJS). ES modules (ESM) are now the standard, but you will encounter both.

| Feature | CommonJS (CJS) | ES Modules (ESM) |
|---|---|---|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous (static analysis) |
| Evaluation | At runtime | Parsed before execution |
| Top-level `this` | `module.exports` | `undefined` |
| File extension | `.js` (default in Node) or `.cjs` | `.mjs` or `.js` with `"type": "module"` |
| Tree-shaking | Not possible | Supported by bundlers |
| Dynamic paths | `require(variable)` works | Only via `import()` |
| Live bindings | No (values are copied) | Yes (imports are live references) |

### Enabling ESM in Node.js

Option 1 — Set `"type": "module"` in `package.json`:

```json
{
  "type": "module"
}
```

All `.js` files in the package are treated as ESM. Use `.cjs` for any file that must remain CommonJS.

Option 2 — Use the `.mjs` extension for individual files.

### Importing CJS from ESM

You can `import` a CommonJS module from an ES module, but only the default export is available:

```js
// works — default import of the entire module.exports object
import lodash from "lodash";

// does NOT work — CJS does not have named exports for ESM
// import { map } from "lodash"; // Error
```

Many packages now ship both CJS and ESM entry points via the `"exports"` field in `package.json`.

---

## 17.7 Organizing Code

### Feature Folders

Group related files by feature rather than by type:

```
src/
  auth/
    auth-service.js
    auth-validators.js
    auth-constants.js
    index.js          ← barrel file
  cart/
    cart-service.js
    cart-utils.js
    index.js
  shared/
    http-client.js
    format.js
    index.js
```

Each feature folder has an `index.js` barrel that exports the folder's public API:

```js
// auth/index.js
export { login, logout, isAuthenticated } from "./auth-service.js";
export { validateEmail, validatePassword } from "./auth-validators.js";
export { SESSION_TIMEOUT } from "./auth-constants.js";
```

Consumers import from the folder:

```js
import { login, validateEmail } from "./auth/index.js";
```

### Barrel Files

A **barrel file** (`index.js`) collects and re-exports the public API of a folder. Benefits:

- **Clean imports** — consumers do not need to know the internal file structure.
- **Encapsulation** — files not re-exported from the barrel are effectively private.
- **Refactoring freedom** — you can rename or split internal files without breaking imports elsewhere.

### Naming Conventions

- Use kebab-case for file names: `auth-service.js`, not `authService.js`.
- One primary export per file (classes, large functions, or related function groups).
- Keep barrel files thin — only re-exports, no logic.

---

## 17.8 Circular Dependencies

A circular dependency occurs when module A imports module B, and module B imports module A (directly or through a chain). JavaScript allows this, but it can cause surprising behavior.

### What Happens

When the engine encounters a circular import, the partially-evaluated module is returned:

```js
// a.js
import { b } from "./b.js";
export const a = "A";
console.log("a.js sees b:", b);

// b.js
import { a } from "./a.js";
export const b = "B";
console.log("b.js sees a:", a);
```

One of the modules will see `undefined` for the other's export, because the other module has not finished evaluating yet.

### How to Fix Circular Dependencies

1. **Extract shared code into a third module** that both can import.
2. **Restructure the dependency graph** so that dependencies flow in one direction.
3. **Use lazy access** — import the module but access the export inside a function that runs later (after both modules have initialized).

```js
// Instead of accessing at module level:
// const x = otherModule.value; // might be undefined

// Access inside a function:
function doSomething() {
  return otherModule.value; // safe — module is fully loaded by now
}
```

---

## Tricky Things & Gotchas

1. **File extensions are required in ESM** — unlike CommonJS, you must write `import { add } from "./math.js"`, not `"./math"`. Bundlers may resolve bare paths, but native ESM requires the full path.

2. **`import` is hoisted** — all `import` declarations are evaluated before any code in the module runs. You cannot put an `import` inside an `if` block. Use `import()` for conditional loading.

3. **Default export is just a named export called `default`** — `export default function() {}` is sugar for `export { myFunction as default }`. You can re-export defaults: `export { default } from "./other.js"`.

4. **`export default` with `const`/`let` does not work the way you expect** — `export default const x = 5` is a syntax error. Write `const x = 5; export default x;` or simply `export default 5`.

5. **`import *` does not include the default export in the namespace object's own properties in an intuitive way** — technically `module.default` exists, but prefer importing the default explicitly.

6. **Barrel files can hurt tree-shaking** — if a barrel re-exports everything (`export * from ...`) and the bundler cannot determine what is unused, the entire module may be included. Keep barrel files explicit.

7. **Circular dependency debugging is hard** — there is no error thrown. The import silently evaluates to `undefined`. Add logging at module load time to trace evaluation order if you suspect a circular issue.

8. **Top-level `await` in a module delays all importers** — any module that imports a module using top-level `await` must wait for it to resolve before it can execute.

---

## Best Practices

- Use named exports as the default choice. Reserve default exports for modules with a single, obvious primary export.
- Always include file extensions in import paths for portability and clarity.
- Use barrel files to define a module folder's public API, but keep them explicit (avoid `export *` in large projects).
- Organize code by feature, not by file type. Group related files together.
- Avoid circular dependencies. If you spot one, refactor immediately — extract shared code into a separate module.
- Prefer static `import` for anything that is always needed. Use dynamic `import()` only for code splitting and conditional loading.
- Use `"type": "module"` in `package.json` for new Node.js projects so all `.js` files are ESM by default.
- Keep modules small and focused. A module should do one thing well.

---

## Exercises

1. **Named exports.** Create a `string-utils.js` module that exports `capitalize(str)`, `reverse(str)`, and `truncate(str, maxLength)`. Import and use all three in a separate file.

2. **Default export.** Create a `Calculator` class with `add`, `subtract`, `multiply`, and `divide` methods. Export it as the default export. Import and use it in another file.

3. **Barrel file.** Create a `utils/` folder with three modules (`math.js`, `string.js`, `date.js`). Write an `index.js` barrel that re-exports the public functions from each. Show that consumers can import everything from `./utils/index.js`.

4. **Dynamic import.** Write a CLI script that asks the user for a command (`"math"` or `"string"`) and dynamically imports the corresponding module only when requested. Verify that the unused module is never loaded.

5. **Module singleton.** Create a `config.js` module that exports a mutable `settings` object. Import it in two different files and show that changes in one file are visible in the other (proving modules are singletons).

6. **Circular dependency investigation.** Intentionally create a circular dependency between two modules. Log the import values at module load time. Observe which value is `undefined` and explain why based on evaluation order.

7. **CJS vs ESM.** Create a simple module in both CommonJS and ESM syntax. Write a comparison table of the differences you observe in behavior (live bindings, `this` value, loading).

8. **Feature folder refactor.** Take a flat file structure with 8+ files and reorganize it into feature folders with barrel files. Show the before/after import statements and explain the benefits.

---

## Mini-Lab

Run the Node.js examples in [`../../examples-node/phase-03/ch-17-modules/`](../../examples-node/phase-03/ch-17-modules/) to see every concept from this chapter in action:

```bash
node examples-node/phase-03/ch-17-modules/main.js
node examples-node/phase-03/ch-17-modules/dynamic-import.js
```

The examples cover:
- Named and default exports/imports across multiple modules
- Module scope isolation and singleton behavior
- Dynamic `import()` for on-demand module loading

---

## What's Next

With modules organized, Chapter 18 covers the professional tooling ecosystem — npm, Vite, ESLint, and Prettier — that makes working with modules seamless in real projects.
