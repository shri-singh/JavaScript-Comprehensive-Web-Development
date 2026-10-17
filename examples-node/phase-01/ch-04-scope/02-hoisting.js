/**
 * Chapter 4 — Example 02: Hoisting
 *
 * Run:  node examples-node/phase-01/ch-04-scope/02-hoisting.js
 *
 * This file demonstrates hoisting for var, let/const, function declarations,
 * and function expressions, including the Temporal Dead Zone (TDZ).
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. var hoisting
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. var Hoisting ===\n");

// The declaration is hoisted, the assignment is NOT
console.log(`  Before declaration: x = ${x}`); // undefined (not ReferenceError)
var x = 5;
console.log(`  After declaration:  x = ${x}`); // 5

// What the engine effectively does:
// var x;              ← hoisted
// console.log(x);     ← undefined
// x = 5;              ← assignment in place
// console.log(x);     ← 5

console.log();

// Another example: var inside a function
function varHoist() {
  console.log(`  Inside function, before assignment: a = ${a}`); // undefined
  var a = 10;
  console.log(`  Inside function, after assignment:  a = ${a}`); // 10
}
varHoist();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. let / const hoisting and the TDZ
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. let / const Hoisting (Temporal Dead Zone) ===\n");

// let and const ARE hoisted, but they sit in the TDZ until the declaration line.
// Accessing them in the TDZ throws a ReferenceError.

try {
  // The variable `y` is hoisted to the top of this block, but it is in the TDZ
  console.log(y);  // This line is in the TDZ for y
  let y = 10;      // TDZ ends here
} catch (e) {
  console.log(`  Accessing let before declaration: ${e.constructor.name}: ${e.message}`);
}

try {
  console.log(z);
  const z = 20;
} catch (e) {
  console.log(`  Accessing const before declaration: ${e.constructor.name}: ${e.message}`);
}

// Proof that let IS hoisted (not just undeclared):
// If let were NOT hoisted, the outer `name` would be visible inside the block.
const name = "outer";
try {
  // If let didn't hoist, this would print "outer"
  // Instead it throws because the inner `name` is hoisted into the TDZ
  console.log(name); // eslint-disable-line no-use-before-define
  let name = "inner"; // eslint-disable-line no-shadow
} catch (e) {
  console.log(`\n  TDZ proof — inner let shadows outer: ${e.constructor.name}`);
  console.log("  (If let were not hoisted, it would have printed \"outer\" instead)\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. typeof in the TDZ
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 3. typeof Behaviour ===\n");

// typeof is safe for undeclared variables
console.log(`  typeof undeclaredVar  →  "${typeof undeclaredVar}"`);

// But typeof is NOT safe in the TDZ
try {
  eval("typeof tdzVar; let tdzVar = 1;");
} catch (e) {
  console.log(`  typeof in TDZ         →  ${e.constructor.name}: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Function declaration hoisting
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Function Declaration Hoisting ===\n");

// Function declarations are hoisted ENTIRELY — name + body
console.log(`  greet() before declaration: "${greet()}"`);

function greet() {
  return "Hello from a hoisted function!";
}

console.log(`  greet() after declaration:  "${greet()}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Function expression hoisting (or lack thereof)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Function Expression Hoisting ===\n");

// var function expression — var is hoisted (undefined), but not the function
try {
  console.log(`  typeof sayHi: ${typeof sayHi}`); // "undefined"
  sayHi(); // TypeError: sayHi is not a function
} catch (e) {
  console.log(`  sayHi() before assignment: ${e.constructor.name}: ${e.message}`);
}
var sayHi = function () {
  return "Hi!";
};
console.log(`  sayHi() after assignment:  "${sayHi()}"`);

console.log();

// let/const function expression — in the TDZ
try {
  sayBye();
} catch (e) {
  console.log(`  const arrow before declaration: ${e.constructor.name}: ${e.message}`);
}
const sayBye = () => "Bye!";
console.log(`  const arrow after declaration:  "${sayBye()}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Hoisting Order: function declarations vs var
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Hoisting Order: Functions vs var ===\n");

// In classic (non-module) scripts, when a function declaration and a var
// share the same name, the function wins during hoisting.
// This does NOT work in ES modules (strict mode forbids the redeclaration).
// We use eval() to simulate classic script behaviour:
const hoistDemo = new Function(
  "var before = typeof calc;" +
  "var calc = 10;" +
  "function calc(n) { return n * 2; }" +
  "var after = calc;" +
  "return { before: before, after: after };"
);
const result = hoistDemo();
console.log(`  typeof calc (hoisted): "${result.before}" — function wins during hoisting`);
console.log(`  calc after execution:  ${result.after} — var assignment overwrites at runtime`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Hoisting in practice — common mistake
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Common Hoisting Mistake ===\n");

function processData() {
  // Programmer intended: use `data` only after fetching
  // Bug: `data` is accessible as undefined before the if-block
  console.log(`  data before assignment: ${data}`); // undefined (with var)

  if (true) {
    var data = "fetched!";
  }

  console.log(`  data after assignment:  ${data}`); // "fetched!"
}
processData();

console.log("\n  Fix: use let/const to catch this at the TDZ boundary.\n");

// Fixed version
function processDataFixed() {
  try {
    console.log(fixedData); // eslint-disable-line no-use-before-define
  } catch (e) {
    console.log(`  fixedData before assignment: ${e.constructor.name} (caught early!)`);
  }

  if (true) {
    const fixedData = "fetched!"; // eslint-disable-line no-unused-vars
  }
}
processDataFixed();

console.log("\n--- End of 02-hoisting.js ---\n");
