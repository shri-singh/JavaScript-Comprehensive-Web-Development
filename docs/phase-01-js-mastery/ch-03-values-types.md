# Chapter 3 — Values, Types & Coercion

## Learning Objectives

By the end of this chapter you will be able to:

- Name all seven JavaScript primitive types and use `typeof` to identify them at runtime.
- Explain the difference between `==` (abstract equality) and `===` (strict equality) and predict the result of common comparisons.
- Identify truthy and falsy values without consulting a reference table.
- Use explicit conversion functions (`Number()`, `String()`, `Boolean()`) instead of relying on implicit coercion.
- Leverage template literals for readable string interpolation and multi-line strings.

---

## 3.1 Primitive Types

JavaScript has **seven** primitive types. A primitive is a value that is _not_ an object and has no methods of its own (though the engine auto-boxes primitives so you can call methods like `"hello".toUpperCase()`).

| Type | Example | `typeof` result |
|---|---|---|
| **string** | `"hello"`, `'world'`, `` `template` `` | `"string"` |
| **number** | `42`, `3.14`, `NaN`, `Infinity` | `"number"` |
| **bigint** | `9007199254740993n` | `"bigint"` |
| **boolean** | `true`, `false` | `"boolean"` |
| **null** | `null` | `"object"` _(historic bug!)_ |
| **undefined** | `undefined` | `"undefined"` |
| **symbol** | `Symbol("id")` | `"symbol"` |

```js
typeof "hello";      // "string"
typeof 42;           // "number"
typeof 42n;          // "bigint"
typeof true;         // "boolean"
typeof null;         // "object"   <-- the famous quirk
typeof undefined;    // "undefined"
typeof Symbol("id"); // "symbol"
```

> **Key takeaway:** `typeof null === "object"` is a bug that dates back to the first version of JavaScript. It will never be fixed because too much existing code depends on it.

---

## 3.2 `typeof` Quirks

Beyond the `null` surprise, there are a few other `typeof` behaviours worth memorising:

```js
typeof NaN;              // "number" — NaN is technically a number value
typeof function() {};    // "function" — functions get their own typeof result
typeof [];               // "object" — arrays are objects
typeof {};               // "object"
typeof undeclaredVar;    // "undefined" — does NOT throw a ReferenceError
```

Use `Array.isArray(value)` to test for arrays and `value === null` to test for null.

---

## 3.3 Type Coercion — `==` vs `===`

JavaScript has two equality operators:

| Operator | Name | Coerces types? |
|---|---|---|
| `==` | Abstract (loose) equality | Yes |
| `===` | Strict equality | No |

With `==`, the engine converts operands to a common type before comparing. This produces results that surprise even experienced developers:

```js
0 == "";          // true  — both coerce to 0
0 == "0";         // true  — "0" becomes 0
"" == "0";        // false — no numeric coercion, different strings
false == "0";     // true  — false → 0, "0" → 0
false == "";      // true  — false → 0, "" → 0
null == undefined; // true  — special rule in the spec
```

With `===`, none of these conversions happen. If the types differ, the result is `false` immediately.

```js
0 === "";         // false
0 === "0";        // false
null === undefined; // false
```

---

## 3.4 The `+` Operator and String Concatenation

The `+` operator does double duty — numeric addition _and_ string concatenation. If **either** operand is a string, the engine coerces the other to a string:

```js
"5" + 3;     // "53"  — number 3 becomes "3"
5 + "3";     // "53"
5 + 3;       // 8     — both numbers, normal addition
"5" - 3;     // 2     — minus always does numeric math
```

This is one of the most common sources of bugs in JavaScript. When reading data from forms or APIs (which arrives as strings), always convert explicitly before doing arithmetic.

---

## 3.5 Truthy & Falsy Values

Every value in JavaScript is either **truthy** or **falsy** — meaning it converts to `true` or `false` when used in a boolean context (like an `if` condition).

**The complete falsy list (memorise these — everything else is truthy):**

| Value | Type |
|---|---|
| `false` | boolean |
| `0` | number |
| `-0` | number |
| `0n` | bigint |
| `""` (empty string) | string |
| `null` | null |
| `undefined` | undefined |
| `NaN` | number |

Common truthy surprises:

```js
Boolean("0");         // true  — non-empty string
Boolean([]);          // true  — empty array is truthy!
Boolean({});          // true  — empty object is truthy!
Boolean("false");     // true  — non-empty string
Boolean(-1);          // true  — any non-zero number
```

---

## 3.6 Explicit Conversions

Rather than letting coercion happen implicitly, convert values deliberately:

```js
// To number
Number("42");       // 42
Number("hello");    // NaN
Number(true);       // 1
Number(false);      // 0
Number(null);       // 0
Number(undefined);  // NaN
parseInt("42px");   // 42 — stops at first non-digit
parseFloat("3.14"); // 3.14

// To string
String(42);         // "42"
String(null);       // "null"
String(undefined);  // "undefined"
String(true);       // "true"
(42).toString();    // "42"
(255).toString(16); // "ff" — base-16

// To boolean
Boolean(1);         // true
Boolean(0);         // false
Boolean("");        // false
Boolean("hello");   // true
!!value;            // shorthand for Boolean(value)
```

---

## 3.7 Template Literals

Template literals use backticks (`` ` ``) and support **interpolation** and **multi-line strings**:

```js
const name = "Alice";
const age = 30;

// Interpolation
console.log(`Hello, ${name}! You are ${age} years old.`);

// Expressions inside ${}
console.log(`Next year you will be ${age + 1}.`);

// Multi-line (preserves line breaks)
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;

// Tagged templates (advanced)
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) =>
    `${result}${str}${values[i] !== undefined ? `**${values[i]}**` : ""}`, ""
  );
}
console.log(highlight`Name: ${name}, Age: ${age}`);
// "Name: **Alice**, Age: **30**"
```

---

## Tricky Things & Gotchas

1. **`typeof null === "object"`** — always check for null explicitly with `value === null` before checking `typeof`.
2. **`NaN !== NaN`** — `NaN` is the only value in JavaScript that is not equal to itself. Use `Number.isNaN(value)` to test for it, not the global `isNaN()` which coerces its argument first.
3. **Empty array is truthy** — `if ([]) { ... }` will always execute. If you want to check whether an array has items, test `arr.length > 0`.
4. **`"0"` is truthy** — the string `"0"` is not empty, so it is truthy, even though `Number("0")` is `0` (falsy).
5. **`+` is overloaded** — `"5" + 3` gives `"53"` (string) but `"5" - 3` gives `2` (number). When in doubt, convert first.
6. **`parseInt` needs a radix** — `parseInt("08")` works fine in modern engines, but always pass the radix for clarity: `parseInt("08", 10)`.

---

## Best Practices

- Always use `===` and `!==`. Reserve `==` only for intentional `null`/`undefined` checks (`value == null`).
- Convert explicitly with `Number()`, `String()`, or `Boolean()` rather than relying on implicit coercion.
- Use `Number.isNaN()` instead of the global `isNaN()`.
- Use `Number.isFinite()` instead of the global `isFinite()`.
- Prefer template literals over string concatenation with `+` for readability.
- When accepting external input (form fields, API responses, URL parameters), validate and convert types at the boundary.

---

## Exercises

1. **typeof explorer.** Predict the `typeof` result for each value, then verify:
   ```js
   typeof ""; typeof 0; typeof 0n; typeof null; typeof undefined;
   typeof NaN; typeof []; typeof function(){}; typeof Symbol();
   ```

2. **Coercion quiz.** Without running the code, predict `true` or `false` for each comparison, then check:
   ```js
   1 == "1";  0 == false;  "" == false;  null == 0;
   null == undefined;  NaN == NaN;  [] == false;  "" == [];
   ```

3. **Truthy gauntlet.** Write a function `isTruthy(value)` that returns the string `"truthy"` or `"falsy"`. Test it with: `0`, `""`, `"0"`, `[]`, `null`, `undefined`, `NaN`, `{}`, `-1`, `false`.

4. **Safe addition.** Write a function `safeAdd(a, b)` that converts both arguments to numbers before adding. If either conversion produces `NaN`, throw an error instead of returning `NaN`.

5. **Template builder.** Write a function `buildCard(name, role, email)` that returns a multi-line string using a template literal, formatted like an HTML card component.

6. **parseInt pitfalls.** Explain why `parseInt("08")` used to cause bugs in older engines. What is the second argument to `parseInt`, and when should you always provide it?

7. **NaN detective.** Given an array of mixed values, write a function that returns only the elements that are `NaN`. Remember that `NaN !== NaN` — what method should you use?

8. **BigInt boundary.** Demonstrate that `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` is `true`, then show how BigInt solves this.

---

## Mini-Lab

Run the example files in [`../../examples-node/phase-01/ch-03-values-types/`](../../examples-node/phase-01/ch-03-values-types/) to see every concept from this chapter in action:

- `01-primitives.js` — all seven primitives and typeof quirks
- `02-coercion.js` — surprising coercion results and == vs ===
- `03-conversions.js` — explicit conversion patterns

```bash
node examples-node/phase-01/ch-03-values-types/01-primitives.js
node examples-node/phase-01/ch-03-values-types/02-coercion.js
node examples-node/phase-01/ch-03-values-types/03-conversions.js
```

---

## What's Next

In [Chapter 4](./ch-04-scope.md) you will learn how JavaScript decides which variables are visible where — `var` vs `let` vs `const`, hoisting, the temporal dead zone, and your first taste of closures.
