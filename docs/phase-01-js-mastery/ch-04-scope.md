# Chapter 4 — Variables & Scope

## Learning Objectives

By the end of this chapter you will be able to:

- Explain the behavioural differences between `var`, `let`, and `const` and choose the right one for each situation.
- Define hoisting and predict how the engine treats `var` declarations, `let`/`const` declarations, and function declarations before code executes.
- Describe the Temporal Dead Zone (TDZ) and explain why accessing a `let` or `const` variable before its declaration throws a `ReferenceError`.
- Distinguish block scope from function scope and trace which variable a given line of code resolves to.
- Write a basic closure and explain why the inner function retains access to the outer function's variables after the outer function has returned.
- Identify and avoid global scope pollution.

---

## 4.1 `var`, `let`, and `const`

JavaScript has three ways to declare variables. They differ in **scope**, **hoisting**, and **mutability**.

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisted? | Yes (initialised to `undefined`) | Yes (but in TDZ) | Yes (but in TDZ) |
| Re-declarable in same scope? | Yes | No | No |
| Re-assignable? | Yes | Yes | No |
| Attached to `globalThis` when declared at top level? | Yes | No | No |

```js
// var — function-scoped
function example() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10 — var ignores block boundaries
}

// let — block-scoped
function example2() {
  if (true) {
    let y = 10;
  }
  // console.log(y); // ReferenceError — y is confined to the if-block
}

// const — block-scoped, cannot be re-assigned
const PI = 3.14159;
// PI = 3; // TypeError: Assignment to constant variable
```

> **Important:** `const` prevents _re-assignment_, not _mutation_. A `const` object or array can still have its contents changed.

```js
const user = { name: "Alice" };
user.name = "Bob";      // Allowed — mutating the object
// user = { name: "Charlie" }; // TypeError — re-assigning the binding
```

---

## 4.2 Hoisting

**Hoisting** is the engine's behaviour of processing declarations _before_ executing any code in their scope. It does **not** physically move code — it is a mental model for how the engine allocates names.

### `var` hoisting

`var` declarations are hoisted and initialised to `undefined`:

```js
console.log(a); // undefined (not ReferenceError)
var a = 5;
console.log(a); // 5
```

The engine sees this as:

```js
var a;            // declaration hoisted, initialised to undefined
console.log(a);   // undefined
a = 5;            // assignment stays in place
console.log(a);   // 5
```

### `let` / `const` hoisting and the TDZ

`let` and `const` are also hoisted, but they enter the **Temporal Dead Zone (TDZ)** from the start of their scope until the declaration is reached. Accessing them in the TDZ throws a `ReferenceError`:

```js
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 10;
console.log(b);    // 10
```

### Function declaration hoisting

Function declarations are hoisted _entirely_ — both the name and the body:

```js
greet(); // "Hello!" — works because the whole function is hoisted

function greet() {
  console.log("Hello!");
}
```

Function _expressions_ (including arrow functions) are **not** hoisted the same way:

```js
// sayHi(); // TypeError: sayHi is not a function (var) or ReferenceError (let/const)
var sayHi = function () {
  console.log("Hi!");
};
```

---

## 4.3 Temporal Dead Zone (TDZ)

The TDZ exists from the moment the scope opens until the `let`/`const` declaration is encountered at runtime.

```js
{
  // TDZ for `x` starts here
  // console.log(x); // ReferenceError
  // typeof x;       // ReferenceError (unlike var — typeof is NOT safe in TDZ)
  let x = 42;        // TDZ ends here
  console.log(x);    // 42
}
```

**Why does the TDZ exist?** It catches bugs. With `var`, using a variable before assignment silently gives `undefined`, which can cause hard-to-find issues later. The TDZ makes these mistakes immediately visible.

---

## 4.4 Block Scope vs Function Scope

**Block scope** means a variable is confined to the nearest `{ }` — an `if`, `for`, `while`, or standalone block.

**Function scope** means a variable is visible throughout the entire function, regardless of blocks inside it.

```js
function demo() {
  // Function scope — `var` lives here
  for (var i = 0; i < 3; i++) {
    // i is function-scoped
  }
  console.log(i); // 3 — still accessible!

  for (let j = 0; j < 3; j++) {
    // j is block-scoped to this for-loop
  }
  // console.log(j); // ReferenceError
}
```

`let` in a `for` loop creates a **fresh binding per iteration**, which is critical for closures (see section 4.5).

---

## 4.5 Closures — Introduction

A **closure** is a function that remembers the variables from its outer (enclosing) scope, even after that outer function has returned.

```js
function makeCounter() {
  let count = 0;          // this variable is "closed over"
  return function () {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// `count` is not accessible from outside, but the inner function keeps it alive
```

### The classic `var` + loop bug

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 — all callbacks share the same `i`
```

**Fix with `let`:**

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 — each iteration gets its own `i`
```

**Fix with an IIFE (the old way):**

```js
for (var i = 0; i < 3; i++) {
  (function (captured) {
    setTimeout(() => console.log(captured), 100);
  })(i);
}
// Output: 0, 1, 2
```

---

## 4.6 Global Scope Pollution

Variables declared with `var` at the top level (outside any function) become properties of `globalThis` (`window` in browsers, `global` in Node.js):

```js
var leaked = "oops";
console.log(globalThis.leaked); // "oops"

let safe = "better";
console.log(globalThis.safe);   // undefined
```

**Why is this a problem?**

- Third-party scripts or other parts of your own code can accidentally overwrite your globals.
- It makes code harder to reason about and test.
- Naming collisions increase as the codebase grows.

**How to avoid it:**

- Always use `let` or `const` instead of `var`.
- Wrap code in modules (ES modules do not pollute the global scope).
- Use IIFEs when modules are not available.

---

## Tricky Things & Gotchas

1. **`const` does not mean immutable.** `const obj = {}; obj.x = 1;` is perfectly legal. Use `Object.freeze()` if you need shallow immutability.
2. **`typeof` inside the TDZ throws.** Unlike `var` (where `typeof undeclared` returns `"undefined"`), `typeof` on a `let`/`const` variable in the TDZ still throws a `ReferenceError`.
3. **Re-declaring `var` in the same scope is allowed** but re-declaring `let` or `const` throws a `SyntaxError`. Switching from `var` to `let` can surface hidden re-declaration bugs.
4. **`for` loop with `var` shares one binding** across all iterations. If you pass callbacks (like `setTimeout`), they will all see the final value of the loop variable.
5. **Hoisted function declarations inside blocks** have inconsistent behaviour across engines in non-strict mode. Always use strict mode or declare functions at the top level of a scope.

---

## Best Practices

- Default to `const`. Use `let` only when you need to re-assign. Avoid `var` entirely in modern code.
- Declare variables as close to their first use as possible — do not hoist them manually to the top of a function.
- Keep functions small so closures are easy to understand and debug.
- Avoid relying on global variables. If you must share state, use an explicit module export.
- Enable strict mode (`"use strict"` or ES modules, which are strict by default) to prevent accidental global variable creation.
- When working with loops and async callbacks, always use `let` to ensure each iteration captures its own value.

---

## Exercises

1. **Scope prediction.** Without running the code, predict the output:
   ```js
   let x = 1;
   {
     let x = 2;
     {
       let x = 3;
       console.log(x);
     }
     console.log(x);
   }
   console.log(x);
   ```

2. **var leak.** Rewrite this function so the loop variable does not leak outside the `for` block:
   ```js
   function sumTo(n) {
     var total = 0;
     for (var i = 1; i <= n; i++) {
       total += i;
     }
     console.log(i); // should be a ReferenceError
     return total;
   }
   ```

3. **TDZ detective.** Explain why this code throws and fix it:
   ```js
   function createMessage() {
     const greeting = `Hello, ${name}!`;
     const name = "Alice";
     return greeting;
   }
   ```

4. **Counter factory.** Write a `makeCounter(start)` function that returns an object with `increment()`, `decrement()`, and `value()` methods, all sharing a private count via closure.

5. **Loop closure fix.** Given this buggy code, make it print `0 1 2 3 4` using three different techniques (let, IIFE, and a third approach of your choice):
   ```js
   for (var i = 0; i < 5; i++) {
     setTimeout(() => console.log(i), i * 100);
   }
   ```

6. **const mutation.** Create a `const` array, push items to it, and then try to reassign it. Explain the error. Then use `Object.freeze()` and demonstrate what happens when you try to mutate.

7. **Global check.** Write a script that declares variables with `var`, `let`, and `const` at the top level, then checks which ones appear on `globalThis`.

8. **Hoisting quiz.** Predict the output of this code, then verify:
   ```js
   console.log(a);
   console.log(b);
   var a = 1;
   let b = 2;
   ```

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-04-scope/`](../../examples-node/phase-01/ch-04-scope/) to see every concept from this chapter in action:

- `01-var-let-const.js` — differences between the three declaration keywords
- `02-hoisting.js` — hoisting behaviour for var, let, and functions
- `03-closures.js` — closure examples with loops

```bash
node examples-node/phase-01/ch-04-scope/01-var-let-const.js
node examples-node/phase-01/ch-04-scope/02-hoisting.js
node examples-node/phase-01/ch-04-scope/03-closures.js
```

---

## What's Next

In [Chapter 5](./ch-05-functions.md) you will explore the many ways to define functions in JavaScript — declarations, expressions, arrow functions — and master the tricky `this` keyword with `call`, `apply`, and `bind`.
