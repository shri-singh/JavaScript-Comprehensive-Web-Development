/**
 * Chapter 4 — Example 01: var, let, const
 *
 * Run:  node examples-node/phase-01/ch-04-scope/01-var-let-const.js
 *
 * This file demonstrates the differences between var, let, and const:
 * scoping rules, re-declaration, re-assignment, and globalThis attachment.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Scope: function (var) vs block (let/const)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Function Scope vs Block Scope ===\n");

function scopeDemo() {
  if (true) {
    var funcScoped = "I'm var — function-scoped";
    let blockScoped = "I'm let — block-scoped";
    const alsoBlock = "I'm const — block-scoped";

    console.log(`  Inside block: ${funcScoped}`);
    console.log(`  Inside block: ${blockScoped}`);
    console.log(`  Inside block: ${alsoBlock}`);
  }

  // var leaks out of the if-block
  console.log(`  Outside block: ${funcScoped}`);

  // let and const do NOT leak
  try {
    console.log(blockScoped); // eslint-disable-line no-undef
  } catch (e) {
    console.log(`  Outside block: let → ${e.constructor.name}: ${e.message}`);
  }
  // (const would throw the same ReferenceError)
}

scopeDemo();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. for-loop scoping
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. for-loop Scoping ===\n");

// var: loop variable leaks
function loopVar() {
  for (var i = 0; i < 3; i++) {
    // ...
  }
  console.log(`  After for-var loop:  i = ${i}`); // 3
}
loopVar();

// let: loop variable is contained
function loopLet() {
  for (let j = 0; j < 3; j++) {
    // ...
  }
  try {
    console.log(j); // eslint-disable-line no-undef
  } catch (e) {
    console.log(`  After for-let loop:  j → ${e.constructor.name}`);
  }
}
loopLet();

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Re-declaration
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Re-declaration Rules ===\n");

// var CAN be re-declared in the same scope
var color = "red";
var color = "blue"; // No error
console.log(`  var re-declared: color = "${color}"`);

// let and const CANNOT be re-declared (SyntaxError at parse time)
// Uncommenting the following would crash the file:
// let color2 = "red";
// let color2 = "blue"; // SyntaxError: Identifier 'color2' has already been declared

console.log("  let/const re-declaration → SyntaxError (uncomment to see)");

// However, SHADOWING in a nested block is fine
let outerVal = "outer";
{
  let outerVal = "inner shadow"; // Different block — this is shadowing, not re-declaring
  console.log(`  Inner block (shadow): "${outerVal}"`);
}
console.log(`  Outer block: "${outerVal}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Re-assignment
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Re-assignment Rules ===\n");

var a = 1;
a = 2;
console.log(`  var: re-assigned a = ${a}`);

let b = 1;
b = 2;
console.log(`  let: re-assigned b = ${b}`);

const c = 1;
try {
  // @ts-ignore — intentional error
  eval("c = 2"); // Using eval to avoid parse-time error crashing the file
} catch (e) {
  console.log(`  const: re-assign → ${e.constructor.name}: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. const does NOT mean immutable
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. const and Mutability ===\n");

const user = { name: "Alice", age: 30 };
console.log(`  Before mutation: ${JSON.stringify(user)}`);

// Mutating properties is allowed
user.name = "Bob";
user.age = 31;
user.email = "bob@example.com";
console.log(`  After mutation:  ${JSON.stringify(user)}`);

// Re-assigning the binding is NOT allowed
try {
  eval('user = { name: "Charlie" }');
} catch (e) {
  console.log(`  Re-assign const → ${e.constructor.name}: ${e.message}`);
}

// const array — same rules
const numbers = [1, 2, 3];
numbers.push(4);
console.log(`  const array after push: [${numbers}]`);

// Object.freeze for shallow immutability
const frozen = Object.freeze({ x: 1, y: 2 });
try {
  frozen.x = 99; // Throws in strict mode (ES modules are always strict)
} catch (e) {
  console.log(`  Object.freeze — mutation throws: ${e.constructor.name}: ${e.message}`);
}
console.log(`  Object.freeze — frozen.x = ${frozen.x} (still 1, mutation prevented)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. globalThis attachment
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. globalThis Attachment ===\n");

// In Node.js, top-level var does NOT attach to globalThis because
// each file is wrapped in a module function. This behaviour differs
// from browser <script> tags where var DOES attach to window.
var topVar = "var value";
let topLet = "let value";
const topConst = "const value";

console.log(`  globalThis.topVar   → ${globalThis.topVar}`);   // undefined in Node
console.log(`  globalThis.topLet   → ${globalThis.topLet}`);   // undefined
console.log(`  globalThis.topConst → ${globalThis.topConst}`); // undefined

console.log("\n  (In Node.js modules, even var is not truly global.)");
console.log("  (In a browser <script>, var WOULD attach to window.)\n");

// Explicit global
globalThis.myGlobal = "explicitly global";
console.log(`  globalThis.myGlobal → "${globalThis.myGlobal}"`);
delete globalThis.myGlobal; // clean up

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Summary Table
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Quick Reference ===\n");

console.log("  Feature                     var         let         const");
console.log("  " + "─".repeat(65));
console.log("  Scope                       function    block       block");
console.log("  Hoisted?                    yes (undef) yes (TDZ)   yes (TDZ)");
console.log("  Re-declarable (same scope)  yes         no          no");
console.log("  Re-assignable               yes         yes         no");
console.log("  globalThis (browser)?       yes         no          no");

console.log("\n--- End of 01-var-let-const.js ---\n");
