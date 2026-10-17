/**
 * Chapter 7 — Example 01: Array Methods
 *
 * Run:  node examples-node/phase-01/ch-07-arrays-iteration/01-array-methods.js
 *
 * This file demonstrates array creation patterns and the essential
 * higher-order array methods: map, filter, reduce, find, findIndex,
 * some, every, flat, and flatMap.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Array Creation
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Array Creation ===\n");

// Literal
const fruits = ["apple", "banana", "cherry"];
console.log("  literal:", fruits);

// Spread (shallow copy)
const fruitsCopy = [...fruits];
fruitsCopy.push("date");
console.log("  spread copy:", fruitsCopy);
console.log("  original:   ", fruits, "(unchanged)");

// Array.from — convert iterable or array-like + optional map
const fromString = Array.from("hello");
console.log("  Array.from('hello'):", fromString);

const sequence = Array.from({ length: 5 }, (_, i) => i + 1);
console.log("  Array.from({ length: 5 }, (_, i) => i + 1):", sequence);

// Array.of — avoids the new Array(n) gotcha
console.log("  Array.of(5):       ", Array.of(5));        // [5]
console.log("  new Array(5):      ", new Array(5));        // [<5 empty items>]
console.log("  Array.of(1, 2, 3): ", Array.of(1, 2, 3));  // [1, 2, 3]

// ═══════════════════════════════════════════════════════════════════════════════
// 2. map — transform every element
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. map ===\n");

const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((n) => n * 2);
console.log("  doubled:", doubled);

const names = ["alice", "bob", "charlie"];
const capitalised = names.map((name) => name[0].toUpperCase() + name.slice(1));
console.log("  capitalised:", capitalised);

// map with index parameter
const indexed = names.map((name, i) => `${i + 1}. ${name}`);
console.log("  indexed:", indexed);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. filter — keep elements that pass a test
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. filter ===\n");

const mixed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = mixed.filter((n) => n % 2 === 0);
console.log("  evens:", evens);

const greaterThan5 = mixed.filter((n) => n > 5);
console.log("  > 5:", greaterThan5);

// Filter falsy values
const withFalsy = [0, "", null, undefined, false, NaN, 1, "hello", true];
const truthy = withFalsy.filter(Boolean);
console.log("  truthy values:", truthy);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. reduce — collapse into a single value
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. reduce ===\n");

// Sum
const sum = [10, 20, 30, 40].reduce((acc, n) => acc + n, 0);
console.log("  sum:", sum);

// Max value
const max = [3, 7, 2, 9, 4].reduce((a, b) => (a > b ? a : b));
console.log("  max:", max);

// Frequency counter
const letters = ["a", "b", "a", "c", "b", "a"];
const freq = letters.reduce((acc, letter) => {
  acc[letter] = (acc[letter] ?? 0) + 1;
  return acc;
}, {});
console.log("  frequency:", freq);

// Array of pairs -> object
const pairs = [["name", "Alice"], ["age", 30], ["city", "Portland"]];
const obj = pairs.reduce((acc, [key, value]) => {
  acc[key] = value;
  return acc;
}, {});
console.log("  pairs -> object:", obj);

// Chaining map + filter + reduce
const totalEvenDoubled = [1, 2, 3, 4, 5, 6]
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .reduce((sum2, n) => sum2 + n, 0);
console.log("  filter(even).map(*2).reduce(sum):", totalEvenDoubled);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. find & findIndex
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. find & findIndex ===\n");

const users = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  { id: 3, name: "Charlie", age: 35 },
  { id: 4, name: "Diana", age: 28 },
];

const found = users.find((u) => u.age > 28);
console.log("  find(age > 28):", found); // first match: Alice

const idx = users.findIndex((u) => u.name === "Charlie");
console.log("  findIndex('Charlie'):", idx); // 2

const notFound = users.find((u) => u.age > 100);
console.log("  find(age > 100):", notFound); // undefined

// ═══════════════════════════════════════════════════════════════════════════════
// 6. some & every
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. some & every ===\n");

const ages = [25, 30, 35, 28];

console.log("  some(age > 30):", ages.some((a) => a > 30));   // true
console.log("  some(age > 40):", ages.some((a) => a > 40));   // false
console.log("  every(age >= 25):", ages.every((a) => a >= 25)); // true
console.log("  every(age >= 30):", ages.every((a) => a >= 30)); // false

// some and every short-circuit
let checksRun = 0;
[1, 2, 3, 4, 5].some((n) => {
  checksRun++;
  return n === 2;
});
console.log(`\n  some(n === 2): short-circuited after ${checksRun} checks`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. includes
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. includes ===\n");

const items = [1, 2, 3, NaN, "hello"];

console.log("  includes(2):", items.includes(2));         // true
console.log("  includes(99):", items.includes(99));       // false
console.log("  includes(NaN):", items.includes(NaN));     // true  (!)
console.log("  indexOf(NaN):", items.indexOf(NaN));       // -1   (!)
console.log("  (includes handles NaN correctly; indexOf does not)");

// ═══════════════════════════════════════════════════════════════════════════════
// 8. flat & flatMap
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. flat & flatMap ===\n");

const nested = [1, [2, 3], [4, [5, 6]], [[7]]];

console.log("  original:", JSON.stringify(nested));
console.log("  flat():  ", JSON.stringify(nested.flat()));         // depth 1
console.log("  flat(2): ", JSON.stringify(nested.flat(2)));        // depth 2
console.log("  flat(Infinity):", JSON.stringify(nested.flat(Infinity)));

// flatMap — map + flat(1) in one step
const sentences = ["Hello world", "Good morning", "Nice day"];
const words = sentences.flatMap((s) => s.split(" "));
console.log("\n  sentences:", sentences);
console.log("  flatMap(split):", words);

// flatMap as a filter+map combo (return [] to remove an element)
const numsToFilter = [1, -2, 3, -4, 5];
const positiveDoubled = numsToFilter.flatMap((n) => (n > 0 ? [n * 2] : []));
console.log("  flatMap filter+map:", positiveDoubled); // [2, 6, 10]

// flatMap to expand: one input -> multiple outputs
const expandedUsers = [
  { name: "Alice", hobbies: ["reading", "coding"] },
  { name: "Bob", hobbies: ["gaming"] },
];
const allHobbies = expandedUsers.flatMap((u) =>
  u.hobbies.map((h) => `${u.name}: ${h}`)
);
console.log("  flatMap expand:", allHobbies);

console.log("\n--- End of 01-array-methods.js ---\n");
