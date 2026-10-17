/**
 * Chapter 7 — Example 02: Sort Gotchas
 *
 * Run:  node examples-node/phase-01/ch-07-arrays-iteration/02-sort-gotchas.js
 *
 * This file demonstrates the surprising default behaviour of Array.prototype.sort,
 * how to write correct numeric and locale-aware comparators, sort stability,
 * and the mutation pitfall.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Default Sort — Lexicographic (String) Comparison
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Default Sort — Lexicographic ===\n");

const numbers = [10, 9, 80, 1, 21, 100, 3];
const defaultSorted = [...numbers].sort();
console.log("  original:", numbers);
console.log("  default sort():", defaultSorted);
// [1, 10, 100, 21, 3, 80, 9] — sorted as strings!

// Why? sort() converts elements to strings:
// "1" < "10" < "100" < "21" < "3" < "80" < "9"
console.log('\n  "10" < "9" as strings:', "10" < "9");
console.log('  "80" < "9" as strings:', "80" < "9");
console.log("  (because string comparison is character-by-character)");

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Numeric Sort — Comparator Function
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Numeric Sort ===\n");

// Ascending: a - b
// - negative → a comes first
// - zero → keep original order
// - positive → b comes first
const ascending = [...numbers].sort((a, b) => a - b);
console.log("  ascending:", ascending);

// Descending: b - a
const descending = [...numbers].sort((a, b) => b - a);
console.log("  descending:", descending);

// Sorting with special values
const withSpecial = [5, -Infinity, 0, -0, Infinity, NaN, 3];
const sortedSpecial = [...withSpecial].sort((a, b) => a - b);
console.log("\n  with special values:", withSpecial);
console.log("  sorted:", sortedSpecial);
console.log("  (NaN comparison returns NaN, so NaN placement is unpredictable)");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. String Sort — Locale-Aware
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Locale-Aware String Sort ===\n");

const words = ["banana", "Apple", "cherry", "apricot"];

// Default sort — uppercase letters come before lowercase (Unicode code point order)
const defaultStr = [...words].sort();
console.log("  default sort:", defaultStr);
// ["Apple", "apricot", "banana", "cherry"] — case sensitive!

// Case-insensitive with localeCompare
const localeSort = [...words].sort((a, b) => a.localeCompare(b));
console.log("  localeCompare:", localeSort);

// Accented characters
const accented = ["ecole", "eclair", "education", "eleve"];
const accentedWithMarks = ["ecole", "\u00e9clair", "\u00e9ducation", "\u00e9l\u00e8ve"];

console.log("\n  without accents (default):", [...accented].sort());
console.log("  with accents (default):   ", [...accentedWithMarks].sort());
console.log(
  "  with accents (locale):    ",
  [...accentedWithMarks].sort((a, b) => a.localeCompare(b))
);

// Locale-specific sorting (e.g., Swedish)
const swedish = ["\u00e4pple", "banan", "\u00f6l", "apelsin"];
console.log("\n  Swedish words (default):", [...swedish].sort());
console.log(
  "  Swedish words (sv locale):",
  [...swedish].sort((a, b) => a.localeCompare(b, "sv"))
);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Sorting Objects
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Sorting Objects ===\n");

const products = [
  { name: "Widget", price: 25.99 },
  { name: "Gadget", price: 49.99 },
  { name: "Doohickey", price: 9.99 },
  { name: "Thingamajig", price: 25.99 },
  { name: "Whatsit", price: 15.00 },
];

// Sort by price ascending
const byPrice = [...products].sort((a, b) => a.price - b.price);
console.log("  By price (ascending):");
byPrice.forEach((p) => console.log(`    $${p.price.toFixed(2)} — ${p.name}`));

// Sort by name
const byName = [...products].sort((a, b) => a.name.localeCompare(b.name));
console.log("\n  By name:");
byName.forEach((p) => console.log(`    ${p.name} — $${p.price.toFixed(2)}`));

// Multi-key sort: by price, then by name
const multiSort = [...products].sort((a, b) => {
  const priceDiff = a.price - b.price;
  if (priceDiff !== 0) return priceDiff;
  return a.name.localeCompare(b.name);
});
console.log("\n  Multi-key (price, then name):");
multiSort.forEach((p) => console.log(`    $${p.price.toFixed(2)} — ${p.name}`));

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Sort Stability
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Sort Stability (ES2019+) ===\n");

// Stable sort means equal elements keep their original relative order.
// This matters when sorting by one key after sorting by another.

const students = [
  { name: "Alice", grade: "A" },
  { name: "Bob", grade: "B" },
  { name: "Charlie", grade: "A" },
  { name: "Diana", grade: "B" },
  { name: "Eve", grade: "A" },
];

// Sort by grade only — students with the same grade should keep their
// original order (Alice before Charlie before Eve for grade "A")
const byGrade = [...students].sort((a, b) => a.grade.localeCompare(b.grade));

console.log("  Sorted by grade (stable):");
byGrade.forEach((s) => console.log(`    ${s.grade} — ${s.name}`));
console.log("  (Alice, Charlie, Eve still in original order for grade A)");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. The Mutation Pitfall
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. The Mutation Pitfall ===\n");

const original = [3, 1, 4, 1, 5, 9];
console.log("  original before sort:", [...original]);

// sort() MUTATES the array in place!
const sorted = original.sort((a, b) => a - b);
console.log("  original after sort: ", original);
console.log("  sorted:              ", sorted);
console.log(`  original === sorted: ${original === sorted} (same reference!)`);

// Safe pattern: always spread first
console.log("\n  Safe pattern:");
const data = [3, 1, 4, 1, 5, 9];
const safeSorted = [...data].sort((a, b) => a - b);
console.log("  data (unchanged):", data);
console.log("  safeSorted:      ", safeSorted);

// toSorted (ES2023) — immutable sort
if (typeof Array.prototype.toSorted === "function") {
  const immutableSorted = data.toSorted((a, b) => a - b);
  console.log("\n  toSorted (ES2023):", immutableSorted);
  console.log("  data still:      ", data);
} else {
  console.log("\n  (toSorted not available in this Node.js version)");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Comparator Function Reference
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Comparator Quick Reference ===\n");

const demo = [5, 3, 8, 1, 7];

console.log("  Ascending (a-b): ", [...demo].sort((a, b) => a - b));
console.log("  Descending (b-a):", [...demo].sort((a, b) => b - a));

// Boolean sort: true values first
const bools = [false, true, false, true, true];
console.log(
  "  Booleans (true first):",
  [...bools].sort((a, b) => Number(b) - Number(a))
);

// Random shuffle (Fisher-Yates is better, but this shows the concept)
// NOTE: sort(() => Math.random() - 0.5) is NOT a fair shuffle!
console.log("  sort(random) is NOT a fair shuffle — use Fisher-Yates instead");

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
console.log("  Fisher-Yates shuffle:", shuffle([1, 2, 3, 4, 5, 6, 7, 8]));

console.log("\n--- End of 02-sort-gotchas.js ---\n");
