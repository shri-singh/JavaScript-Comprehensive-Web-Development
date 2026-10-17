/**
 * Chapter 5 — Example 01: Function Declarations vs Expressions
 *
 * Run:  node examples-node/phase-01/ch-05-functions/01-declarations-vs-expressions.js
 *
 * This file demonstrates the different ways to define functions in JavaScript,
 * their hoisting behaviour, default parameters, rest parameters, and IIFEs.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Function Declaration — hoisted entirely
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Function Declaration (hoisted) ===\n");

// We can call `add` before its declaration because declarations are fully hoisted
console.log(`  add(2, 3) called BEFORE declaration: ${add(2, 3)}`);

function add(a, b) {
  return a + b;
}

console.log(`  add(2, 3) called AFTER declaration:  ${add(2, 3)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Function Expression — NOT hoisted
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Function Expression (const — TDZ applies) ===\n");

// Uncommenting the next line would throw: ReferenceError
// console.log(subtract(5, 3));

const subtract = function (a, b) {
  return a - b;
};

console.log(`  subtract(5, 3) called AFTER assignment: ${subtract(5, 3)}`);
console.log("  (calling before assignment would throw ReferenceError)");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Named Function Expression
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Named Function Expression ===\n");

// The name `fact` is only accessible inside the function body
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1); // `fact` works here for recursion
};

console.log(`  factorial(5) = ${factorial(5)}`); // 120
console.log(`  factorial(0) = ${factorial(0)}`); // 1

// The internal name shows up in stack traces, which helps debugging
console.log(`  factorial.name = "${factorial.name}"`); // "fact"

try {
  fact(3); // eslint-disable-line no-undef
} catch (e) {
  console.log(`  fact(3) outside: ${e.constructor.name} — name is not visible externally`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Arrow Function Expression
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Arrow Function Syntax Variations ===\n");

// Full body with explicit return
const multiply = (a, b) => {
  return a * b;
};

// Concise body — implicit return (no braces, no return keyword)
const divide = (a, b) => a / b;

// Single parameter — parentheses optional
const square = n => n * n;

// No parameters — parentheses required
const rollDie = () => Math.ceil(Math.random() * 6);

// Returning an object literal — MUST wrap in parentheses
const makeUser = (name, age) => ({ name, age });

console.log(`  multiply(4, 5) = ${multiply(4, 5)}`);
console.log(`  divide(10, 3)  = ${divide(10, 3).toFixed(2)}`);
console.log(`  square(7)      = ${square(7)}`);
console.log(`  rollDie()      = ${rollDie()}`);
console.log(`  makeUser("Alice", 30) = ${JSON.stringify(makeUser("Alice", 30))}`);

// Common mistake: forgetting parentheses around object literal
const broken = (name) => { name: name }; // eslint-disable-line no-unused-labels
console.log(`\n  Without parens: (name) => { name: name } returns ${broken("Alice")}`);
console.log("  (The braces are a block, and `name:` is a label — returns undefined!)");

const fixed = (name) => ({ name: name });
console.log(`  With parens:    (name) => ({ name: name }) returns ${JSON.stringify(fixed("Alice"))}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Default Parameters
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Default Parameters ===\n");

function greet(name = "World", greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

console.log(`  greet()                  → "${greet()}"`);
console.log(`  greet("Alice")           → "${greet("Alice")}"`);
console.log(`  greet("Alice", "Hi")     → "${greet("Alice", "Hi")}"`);
console.log(`  greet(undefined, "Hey")  → "${greet(undefined, "Hey")}"`);
console.log('  (passing undefined triggers the default; null does NOT)\n');

// Defaults are evaluated at call time
function createId(prefix = "id", timestamp = Date.now()) {
  return `${prefix}_${timestamp}`;
}
console.log(`  createId()       → "${createId()}"`);
console.log(`  createId("usr")  → "${createId("usr")}"`);

// Earlier params can be used in later defaults
function createRange(start, end, step = end > start ? 1 : -1) {
  return { start, end, step };
}
console.log(`\n  createRange(0, 10) → ${JSON.stringify(createRange(0, 10))}`);
console.log(`  createRange(10, 0) → ${JSON.stringify(createRange(10, 0))}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Rest Parameters
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Rest Parameters ===\n");

function sum(...numbers) {
  // `numbers` is a real Array
  console.log(`  Array.isArray(numbers): ${Array.isArray(numbers)}`);
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(`  sum(1, 2, 3)       = ${sum(1, 2, 3)}`);
console.log(`  sum(10, 20, 30, 40) = ${sum(10, 20, 30, 40)}`);

// Rest must be the last parameter
function log(level, ...messages) {
  console.log(`  [${level}] ${messages.join(" | ")}`);
}

log("INFO", "Server started", "Port 3000");
log("ERROR", "Connection failed");
log("DEBUG", "a", "b", "c", "d");

// ═══════════════════════════════════════════════════════════════════════════════
// 7. arguments object (legacy — prefer rest params)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. arguments Object (legacy) ===\n");

function legacySum() {
  // `arguments` is array-like but NOT a real array
  console.log(`  typeof arguments: ${typeof arguments}`);
  console.log(`  Array.isArray(arguments): ${Array.isArray(arguments)}`);

  // Convert to array the old way
  const args = Array.from(arguments);
  return args.reduce((total, n) => total + n, 0);
}

console.log(`  legacySum(1, 2, 3) = ${legacySum(1, 2, 3)}`);
console.log("  (Arrow functions do NOT have their own `arguments` object)\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 8. IIFE — Immediately Invoked Function Expression
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 8. IIFE Patterns ===\n");

// Classic IIFE
(function () {
  const secret = "You can't see me outside";
  console.log(`  Classic IIFE: "${secret}"`);
})();

// Arrow IIFE
(() => {
  const another = "Arrow IIFE works too";
  console.log(`  Arrow IIFE:   "${another}"`);
})();

// IIFE with a return value — great for one-time initialisation
const config = (() => {
  const env = process.env.NODE_ENV ?? "development";
  return Object.freeze({
    env,
    debug: env !== "production",
    version: "1.0.0",
  });
})();

console.log(`\n  Config from IIFE: ${JSON.stringify(config)}`);
console.log(`  config.debug: ${config.debug}`);

// Try to modify frozen config — throws in strict mode (ES modules are always strict)
try {
  config.debug = false;
} catch (e) {
  console.log(`  Mutation attempt: ${e.constructor.name} — frozen objects reject changes`);
}
console.log(`  config.debug is still: ${config.debug} (unchanged — frozen)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Higher-Order Functions (callback pattern preview)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 9. Higher-Order Functions ===\n");

// A function that takes a function as an argument
function repeat(n, action) {
  for (let i = 0; i < n; i++) {
    action(i);
  }
}

process.stdout.write("  repeat(3, ...):  ");
repeat(3, (i) => process.stdout.write(`iteration ${i}  `));
console.log();

// A function that returns a function
function multiplier(factor) {
  return (number) => number * factor;
}

const double2 = multiplier(2);
const triple = multiplier(3);

console.log(`\n  double(5)  = ${double2(5)}`);
console.log(`  triple(5)  = ${triple(5)}`);

// Array methods — the most common higher-order functions
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter((n) => n % 2 === 0);
const doubled = numbers.map((n) => n * 2);
const total = numbers.reduce((sum2, n) => sum2 + n, 0);

console.log(`\n  numbers:  [${numbers}]`);
console.log(`  evens:    [${evens}]`);
console.log(`  doubled:  [${doubled}]`);
console.log(`  total:    ${total}`);

console.log("\n--- End of 01-declarations-vs-expressions.js ---\n");
