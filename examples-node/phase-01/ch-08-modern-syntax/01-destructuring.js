/**
 * Chapter 8 — Example 01: Destructuring
 *
 * Run:  node examples-node/phase-01/ch-08-modern-syntax/01-destructuring.js
 *
 * This file demonstrates array and object destructuring, including nested
 * patterns, default values, renaming, rest elements, and function parameter
 * destructuring.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Array Destructuring — Basics
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Array Destructuring — Basics ===\n");

const rgb = [255, 128, 0];

const [red, green, blue] = rgb;
console.log(`  red=${red}, green=${green}, blue=${blue}`);

// Skipping elements with empty slots
const [, , blueOnly] = rgb;
console.log(`  blueOnly (skip first two) = ${blueOnly}`);

// Fewer variables than elements — extra elements are ignored
const [r, g] = rgb;
console.log(`  r=${r}, g=${g} (third element ignored)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Array Destructuring — Defaults and Rest
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Defaults and Rest ===\n");

// Default values for missing positions
const [a = 0, b = 0, c = 0, d = 0] = [10, 20];
console.log(`  a=${a}, b=${b}, c=${c}, d=${d}`);
// a=10, b=20, c=0, d=0

// Rest element collects the remainder into an array
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(`  head=${head}, tail=[${tail}]`);

// Rest must be the last element
const [first, second, ...remaining] = "hello";
console.log(`  first="${first}", second="${second}", remaining=[${remaining}]`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Variable Swap
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Variable Swap ===\n");

let x = "left";
let y = "right";
console.log(`  Before: x="${x}", y="${y}"`);

[x, y] = [y, x];
console.log(`  After:  x="${x}", y="${y}"`);

// Three-way rotation
let p = 1, q = 2, s = 3;
[p, q, s] = [s, p, q];
console.log(`  Rotated: p=${p}, q=${q}, s=${s}`); // 3, 1, 2

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Object Destructuring — Basics
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Object Destructuring — Basics ===\n");

const user = {
  name: "Alice",
  age: 30,
  email: "alice@example.com",
  role: "admin",
};

// Extracting properties into variables of the same name
const { name, age, email } = user;
console.log(`  name="${name}", age=${age}, email="${email}"`);

// Order does not matter (unlike arrays)
const { role, name: userName } = user;
console.log(`  role="${role}", userName="${userName}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Object Destructuring — Rename and Defaults
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Rename and Defaults ===\n");

const config = {
  host: "localhost",
  port: 0,          // intentionally 0
  // debug is missing
};

// Rename: { sourceKey: localVar }
// Default: { key = defaultValue }
// Both: { sourceKey: localVar = defaultValue }
const {
  host: serverHost,
  port: serverPort = 3000,
  debug: isDebug = false,
  protocol: proto = "https",
} = config;

console.log(`  serverHost = "${serverHost}"`);
console.log(`  serverPort = ${serverPort}`);  // 0 — default NOT applied (0 is not undefined)
console.log(`  isDebug = ${isDebug}`);        // false — default applied (debug was undefined)
console.log(`  proto = "${proto}"`);           // "https" — default applied

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Object Destructuring — Rest
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Object Rest ===\n");

const { name: extractedName, ...profile } = user;
console.log(`  extractedName = "${extractedName}"`);
console.log("  profile (rest):", profile);
// { age: 30, email: "alice@example.com", role: "admin" }

// Useful for omitting properties
const { role: _omitted, ...withoutRole } = user;
console.log("  withoutRole:", withoutRole);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Nested Destructuring
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Nested Destructuring ===\n");

const apiResponse = {
  status: 200,
  data: {
    user: {
      id: 42,
      name: "Charlie",
      address: {
        city: "Portland",
        state: "OR",
        zip: "97201",
      },
    },
    meta: {
      requestId: "abc-123",
      timestamp: Date.now(),
    },
  },
};

// Deep destructuring in one statement
const {
  status,
  data: {
    user: {
      id: userId,
      name: fullName,
      address: { city, state },
    },
    meta: { requestId },
  },
} = apiResponse;

console.log(`  status = ${status}`);
console.log(`  userId = ${userId}`);
console.log(`  fullName = "${fullName}"`);
console.log(`  city = "${city}", state = "${state}"`);
console.log(`  requestId = "${requestId}"`);

// Nested with defaults — safe even if parts are missing
const partialResponse = { data: { user: { name: "Dan" } } };
const {
  data: {
    user: { name: pName, age: pAge = "unknown" },
    meta: { page = 1 } = {},   // default empty object if meta is missing
  } = {},
} = partialResponse;

console.log(`\n  pName="${pName}", pAge="${pAge}", page=${page}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Function Parameter Destructuring
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Function Parameter Destructuring ===\n");

// Object destructuring in parameters — makes the function signature self-documenting
const createUser = ({ name: n, email: e, role: r = "user" }) => ({
  name: n,
  email: e,
  role: r,
  createdAt: new Date().toISOString(),
});

const newUser = createUser({ name: "Eve", email: "eve@example.com" });
console.log("  createUser:", newUser);

// Array destructuring in parameters
const getDistance = ([x1, y1], [x2, y2]) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

console.log(`  distance([0,0], [3,4]) = ${getDistance([0, 0], [3, 4])}`);

// Default parameter + destructuring
const formatDate = ({ year, month = 1, day = 1 } = {}) => {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

console.log(`  formatDate({ year: 2024, month: 12 }) = "${formatDate({ year: 2024, month: 12 })}"`);
console.log(`  formatDate({ year: 2024 }) = "${formatDate({ year: 2024 })}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Destructuring in Loops
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 9. Destructuring in Loops ===\n");

const people = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];

// for...of with destructuring
console.log("  People:");
for (const { name: n2, age: a2 } of people) {
  console.log(`    ${n2} (${a2})`);
}

// Object.entries with destructuring
const scores = { math: 95, science: 88, english: 92 };
console.log("\n  Scores:");
for (const [subject, score] of Object.entries(scores)) {
  console.log(`    ${subject}: ${score}`);
}

// Map entries
const userMap = new Map([
  ["alice", { role: "admin" }],
  ["bob", { role: "user" }],
]);

console.log("\n  Map entries:");
for (const [key, { role: r }] of userMap) {
  console.log(`    ${key} -> ${r}`);
}

console.log("\n--- End of 01-destructuring.js ---\n");
