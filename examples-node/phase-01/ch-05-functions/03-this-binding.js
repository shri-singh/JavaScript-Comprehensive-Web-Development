/**
 * Chapter 5 — Example 03: `this` Binding — call, apply, bind
 *
 * Run:  node examples-node/phase-01/ch-05-functions/03-this-binding.js
 *
 * This file demonstrates how `this` is determined in JavaScript and how
 * to control it explicitly with call(), apply(), and bind().
 */

"use strict";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. The Four `this` Rules
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. The Four `this` Rules ===\n");

// Rule 4: Default binding (strict mode → undefined)
function showThis() {
  return this;
}
console.log(`  Default binding (strict): this is ${showThis()}`); // undefined

// Rule 3: Implicit binding (object.method)
const alice = {
  name: "Alice",
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};
console.log(`  Implicit binding: ${alice.greet()}`); // Hi, I'm Alice

// Rule 2: Explicit binding (call/apply/bind) — shown in sections below

// Rule 1: new binding
function Person(name) {
  this.name = name; // `this` is the new object
}
const bob = new Person("Bob");
console.log(`  new binding: ${bob.name}`); // Bob

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Implicit binding and the "lost this" problem
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Lost this Problem ===\n");

const user = {
  name: "Charlie",
  greet() {
    return `Hello from ${this.name}`;
  },
};

// Works fine — called as a method
console.log(`  user.greet():       "${user.greet()}"`);

// Extracting the method loses `this`
const extracted = user.greet;
try {
  const result = extracted(); // `this` is undefined in strict mode
  console.log(`  extracted():        "${result}"`);
} catch {
  console.log("  extracted():        TypeError — cannot read 'name' of undefined");
}

// This also happens when passing methods as callbacks
function callWithDelay(fn) {
  // fn is called without an object context
  try {
    return fn();
  } catch {
    return "(this was lost!)";
  }
}
console.log(`  callWithDelay(user.greet): "${callWithDelay(user.greet)}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. call() — invoke with explicit this + comma-separated args
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Function.prototype.call() ===\n");

function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const personA = { name: "Alice" };
const personB = { name: "Bob" };

console.log(`  call with Alice: "${introduce.call(personA, "Hello", "!")}"`);
console.log(`  call with Bob:   "${introduce.call(personB, "Hey", ".")}"`);

// Useful for method borrowing
const arrayLike = { 0: "a", 1: "b", 2: "c", length: 3 };
const joined = Array.prototype.join.call(arrayLike, "-");
console.log(`\n  Method borrowing: Array.prototype.join.call(arrayLike, "-") → "${joined}"`);

// Checking types with toString
const typeCheck = Object.prototype.toString.call([]);
console.log(`  Object.prototype.toString.call([]) → "${typeCheck}"`);
console.log(`  Object.prototype.toString.call(null) → "${Object.prototype.toString.call(null)}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. apply() — invoke with explicit this + array of args
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Function.prototype.apply() ===\n");

// Same as call, but args are passed as an array
console.log(`  apply with Alice: "${introduce.apply(personA, ["Hi", "!"])}"`);
console.log(`  apply with Bob:   "${introduce.apply(personB, ["Yo", "?"])}"`);

// Classic use: passing arrays to functions that expect individual args
const numbers = [5, 3, 9, 1, 7];
const max = Math.max.apply(null, numbers);
console.log(`\n  Math.max.apply(null, [5,3,9,1,7]) → ${max}`);

// Modern alternative: spread syntax (preferred)
const maxSpread = Math.max(...numbers);
console.log(`  Math.max(...[5,3,9,1,7])           → ${maxSpread}`);

// Mnemonic
console.log('\n  Mnemonic: Call = Comma-separated, Apply = Array');

// ═══════════════════════════════════════════════════════════════════════════════
// 5. bind() — returns a new function with `this` permanently bound
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Function.prototype.bind() ===\n");

// bind does NOT call the function — it returns a new one
const aliceIntro = introduce.bind(personA, "Hello");
const bobIntro = introduce.bind(personB, "Hey");

// The first argument to bind is locked in as `this`
// Additional arguments are "pre-filled" (partial application)
console.log(`  aliceIntro("!") → "${aliceIntro("!")}"`);
console.log(`  aliceIntro("?") → "${aliceIntro("?")}"`);
console.log(`  bobIntro(".")   → "${bobIntro(".")}"`);

// bind solves the "lost this" problem
const boundGreet = user.greet.bind(user);
console.log(`\n  boundGreet() (extracted but bound): "${boundGreet()}"`);

// bind is permanent — call/apply cannot override it
const forcedCall = boundGreet.call({ name: "Override" });
console.log(`  boundGreet.call({name: "Override"}): "${forcedCall}" (still Charlie!)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Partial Application with bind
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Partial Application with bind ===\n");

function multiply(a, b) {
  return a * b;
}

// Pre-fill the first argument
const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);
const tenTimes = multiply.bind(null, 10);

console.log(`  double(5)   = ${double(5)}`);     // 10
console.log(`  triple(5)   = ${triple(5)}`);     // 15
console.log(`  tenTimes(5) = ${tenTimes(5)}`);   // 50

// Partial application with more complex functions
function createUrl(protocol, domain, path) {
  return `${protocol}://${domain}/${path}`;
}

const secureUrl = createUrl.bind(null, "https");
const apiUrl = secureUrl.bind(null, "api.example.com");

console.log(`\n  secureUrl("example.com", "about") → "${secureUrl("example.com", "about")}"`);
console.log(`  apiUrl("users")                    → "${apiUrl("users")}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. this in callbacks — three solutions
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Fixing `this` in Callbacks ===\n");

class TaskRunner {
  constructor(name) {
    this.name = name;
    this.tasks = [];
  }

  addTask(task) {
    this.tasks.push(task);
  }

  // Solution 1: arrow function (lexical this)
  runWithArrow() {
    console.log("  Solution 1 — Arrow function:");
    this.tasks.forEach((task) => {
      console.log(`    [${this.name}] ${task}`);
    });
  }

  // Solution 2: bind
  runWithBind() {
    console.log("  Solution 2 — bind:");
    this.tasks.forEach(function (task) {
      console.log(`    [${this.name}] ${task}`);
    }.bind(this));
  }

  // Solution 3: forEach's thisArg parameter
  runWithThisArg() {
    console.log("  Solution 3 — thisArg:");
    this.tasks.forEach(function (task) {
      console.log(`    [${this.name}] ${task}`);
    }, this); // <-- second argument to forEach
  }
}

const runner = new TaskRunner("Sprint-1");
runner.addTask("Design API");
runner.addTask("Write tests");
runner.addTask("Deploy");

runner.runWithArrow();
runner.runWithBind();
runner.runWithThisArg();

// ═══════════════════════════════════════════════════════════════════════════════
// 8. this with setTimeout / setInterval
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. this in setTimeout ===\n");

class Countdown {
  constructor(from) {
    this.count = from;
  }

  // Arrow in setTimeout preserves `this`
  start() {
    const id = setInterval(() => {
      if (this.count <= 0) {
        console.log("  Liftoff!");
        clearInterval(id);
        showFinalExamples();
        return;
      }
      console.log(`  ${this.count}...`);
      this.count--;
    }, 50);
  }
}

const countdown = new Countdown(3);
countdown.start();

// ═══════════════════════════════════════════════════════════════════════════════
// 9. this precedence
// ═══════════════════════════════════════════════════════════════════════════════
function showFinalExamples() {
  console.log("\n=== 9. this Binding Precedence ===\n");

  function identify() {
    return this?.name ?? "(no name)";
  }

  const obj = { name: "Object", identify };

  // Default: undefined in strict mode
  console.log(`  Default:     ${identify()}`);

  // Implicit: called as method
  console.log(`  Implicit:    ${obj.identify()}`);

  // Explicit: call overrides implicit
  console.log(`  call:        ${identify.call({ name: "Call" })}`);

  // new: highest precedence
  function Named(name) { this.name = name; }
  Named.prototype.identify = identify;

  const inst = new Named("New");
  console.log(`  new:         ${inst.identify()}`);

  // bind: cannot be overridden by call/apply
  const bound = identify.bind({ name: "Bound" });
  console.log(`  bind:        ${bound()}`);
  console.log(`  bind + call: ${bound.call({ name: "Call" })} (bind wins!)`);

  console.log("\n  Precedence (high to low): new > bind > call/apply > implicit > default");

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. Summary
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n=== 10. Quick Reference ===\n");

  console.log("  call(thisArg, arg1, arg2)    — invoke immediately, args listed");
  console.log("  apply(thisArg, [arg1, arg2]) — invoke immediately, args in array");
  console.log("  bind(thisArg, arg1)          — return new function, this locked");
  console.log("  Arrow functions              — inherit this from enclosing scope");
  console.log("  obj.method()                 — this is obj (implicit binding)");
  console.log("  new Constructor()            — this is the new instance\n");

  console.log("--- End of 03-this-binding.js ---\n");
}
