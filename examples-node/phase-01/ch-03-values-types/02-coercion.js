/**
 * Chapter 3 — Example 02: Type Coercion
 *
 * Run:  node examples-node/phase-01/ch-03-values-types/02-coercion.js
 *
 * This file explores implicit type coercion, the difference between
 * == (loose) and === (strict) equality, the + operator trap,
 * and truthy/falsy values.
 */

// ─── Helper ──────────────────────────────────────────────────────────────────
const eq = (a, b) => {
  const aStr = typeof a === "string" ? `"${a}"` : String(a);
  const bStr = typeof b === "string" ? `"${b}"` : String(b);
  console.log(`  ${aStr.padEnd(16)} ==  ${bStr.padEnd(16)} →  ${a == b}`);
  console.log(`  ${aStr.padEnd(16)} === ${bStr.padEnd(16)} →  ${a === b}`);
  console.log();
};

// ─── 1. == vs === : The Classic Gotchas ──────────────────────────────────────
console.log("=== 1. == vs === : Surprising Comparisons ===\n");

eq(0, "");          // Both coerce to 0, so == is true
eq(0, "0");         // "0" coerces to 0, so == is true
eq("", "0");        // Both are strings, different values — false for both
eq(false, "0");     // false → 0, "0" → 0, so == is true
eq(false, "");      // false → 0, "" → 0, so == is true
eq(null, undefined);// Special rule: null == undefined is true
eq(null, 0);        // null only == null or undefined — NOT 0
eq(NaN, NaN);       // NaN is not equal to anything, not even itself

// ─── 2. The + Operator Trap ──────────────────────────────────────────────────
console.log("=== 2. The + Operator Trap ===\n");

// If EITHER operand is a string, + concatenates
console.log(`  "5" + 3      →  ${"5" + 3}       (string wins)`);
console.log(`  5 + "3"      →  ${5 + "3"}       (string wins)`);
console.log(`  5 + 3        →  ${5 + 3}        (both numbers, addition)`);
console.log(`  "5" + null   →  ${"5" + null}   (null becomes "null")`);
console.log(`  "5" + true   →  ${"5" + true}   (true becomes "true")`);
console.log();

// Other math operators ALWAYS coerce to number
console.log(`  "5" - 3      →  ${"5" - 3}        (minus forces numeric)`);
console.log(`  "5" * 3      →  ${"5" * 3}       (multiply forces numeric)`);
console.log(`  "5" / "2"    →  ${"5" / "2"}      (divide forces numeric)`);
console.log(`  "abc" - 1    →  ${"abc" - 1}      (can't convert → NaN)`);
console.log();

// The unary + is a quick way to convert to number
console.log(`  +"42"        →  ${+"42"}       (unary + converts to number)`);
console.log(`  +"abc"       →  ${+"abc"}      (NaN if not numeric)`);
console.log(`  +true        →  ${+true}        (true → 1)`);
console.log(`  +false       →  ${+false}        (false → 0)`);
console.log(`  +null        →  ${+null}        (null → 0)`);
console.log(`  +undefined   →  ${+undefined}      (undefined → NaN)`);

// ─── 3. Truthy & Falsy ──────────────────────────────────────────────────────
console.log("\n=== 3. Truthy & Falsy Values ===\n");

const testValues = [
  false, 0, -0, 0n, "", null, undefined, NaN,    // ALL falsy values
  true, 1, -1, "0", "false", [], {}, 42n,         // ALL truthy (some surprising)
];

console.log("  Value                  → Boolean()");
console.log("  " + "─".repeat(45));

for (const val of testValues) {
  const label = typeof val === "string" ? `"${val}"` : typeof val === "bigint" ? `${val}n` : String(val);
  const boolResult = Boolean(val);
  const marker = boolResult ? "truthy" : "FALSY ";
  console.log(`  ${label.padEnd(22)} → ${boolResult.toString().padEnd(6)}  (${marker})`);
}

// ─── 4. Common Truthy/Falsy Pitfalls ─────────────────────────────────────────
console.log("\n=== 4. Common Pitfalls ===\n");

// Empty array is truthy!
if ([]) {
  console.log('  if ([])            → runs! Empty array is TRUTHY.');
}

// But == comparison coerces array to ""
console.log(`  [] == false        →  ${[] == false}   ([] coerces to "", "" coerces to 0, false coerces to 0)`);
console.log(`  [] == 0            →  ${[] == 0}   (same chain)`);
console.log(`  [] == ""           →  ${[] == ""}   ([] coerces to "")`);
console.log();

// "0" is truthy but == 0 is true
if ("0") {
  console.log('  if ("0")           → runs! Non-empty string is TRUTHY.');
}
console.log(`  "0" == false       →  ${("0" == false)}   ("0" → 0, false → 0)`);

// ─── 5. Logical Operators and Coercion ───────────────────────────────────────
console.log("\n=== 5. Logical Operators Return Values (Not Always Booleans) ===\n");

// || returns the first truthy operand (or the last one)
console.log(`  "hello" || "world"   →  ${"hello" || "world"}`);
console.log(`  "" || "fallback"     →  ${"" || "fallback"}`);
console.log(`  0 || null || "yes"   →  ${0 || null || "yes"}`);
console.log(`  0 || "" || null      →  ${0 || "" || null}`);
console.log();

// && returns the first falsy operand (or the last one)
console.log(`  "hello" && "world"   →  ${"hello" && "world"}`);
console.log(`  "" && "world"        →  ${"" && "world"}`);
console.log(`  1 && 2 && 3          →  ${1 && 2 && 3}`);
console.log();

// ?? (nullish coalescing) — only null/undefined trigger fallback
console.log(`  0 ?? "fallback"      →  ${0 ?? "fallback"}      (0 is NOT null/undefined)`);
console.log(`  "" ?? "fallback"     →  ${("" ?? "fallback")}     ("" is NOT null/undefined)`);
console.log(`  null ?? "fallback"   →  ${null ?? "fallback"}`);
console.log(`  undefined ?? "fb"    →  ${undefined ?? "fb"}`);

// ─── 6. Object-to-Primitive Coercion ─────────────────────────────────────────
console.log("\n=== 6. Object-to-Primitive Coercion ===\n");

// Objects convert via .valueOf() then .toString()
console.log(`  {} + []         →  ${String({} + [])}`);
console.log(`  [] + []         →  "${[] + []}"`);
console.log(`  [] + {}         →  "${[] + {}}"`);
console.log(`  {} + {}         →  "${String({} + {})}"`);
console.log();

// Custom valueOf
const price = {
  amount: 42,
  valueOf() { return this.amount; },
};
console.log(`  price + 8       →  ${price + 8}  (valueOf returns 42)`);
console.log(`  price > 40      →  ${price > 40}`);

console.log("\n--- End of 02-coercion.js ---\n");
