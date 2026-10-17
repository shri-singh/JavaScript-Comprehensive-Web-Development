/**
 * Chapter 4 — Example 03: Closures
 *
 * Run:  node examples-node/phase-01/ch-04-scope/03-closures.js
 *
 * This file demonstrates closures — from the basic concept to the classic
 * loop bug and several patterns that rely on closures in everyday code.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. What is a closure?
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Basic Closure ===\n");

function makeGreeter(greeting) {
  // `greeting` is an outer variable
  return function (name) {
    // This inner function "closes over" `greeting`
    return `${greeting}, ${name}!`;
  };
}

const hello = makeGreeter("Hello");
const hola = makeGreeter("Hola");

console.log(`  ${hello("Alice")}`);   // Hello, Alice!
console.log(`  ${hello("Bob")}`);     // Hello, Bob!
console.log(`  ${hola("Carlos")}`);   // Hola, Carlos!
console.log("\n  Each returned function remembers its own `greeting`.");

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Counter with private state
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Counter — Private State via Closure ===\n");

function makeCounter(start = 0) {
  let count = start; // private — not accessible from outside
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    value()     { return count; },
  };
}

const counter = makeCounter(10);
console.log(`  Initial value:  ${counter.value()}`);   // 10
console.log(`  increment():    ${counter.increment()}`); // 11
console.log(`  increment():    ${counter.increment()}`); // 12
console.log(`  decrement():    ${counter.decrement()}`); // 11
console.log(`  value():        ${counter.value()}`);     // 11

// count is truly private
console.log(`  counter.count:  ${counter.count}`);       // undefined

// ═══════════════════════════════════════════════════════════════════════════════
// 3. The classic var + loop bug
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. The Classic var + Loop Bug ===\n");

// Using var: all callbacks share the same `i`
console.log("  var loop (all share one i):");

const varResults = [];
for (var i = 0; i < 5; i++) {
  varResults.push(() => i); // All closures reference the SAME `i`
}
// After the loop, i === 5
console.log(`  Results: [${varResults.map((fn) => fn()).join(", ")}]`);
console.log("  Expected 0,1,2,3,4 but got 5,5,5,5,5\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Fix #1: use let
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 4. Fix #1 — let creates a fresh binding per iteration ===\n");

const letResults = [];
for (let j = 0; j < 5; j++) {
  letResults.push(() => j); // Each iteration gets its own `j`
}
console.log(`  Results: [${letResults.map((fn) => fn()).join(", ")}]`);
console.log("  Correct: 0,1,2,3,4\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Fix #2: IIFE (Immediately Invoked Function Expression)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 5. Fix #2 — IIFE captures the value ===\n");

const iifeResults = [];
for (var k = 0; k < 5; k++) {
  (function (captured) {
    iifeResults.push(() => captured);
  })(k); // `k` is passed by value into `captured`
}
console.log(`  Results: [${iifeResults.map((fn) => fn()).join(", ")}]`);
console.log("  Correct: 0,1,2,3,4\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Fix #3: factory function
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 6. Fix #3 — Factory function ===\n");

function createCallback(value) {
  return () => value;
}

const factoryResults = [];
for (var m = 0; m < 5; m++) {
  factoryResults.push(createCallback(m));
}
console.log(`  Results: [${factoryResults.map((fn) => fn()).join(", ")}]`);
console.log("  Correct: 0,1,2,3,4\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Closure with setTimeout (async demonstration)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 7. Closure + setTimeout (async) ===\n");

console.log("  Using let (each timeout gets its own i):");

for (let n = 0; n < 5; n++) {
  setTimeout(() => {
    process.stdout.write(`  Timer ${n} fired\n`);
    if (n === 4) {
      console.log();
      showRemainingExamples();
    }
  }, n * 50);
}

// Remaining examples run after the timeouts complete
function showRemainingExamples() {
  // ═══════════════════════════════════════════════════════════════════════════
  // 8. Practical closure: memoisation
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("=== 8. Practical Closure — Memoisation ===\n");

  function memoize(fn) {
    const cache = new Map(); // closed over — persists between calls
    return function (...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log(`    cache hit for (${args})`);
        return cache.get(key);
      }
      console.log(`    computing for (${args})`);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }

  const slowSquare = memoize((n) => n * n);

  console.log(`  slowSquare(4) = ${slowSquare(4)}`);
  console.log(`  slowSquare(4) = ${slowSquare(4)}`); // cache hit
  console.log(`  slowSquare(5) = ${slowSquare(5)}`);
  console.log(`  slowSquare(5) = ${slowSquare(5)}`); // cache hit

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. Practical closure: private module pattern
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n=== 9. Practical Closure — Module Pattern ===\n");

  const bankAccount = (() => {
    let balance = 0; // private

    return {
      deposit(amount) {
        if (amount <= 0) throw new Error("Amount must be positive");
        balance += amount;
        return balance;
      },
      withdraw(amount) {
        if (amount > balance) throw new Error("Insufficient funds");
        balance -= amount;
        return balance;
      },
      getBalance() {
        return balance;
      },
    };
  })();

  console.log(`  deposit(100):  balance = ${bankAccount.deposit(100)}`);
  console.log(`  deposit(50):   balance = ${bankAccount.deposit(50)}`);
  console.log(`  withdraw(30):  balance = ${bankAccount.withdraw(30)}`);
  console.log(`  getBalance():  ${bankAccount.getBalance()}`);
  console.log(`  bankAccount.balance:  ${bankAccount.balance}`); // undefined — truly private

  try {
    bankAccount.withdraw(200);
  } catch (e) {
    console.log(`  withdraw(200): ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. Stale closure warning
  // ═══════════════════════════════════════════════════════════════════════════
  console.log("\n=== 10. Stale Closure Warning ===\n");

  function createLogger() {
    let message = "initial";

    return {
      setMessage(msg) { message = msg; },
      getLogger() {
        // This closure captures `message` by REFERENCE, not by value
        return () => console.log(`  Logged: "${message}"`);
      },
    };
  }

  const logger = createLogger();
  const log = logger.getLogger();

  log();                          // "initial"
  logger.setMessage("updated!");
  log();                          // "updated!" — the closure sees the change

  console.log("\n  Closures capture variables by reference.");
  console.log("  If the variable changes, the closure sees the new value.\n");

  console.log("--- End of 03-closures.js ---\n");
}
