/**
 * Chapter 3 — Example 01: Primitives & typeof
 *
 * Run:  node examples-node/phase-01/ch-03-values-types/01-primitives.js
 *
 * This file demonstrates all seven JavaScript primitive types
 * and the quirks of the typeof operator.
 */

// ─── Helper ──────────────────────────────────────────────────────────────────
const show = (label, value) =>
  console.log(`  ${label.padEnd(30)} → typeof: "${typeof value}"  |  value: ${String(value)}`);

// ─── 1. The Seven Primitives ─────────────────────────────────────────────────
console.log("=== 1. The Seven Primitive Types ===\n");

const str = "hello";
const num = 42;
const big = 9007199254740993n; // BigInt — note the trailing 'n'
const bool = true;
const nul = null;
const undef = undefined;
const sym = Symbol("id");

show("string  — \"hello\"", str);
show("number  — 42", num);
show("bigint  — 9007199254740993n", big);
show("boolean — true", bool);
show("null    — null", nul);          // typeof says "object"!
show("undefined — undefined", undef);
show("symbol  — Symbol(\"id\")", sym);

// ─── 2. The typeof null Bug ──────────────────────────────────────────────────
console.log("\n=== 2. The Famous typeof null Bug ===\n");

console.log(`  typeof null === "object"  →  ${typeof null === "object"}`);
console.log("  This is a historical bug from JS 1.0 — it will never be fixed.");
console.log("  To check for null, use: value === null\n");

const maybeNull = null;
console.log(`  maybeNull === null  →  ${maybeNull === null}`);

// ─── 3. typeof Quirks ───────────────────────────────────────────────────────
console.log("\n=== 3. Other typeof Quirks ===\n");

show("NaN", NaN);                             // "number" — NaN is a number!
show("Infinity", Infinity);                   // "number"
show("function() {}", function () {});        // "function" — special case
show("[]  (array)", []);                      // "object" — arrays are objects
show("{}", {});                               // "object"

// How to properly check for arrays
console.log(`\n  Array.isArray([])  →  ${Array.isArray([])}`);
console.log(`  Array.isArray({})  →  ${Array.isArray({})}`);

// typeof on undeclared variables does NOT throw
console.log(`\n  typeof undeclaredVariable  →  "${typeof undeclaredVariable}"`);
console.log("  (no ReferenceError — typeof is safe on undeclared variables)\n");

// ─── 4. Strings: Single, Double, Backtick ────────────────────────────────────
console.log("=== 4. String Syntax Variants ===\n");

const single = 'single quotes';
const double = "double quotes";
const template = `template literal — supports ${1 + 1} interpolation`;

console.log(`  ${single}`);
console.log(`  ${double}`);
console.log(`  ${template}`);

// Multi-line with template literals
const multiLine = `
  <div>
    <p>Multi-line strings</p>
    <p>just work with backticks.</p>
  </div>`;
console.log(multiLine);

// ─── 5. Number Edge Cases ────────────────────────────────────────────────────
console.log("=== 5. Number Edge Cases ===\n");

console.log(`  0.1 + 0.2               →  ${0.1 + 0.2}`);
console.log(`  0.1 + 0.2 === 0.3       →  ${0.1 + 0.2 === 0.3}`);
console.log("  (floating-point math is not exact — use tolerance checks)\n");

console.log(`  Number.MAX_SAFE_INTEGER  →  ${Number.MAX_SAFE_INTEGER}`);
console.log(`  Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2  →  ${Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2}`);
console.log("  (integers beyond 2^53 - 1 lose precision — use BigInt)\n");

console.log(`  1 / 0                    →  ${1 / 0}`);
console.log(`  -1 / 0                   →  ${-1 / 0}`);
console.log(`  0 / 0                    →  ${0 / 0}`);

// ─── 6. BigInt ───────────────────────────────────────────────────────────────
console.log("\n=== 6. BigInt ===\n");

const bigA = 9007199254740993n;
const bigB = 9007199254740994n;
console.log(`  ${bigA} + 1n = ${bigA + 1n}`);
console.log(`  bigA === bigB  →  ${bigA === bigB}`);
console.log(`  bigA < bigB    →  ${bigA < bigB}`);

// BigInt and Number cannot be mixed directly
try {
  // @ts-ignore — intentional error demo
  const result = bigA + 1; // eslint-disable-line no-unused-vars
} catch (err) {
  console.log(`\n  bigA + 1 (Number) throws: ${err.message}`);
  console.log("  Convert explicitly: BigInt(1) or Number(bigA)");
}

// ─── 7. Symbols ──────────────────────────────────────────────────────────────
console.log("\n=== 7. Symbols ===\n");

const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(`  Symbol("id") === Symbol("id")  →  ${id1 === id2}`);
console.log("  Every Symbol is unique, even if the description matches.\n");

// Symbols as object property keys (cannot collide)
const user = {
  name: "Alice",
  [id1]: 1001,
};
console.log(`  user[id1]  →  ${user[id1]}`);
console.log(`  Object.keys(user)  →  ${JSON.stringify(Object.keys(user))}`);
console.log("  (Symbol keys are hidden from Object.keys and for...in)");
console.log(`  Object.getOwnPropertySymbols(user)  →  [${Object.getOwnPropertySymbols(user).map((s) => s.toString())}]`);

console.log("\n--- End of 01-primitives.js ---\n");
