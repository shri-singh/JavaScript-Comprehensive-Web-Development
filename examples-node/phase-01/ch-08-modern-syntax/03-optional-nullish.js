/**
 * Chapter 8 — Example 03: Optional Chaining and Nullish Coalescing
 *
 * Run:  node examples-node/phase-01/ch-08-modern-syntax/03-optional-nullish.js
 *
 * This file demonstrates optional chaining (?.), nullish coalescing (??),
 * and the logical assignment operators (||=, ??=, &&=), as well as
 * template literals, tagged templates, Symbol basics, and WeakMap/WeakSet.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Optional Chaining (?.)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Optional Chaining (?.) ===\n");

const user = {
  name: "Alice",
  profile: {
    address: {
      city: "Portland",
      state: "OR",
    },
  },
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

// Property access
console.log(`  user.profile?.address?.city = "${user.profile?.address?.city}"`);
console.log(`  user.profile?.phone?.number = ${user.profile?.phone?.number}`); // undefined

// Method call
console.log(`  user.greet?.() = "${user.greet?.()}"`);
console.log(`  user.nonExistent?.() = ${user.nonExistent?.()}`); // undefined

// Bracket notation
const key = "city";
console.log(`  user.profile?.address?.[key] = "${user.profile?.address?.[key]}"`);

// With null
const nullUser = null;
console.log(`  nullUser?.name = ${nullUser?.name}`); // undefined (no TypeError)

// Chaining multiple levels
const response = {
  data: {
    users: [
      { name: "Alice", scores: [95, 88] },
      { name: "Bob" }, // no scores array
    ],
  },
};

console.log(`\n  response.data?.users?.[0]?.scores?.[0] = ${response.data?.users?.[0]?.scores?.[0]}`);
console.log(`  response.data?.users?.[1]?.scores?.[0] = ${response.data?.users?.[1]?.scores?.[0]}`);
console.log(`  response.missing?.users?.[0] = ${response.missing?.users?.[0]}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Nullish Coalescing (??)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Nullish Coalescing (??) ===\n");

// ?? returns the right side ONLY for null or undefined
// || returns the right side for ANY falsy value

const values = [0, "", false, null, undefined, NaN];

console.log("  Value        || 'default'    ?? 'default'");
console.log("  -----        -----------     -----------");
for (const val of values) {
  const orResult = val || "default";
  const nullishResult = val ?? "default";
  const display = JSON.stringify(val) ?? String(val);
  console.log(
    `  ${String(display).padEnd(12)} ${String(JSON.stringify(orResult)).padEnd(15)} ${JSON.stringify(nullishResult)}`
  );
}

// Practical: port might be 0, which is valid
const config1 = { port: 0, host: "" };
console.log(`\n  config.port || 3000 = ${config1.port || 3000}`);  // 3000 (wrong!)
console.log(`  config.port ?? 3000 = ${config1.port ?? 3000}`);    // 0    (correct!)
console.log(`  config.host || "localhost" = "${config1.host || "localhost"}"`);  // "localhost"
console.log(`  config.host ?? "localhost" = "${config1.host ?? "localhost"}"`);  // ""

// Combined with optional chaining
const settings = null;
const theme = settings?.theme ?? "light";
console.log(`\n  settings?.theme ?? "light" = "${theme}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Logical Assignment Operators
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Logical Assignment Operators ===\n");

// ??= assigns if current value is null or undefined
console.log("  ??= (nullish assign):");
const config2 = { retries: 0, timeout: null };
config2.retries ??= 3;     // stays 0 — not null/undefined
config2.timeout ??= 5000;  // set to 5000 — was null
config2.host ??= "localhost"; // set — was undefined
console.log(`    retries = ${config2.retries}`);
console.log(`    timeout = ${config2.timeout}`);
console.log(`    host    = "${config2.host}"`);

// ||= assigns if current value is falsy
console.log("\n  ||= (logical OR assign):");
let greeting = "";
greeting ||= "Hello!";
console.log(`    greeting = "${greeting}"`); // "Hello!"

let count = 0;
count ||= 10;
console.log(`    count = ${count}`); // 10 (0 is falsy — often not what you want)

// &&= assigns if current value is truthy
console.log("\n  &&= (logical AND assign):");
let userSession = { token: "abc123", active: true };
userSession.active &&= false;  // set to false — was truthy
console.log(`    active = ${userSession.active}`);

let emptySession = { active: false };
emptySession.active &&= true;  // stays false — was already falsy
console.log(`    emptySession.active = ${emptySession.active}`);

// Practical: normalise config with ??=
const normaliseConfig = (cfg) => {
  cfg.host ??= "localhost";
  cfg.port ??= 3000;
  cfg.retries ??= 3;
  cfg.timeout ??= 5000;
  return cfg;
};

console.log("\n  normaliseConfig({ port: 0 }):", normaliseConfig({ port: 0 }));

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Template Literals
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Template Literals ===\n");

const personName = "Alice";
const personAge = 30;

// Basic interpolation
console.log(`  Hello, ${personName}! You are ${personAge} years old.`);

// Expressions inside ${}
console.log(`  In 5 years: ${personAge + 5}`);
console.log(`  Ternary: ${personAge >= 18 ? "adult" : "minor"}`);

// Multi-line
const multiLine = `
  This is a
  multi-line
  template literal.
`;
console.log("  Multi-line:", multiLine.trim());

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Tagged Templates
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Tagged Templates ===\n");

// A tag function receives (strings[], ...values)
const highlight = (strings, ...values) => {
  return strings.reduce((result, str, i) => {
    const val = i < values.length ? `[${values[i]}]` : "";
    return result + str + val;
  }, "");
};

const item = "Widget";
const price = 29.99;
const tagged = highlight`Item: ${item}, Price: $${price}`;
console.log(`  highlight: "${tagged}"`);

// Practical: safe HTML escaping
const escapeHtml = (strings, ...values) => {
  const escape = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return strings.reduce((result, str, i) => {
    const val = i < values.length ? escape(values[i]) : "";
    return result + str + val;
  }, "");
};

const userInput = '<script>alert("xss")</script>';
const safeHtml = escapeHtml`<p>User said: ${userInput}</p>`;
console.log(`  escapeHtml: "${safeHtml}"`);

// Tagged templates: raw strings
const showRaw = (strings) => {
  console.log("  Cooked:", JSON.stringify(strings[0]));
  console.log("  Raw:   ", JSON.stringify(strings.raw[0]));
};
showRaw`Line1\nLine2\tTabbed`;

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Symbols
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Symbols ===\n");

// Every Symbol is unique
const sym1 = Symbol("id");
const sym2 = Symbol("id");
console.log(`  Symbol("id") === Symbol("id"): ${sym1 === sym2}`); // false

// Using symbols as property keys — no collisions
const ID = Symbol("id");
const obj = {
  [ID]: 42,
  name: "Alice",
};

console.log(`  obj[ID] = ${obj[ID]}`);
console.log(`  Object.keys(obj):`, Object.keys(obj)); // ["name"] — symbol hidden

// To access symbol properties
console.log(`  Object.getOwnPropertySymbols(obj):`, Object.getOwnPropertySymbols(obj));

// Symbol.for — global symbol registry (same key = same symbol)
const s1 = Symbol.for("app.id");
const s2 = Symbol.for("app.id");
console.log(`\n  Symbol.for("app.id") === Symbol.for("app.id"): ${s1 === s2}`); // true
console.log(`  Symbol.keyFor(s1) = "${Symbol.keyFor(s1)}"`);

// Symbol.description
const described = Symbol("my description");
console.log(`  described.description = "${described.description}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. WeakMap
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. WeakMap ===\n");

// WeakMap keys must be objects; values can be anything
// Entries are garbage-collected when the key has no other references

const privateData = new WeakMap();

class Person {
  constructor(name, age) {
    // Store private data externally using this instance as key
    privateData.set(this, { name, age });
  }

  getName() {
    return privateData.get(this).name;
  }

  getAge() {
    return privateData.get(this).age;
  }

  toString() {
    const { name, age } = privateData.get(this);
    return `Person(${name}, ${age})`;
  }
}

const alice = new Person("Alice", 30);
console.log(`  alice.getName() = "${alice.getName()}"`);
console.log(`  alice.toString() = "${alice.toString()}"`);
console.log(`  "name" in alice: ${"name" in alice}`); // false — truly private

// WeakMap for caching
const cache = new WeakMap();
const expensiveCompute = (obj) => {
  if (cache.has(obj)) {
    console.log("  (cache hit)");
    return cache.get(obj);
  }
  console.log("  (computing...)");
  const result = JSON.stringify(obj).length; // simulate work
  cache.set(obj, result);
  return result;
};

const data = { a: 1, b: 2, c: [3, 4, 5] };
console.log(`\n  expensiveCompute(data) = ${expensiveCompute(data)}`);
console.log(`  expensiveCompute(data) = ${expensiveCompute(data)}`);

// WeakMap limitations
console.log("\n  WeakMap limitations:");
console.log("    - Keys must be objects (no strings or numbers)");
console.log("    - Not iterable (no .keys(), .values(), .entries())");
console.log("    - No .size property");

// ═══════════════════════════════════════════════════════════════════════════════
// 8. WeakSet
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. WeakSet ===\n");

// WeakSet stores objects with weak references — useful for marking/tagging objects
const visited = new WeakSet();

const processNode = (node) => {
  if (visited.has(node)) {
    console.log(`  ${node.name}: already visited, skipping`);
    return;
  }
  visited.add(node);
  console.log(`  ${node.name}: processing for the first time`);
};

const nodeA = { name: "A" };
const nodeB = { name: "B" };

processNode(nodeA); // first time
processNode(nodeB); // first time
processNode(nodeA); // already visited
processNode(nodeB); // already visited

console.log("\n--- End of 03-optional-nullish.js ---\n");
