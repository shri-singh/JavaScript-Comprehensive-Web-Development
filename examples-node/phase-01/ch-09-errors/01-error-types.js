/**
 * Chapter 9 — Example 01: Error Types
 *
 * Run:  node examples-node/phase-01/ch-09-errors/01-error-types.js
 *
 * This file triggers each of JavaScript's built-in error types inside
 * try/catch blocks so you can see their names, messages, and stack traces.
 */

// Helper to display error information consistently
const showError = (label, error) => {
  console.log(`  ${label}`);
  console.log(`    name:    ${error.name}`);
  console.log(`    message: ${error.message}`);
  console.log(`    stack (first line): ${error.stack.split("\n")[0]}`);
  console.log();
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TypeError
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. TypeError ===\n");

// 1a. Calling a non-function
try {
  const notAFunction = 42;
  notAFunction();
} catch (e) {
  showError("Calling a non-function:", e);
}

// 1b. Reading a property of null
try {
  const obj = null;
  obj.name; // eslint-disable-line no-unused-expressions
} catch (e) {
  showError("Reading property of null:", e);
}

// 1c. Reading a property of undefined
try {
  const obj = undefined;
  obj.toString(); // eslint-disable-line no-unused-expressions
} catch (e) {
  showError("Calling method on undefined:", e);
}

// 1d. Assigning to a read-only property (strict mode — Node modules are strict)
try {
  const frozen = Object.freeze({ x: 1 });
  Object.defineProperty(frozen, "x", { value: 2 });
} catch (e) {
  showError("Redefining frozen property:", e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ReferenceError
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 2. ReferenceError ===\n");

// 2a. Accessing an undeclared variable
try {
  // eslint-disable-next-line no-undef
  console.log(nonExistentVariable);
} catch (e) {
  showError("Undeclared variable:", e);
}

// 2b. Accessing a let/const in the Temporal Dead Zone
try {
  // Using eval to avoid parse-time error in the file itself
  eval("console.log(tdzVar); let tdzVar = 10;");
} catch (e) {
  showError("TDZ access:", e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SyntaxError (runtime — from JSON.parse / eval)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 3. SyntaxError (runtime) ===\n");

// 3a. Invalid JSON
try {
  JSON.parse("{invalid json}");
} catch (e) {
  showError("Invalid JSON:", e);
}

// 3b. Incomplete expression via eval
try {
  eval("if (");
} catch (e) {
  showError("Incomplete expression:", e);
}

// 3c. Duplicate parameter in strict mode
try {
  eval('"use strict"; function f(a, a) {}');
} catch (e) {
  showError("Duplicate parameter (strict):", e);
}

// Note: you cannot catch SyntaxErrors from your own file's source code,
// because the parser rejects the file before any code executes.
console.log("  Note: File-level SyntaxErrors cannot be caught — the file never runs.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RangeError
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 4. RangeError ===\n");

// 4a. Invalid array length
try {
  const arr = new Array(-1);
  console.log(arr); // never reached
} catch (e) {
  showError("Negative array length:", e);
}

// 4b. toFixed with too many digits
try {
  const n = 1.5;
  n.toFixed(200);
} catch (e) {
  showError("toFixed(200):", e);
}

// 4c. Maximum call stack exceeded (infinite recursion)
try {
  const recurse = () => recurse();
  recurse();
} catch (e) {
  showError("Stack overflow:", e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. URIError
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 5. URIError ===\n");

try {
  decodeURIComponent("%");
} catch (e) {
  showError("Malformed URI component:", e);
}

try {
  decodeURI("%E0%A4%A");
} catch (e) {
  showError("Malformed URI:", e);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. The Error Object Anatomy
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 6. Error Object Anatomy ===\n");

const error = new Error("Something went wrong");
console.log(`  error.name:    "${error.name}"`);
console.log(`  error.message: "${error.message}"`);
console.log(`  error.stack:\n`);
error.stack.split("\n").forEach((line) => {
  console.log(`    ${line}`);
});

// error.cause (ES2022)
console.log("\n  Error with cause (ES2022):");
const cause = new Error("Root cause");
const wrapper = new Error("High-level failure", { cause });
console.log(`    wrapper.message: "${wrapper.message}"`);
console.log(`    wrapper.cause.message: "${wrapper.cause.message}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Checking Error Types
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Checking Error Types ===\n");

const errors = [
  new TypeError("bad type"),
  new ReferenceError("missing var"),
  new SyntaxError("bad syntax"),
  new RangeError("out of range"),
  new URIError("bad URI"),
  new Error("generic"),
];

for (const err of errors) {
  const isTypeError = err instanceof TypeError;
  const isRefError = err instanceof ReferenceError;
  const isError = err instanceof Error; // all are instances of Error

  console.log(
    `  ${err.name.padEnd(16)} instanceof TypeError: ${String(isTypeError).padEnd(5)} | ` +
    `instanceof ReferenceError: ${String(isRefError).padEnd(5)} | ` +
    `instanceof Error: ${isError}`
  );
}

console.log("\n  All built-in error types inherit from Error.\n");

console.log("--- End of 01-error-types.js ---\n");
