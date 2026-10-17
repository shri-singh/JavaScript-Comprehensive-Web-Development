/**
 * Chapter 8 — Example 02: Spread and Rest
 *
 * Run:  node examples-node/phase-01/ch-08-modern-syntax/02-spread-rest.js
 *
 * This file demonstrates the spread operator for expanding arrays and objects,
 * rest parameters for collecting arguments, shallow copy behaviour, and
 * practical patterns for merging and cloning data.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Spread — Arrays
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Spread — Arrays ===\n");

const front = [1, 2, 3];
const back = [7, 8, 9];

// Concatenation
const combined = [...front, 4, 5, 6, ...back];
console.log("  combined:", combined);

// Shallow copy
const original = [10, 20, 30];
const copy = [...original];
copy.push(40);
console.log("  original:", original);
console.log("  copy:    ", copy);

// Spread a string into characters
const chars = [..."JavaScript"];
console.log("  chars:", chars);

// Spread into function arguments
const nums = [5, 3, 8, 1, 9];
console.log(`  Math.max(...nums) = ${Math.max(...nums)}`);
console.log(`  Math.min(...nums) = ${Math.min(...nums)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Spread — Objects
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Spread — Objects ===\n");

const defaults = {
  theme: "light",
  lang: "en",
  fontSize: 14,
  debug: false,
};

const userPrefs = {
  theme: "dark",
  fontSize: 18,
};

// Merge — later properties overwrite earlier ones
const config = { ...defaults, ...userPrefs };
console.log("  defaults: ", defaults);
console.log("  userPrefs:", userPrefs);
console.log("  merged:   ", config);

// Adding / overriding specific properties
const updated = { ...config, debug: true, newProp: "hello" };
console.log("  updated:  ", updated);

// Spread copies own enumerable properties only
const proto = { inherited: true };
const obj = Object.create(proto);
obj.own = "yes";
const spreadObj = { ...obj };
console.log("\n  obj.inherited:", obj.inherited);       // true (via prototype)
console.log("  spreadObj.inherited:", spreadObj.inherited); // undefined (not copied)
console.log("  spreadObj.own:", spreadObj.own);             // "yes"

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Rest Parameters — Functions
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Rest Parameters — Functions ===\n");

// Rest collects remaining arguments into a real array
const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0);
console.log(`  sum(1, 2, 3, 4) = ${sum(1, 2, 3, 4)}`);

// First param explicit, rest collected
const log = (level, ...messages) => {
  console.log(`  [${level}] ${messages.join(" ")}`);
};
log("INFO", "Server", "started", "on", "port", "3000");
log("WARN", "Memory", "usage", "high");

// Arrow function with rest (arrows do not have `arguments`)
const multiply = (...factors) => factors.reduce((product, f) => product * f, 1);
console.log(`  multiply(2, 3, 4) = ${multiply(2, 3, 4)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Rest — Destructuring (Arrays)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Rest in Array Destructuring ===\n");

const scores = [95, 88, 76, 92, 81];

const [best, secondBest, ...others] = scores;
console.log(`  best = ${best}, secondBest = ${secondBest}`);
console.log(`  others = [${others}]`);

// Practical: head / tail pattern
const process = ([current, ...remaining]) => {
  console.log(`  Processing: ${current}`);
  if (remaining.length > 0) {
    console.log(`  Remaining:  [${remaining}]`);
  } else {
    console.log("  (no more items)");
  }
};

process(["task-1", "task-2", "task-3"]);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Rest — Destructuring (Objects)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Rest in Object Destructuring ===\n");

const user = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  password: "secret123",
  role: "admin",
};

// Omit sensitive fields
const { password, ...safeUser } = user;
console.log("  safeUser:", safeUser);
console.log(`  password variable: "${password}" (extracted but not in safeUser)`);

// Extract specific keys, collect the rest
const { id, name, ...metadata } = user;
console.log(`  id=${id}, name="${name}"`);
console.log("  metadata:", metadata);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Shallow Copy Gotcha
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Shallow Copy Gotcha ===\n");

const state = {
  count: 0,
  items: ["a", "b"],
  settings: { theme: "light" },
};

// Spread creates a SHALLOW copy
const newState = { ...state };

// Primitive: independent copy
newState.count = 99;
console.log(`  state.count    = ${state.count} (unchanged)`);
console.log(`  newState.count = ${newState.count}`);

// Array/Object: shared reference!
newState.items.push("c");
console.log(`\n  state.items    = [${state.items}] (MUTATED!)`);
console.log(`  newState.items = [${newState.items}]`);

newState.settings.theme = "dark";
console.log(`  state.settings.theme    = "${state.settings.theme}" (MUTATED!)`);
console.log(`  newState.settings.theme = "${newState.settings.theme}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Deep Copy with structuredClone
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Deep Copy with structuredClone ===\n");

const original2 = {
  count: 0,
  items: ["x", "y"],
  settings: { theme: "light" },
};

const deepCopy = structuredClone(original2);

deepCopy.items.push("z");
deepCopy.settings.theme = "dark";

console.log(`  original2.items    = [${original2.items}] (unchanged)`);
console.log(`  deepCopy.items     = [${deepCopy.items}]`);
console.log(`  original2.settings = ${JSON.stringify(original2.settings)} (unchanged)`);
console.log(`  deepCopy.settings  = ${JSON.stringify(deepCopy.settings)}`);

// structuredClone limitations:
// - Cannot clone functions
// - Cannot clone DOM elements
// - Cannot clone Symbols
console.log("\n  Limitations: structuredClone cannot clone functions, DOM nodes, or Symbols");

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Practical Patterns
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Practical Patterns ===\n");

// Pattern 1: Immutable state update (common in React)
const appState = { user: "Alice", count: 5, items: ["a"] };
const nextState = {
  ...appState,
  count: appState.count + 1,
  items: [...appState.items, "b"],
};
console.log("  Immutable update:");
console.log("    before:", appState);
console.log("    after: ", nextState);

// Pattern 2: Function options with defaults
const createServer = ({ host = "localhost", port = 3000, ...options } = {}) => {
  return { host, port, ...options };
};
console.log("\n  createServer():", createServer());
console.log("  createServer({ port: 8080, ssl: true }):", createServer({ port: 8080, ssl: true }));

// Pattern 3: Collecting and forwarding arguments
const withLogging = (fn) => (...args) => {
  console.log(`  -> calling with args: [${args}]`);
  const result = fn(...args);
  console.log(`  <- returned: ${result}`);
  return result;
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
console.log("\n  Wrapper pattern:");
loggedAdd(3, 4);

// Pattern 4: Remove duplicates from array
const withDupes = [1, 2, 2, 3, 3, 3, 4];
const unique = [...new Set(withDupes)];
console.log(`\n  Remove duplicates: [${withDupes}] -> [${unique}]`);

console.log("\n--- End of 02-spread-rest.js ---\n");
