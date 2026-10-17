/**
 * Chapter 3 — Example 03: Explicit Conversions
 *
 * Run:  node examples-node/phase-01/ch-03-values-types/03-conversions.js
 *
 * This file demonstrates explicit type conversion functions —
 * Number(), String(), Boolean(), parseInt(), parseFloat() —
 * and template literal patterns.
 */

// ─── Helper ──────────────────────────────────────────────────────────────────
const show = (expr, result) =>
  console.log(`  ${expr.padEnd(35)} →  ${typeof result === "string" ? `"${result}"` : result}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Converting to Number
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Converting to Number ===\n");

show('Number("42")', Number("42"));
show('Number("3.14")', Number("3.14"));
show('Number("")', Number(""));                 // 0 — empty string → 0
show('Number("  ")', Number("  "));             // 0 — whitespace-only → 0
show('Number("42px")', Number("42px"));         // NaN — trailing chars fail
show('Number("hello")', Number("hello"));       // NaN
show("Number(true)", Number(true));             // 1
show("Number(false)", Number(false));           // 0
show("Number(null)", Number(null));             // 0
show("Number(undefined)", Number(undefined));   // NaN — surprise!

console.log("\n  --- parseInt and parseFloat ---\n");

show('parseInt("42px", 10)', parseInt("42px", 10));     // 42 — stops at 'p'
show('parseInt("0xFF", 16)', parseInt("0xFF", 16));     // 255
show('parseInt("08", 10)', parseInt("08", 10));         // 8 — always pass radix!
show('parseInt("abc", 10)', parseInt("abc", 10));       // NaN
show('parseFloat("3.14rem")', parseFloat("3.14rem"));   // 3.14

console.log("\n  --- Number.isNaN vs global isNaN ---\n");

// Global isNaN coerces first — leads to false positives
show('isNaN("hello")', isNaN("hello"));               // true — coerces "hello" → NaN
show('Number.isNaN("hello")', Number.isNaN("hello")); // false — "hello" is not NaN, it's a string
show("Number.isNaN(NaN)", Number.isNaN(NaN));         // true — actually NaN
show("Number.isNaN(42)", Number.isNaN(42));           // false

console.log("\n  --- Number.isFinite vs global isFinite ---\n");

show("Number.isFinite(42)", Number.isFinite(42));           // true
show("Number.isFinite(Infinity)", Number.isFinite(Infinity)); // false
show('Number.isFinite("42")', Number.isFinite("42"));       // false — no coercion
show('isFinite("42")', isFinite("42"));                     // true — coerces to 42 first

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Converting to String
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Converting to String ===\n");

show("String(42)", String(42));
show("String(3.14)", String(3.14));
show("String(true)", String(true));
show("String(false)", String(false));
show("String(null)", String(null));
show("String(undefined)", String(undefined));
show("String(Symbol('x'))", String(Symbol("x")));

console.log("\n  --- .toString() with radix ---\n");

show("(255).toString(2)", (255).toString(2));     // binary
show("(255).toString(8)", (255).toString(8));     // octal
show("(255).toString(16)", (255).toString(16));   // hex
show("(42).toString(36)", (42).toString(36));     // base-36

console.log("\n  --- JSON.stringify for complex values ---\n");

show("JSON.stringify({ a: 1 })", JSON.stringify({ a: 1 }));
show("JSON.stringify([1, 2, 3])", JSON.stringify([1, 2, 3]));
show("JSON.stringify(null)", JSON.stringify(null));

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Converting to Boolean
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Converting to Boolean ===\n");

const testCases = [
  ["Boolean(0)", Boolean(0)],
  ["Boolean(-0)", Boolean(-0)],
  ['Boolean("")', Boolean("")],
  ["Boolean(null)", Boolean(null)],
  ["Boolean(undefined)", Boolean(undefined)],
  ["Boolean(NaN)", Boolean(NaN)],
  ["Boolean(0n)", Boolean(0n)],
  ["Boolean(false)", Boolean(false)],
  ['--- truthy ---', "---"],
  ["Boolean(1)", Boolean(1)],
  ['Boolean("0")', Boolean("0")],
  ['Boolean("false")', Boolean("false")],
  ["Boolean([])", Boolean([])],
  ["Boolean({})", Boolean({})],
  ["Boolean(42n)", Boolean(42n)],
  ["Boolean(-1)", Boolean(-1)],
];

for (const [label, value] of testCases) {
  if (value === "---") {
    console.log(`\n  ${label}`);
    continue;
  }
  console.log(`  ${label.padEnd(25)} →  ${value}`);
}

console.log("\n  --- Double-bang shorthand ---\n");

// !! is a common pattern for Boolean conversion
show("!!0", !!0);
show('!!"hello"', !!"hello");
show("!!null", !!null);
show("!![]", !![]);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Template Literals — Beyond Basic Interpolation
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Template Literals ===\n");

// Basic interpolation
const name = "Alice";
const age = 30;
console.log(`  Hello, ${name}! You are ${age} years old.`);
console.log(`  Next year: ${age + 1}. Decade: ${Math.floor(age / 10) * 10}s.`);

// Multi-line strings
console.log("\n  --- Multi-line ---");
const card = `
    +---------------------+
    |  Name: ${name.padEnd(12)} |
    |  Age:  ${String(age).padEnd(12)} |
    +---------------------+`;
console.log(card);

// Nesting template literals
const items = ["apples", "bananas", "cherries"];
const list = `Shopping list:
${items.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}`;
console.log(`\n  ${list}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Tagged Templates
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Tagged Templates ===\n");

// A tagged template is a function that processes template literal parts
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const val = i < values.length ? `[${values[i]}]` : "";
    return result + str + val;
  }, "");
}

const product = "Widget";
const price = 9.99;
console.log(`  ${highlight`Product: ${product}, Price: $${price}`}`);

// Practical use: escaping HTML
function escapeHtml(strings, ...values) {
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
}

const userInput = '<script>alert("xss")</script>';
console.log(`  Raw:     ${userInput}`);
console.log(`  Escaped: ${escapeHtml`User said: ${userInput}`}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Practical Conversion Patterns
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Practical Conversion Patterns ===\n");

// Simulating form / API input (always strings)
const formData = { price: "19.99", quantity: "3", discount: "" };

// BAD: direct addition concatenates strings
const badTotal = formData.price + formData.quantity;
console.log(`  BAD:  price + quantity  →  "${badTotal}" (string concat!)`);

// GOOD: convert first
const goodTotal = Number(formData.price) * Number(formData.quantity);
console.log(`  GOOD: Number(price) * Number(quantity)  →  ${goodTotal}`);

// Handle empty/missing values with nullish coalescing
const discount = Number(formData.discount) || 0; // "" → 0 via Number(), but also catches NaN
console.log(`  Discount (with fallback): ${discount}`);

// Safe conversion helper
function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

console.log(`\n  toNumber("42")        →  ${toNumber("42")}`);
console.log(`  toNumber("abc")       →  ${toNumber("abc")}`);
console.log(`  toNumber("abc", -1)   →  ${toNumber("abc", -1)}`);
console.log(`  toNumber(null)        →  ${toNumber(null)}`);
console.log(`  toNumber(undefined)   →  ${toNumber(undefined)}`);

console.log("\n--- End of 03-conversions.js ---\n");
