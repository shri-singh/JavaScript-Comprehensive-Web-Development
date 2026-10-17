/**
 * Chapter 7 — Example 03: Iterators and Generators
 *
 * Run:  node examples-node/phase-01/ch-07-arrays-iteration/03-iterators-generators.js
 *
 * This file demonstrates the iterable/iterator protocol, for...of,
 * custom iterables, generator functions, yield, and lazy evaluation.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. The Iterator Protocol
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. The Iterator Protocol ===\n");

// An iterator is an object with a next() method that returns { value, done }
const manualIterator = {
  current: 1,
  last: 5,
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  },
};

console.log("  Manual iterator:");
let result = manualIterator.next();
while (!result.done) {
  process.stdout.write(`  ${result.value} `);
  result = manualIterator.next();
}
console.log("(done)\n");

// Built-in iterables: arrays, strings, Maps, Sets
const arr = [10, 20, 30];
const arrIterator = arr[Symbol.iterator]();

console.log("  Array iterator:");
console.log("   ", arrIterator.next()); // { value: 10, done: false }
console.log("   ", arrIterator.next()); // { value: 20, done: false }
console.log("   ", arrIterator.next()); // { value: 30, done: false }
console.log("   ", arrIterator.next()); // { value: undefined, done: true }

// ═══════════════════════════════════════════════════════════════════════════════
// 2. The Iterable Protocol
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. The Iterable Protocol ===\n");

// An object is iterable if it has a [Symbol.iterator]() method
// that returns an iterator.

const range = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { done: true, value: undefined };
      },
    };
  },
};

// for...of uses the iterable protocol
process.stdout.write("  for...of range: ");
for (const n of range) {
  process.stdout.write(`${n} `);
}
console.log();

// Spread also uses the iterable protocol
console.log("  [...range]:    ", [...range]);

// Array.from too
console.log("  Array.from:    ", Array.from(range));

// Destructuring works with iterables
const [first, second, ...rest] = range;
console.log(`  destructured:   first=${first}, second=${second}, rest=[${rest}]`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Custom Iterable Class
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Custom Iterable Class ===\n");

class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;

    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true, value: undefined };
      },
    };
  }
}

const oneToTen = new Range(1, 10);
console.log("  Range(1, 10):      ", [...oneToTen]);

const evens = new Range(0, 20, 2);
console.log("  Range(0, 20, 2):   ", [...evens]);

const countdown = new Range(1, 5);
console.log("  for...of Range(1,5):");
for (const n of countdown) {
  console.log(`    ${n}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. String Iteration
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. String Iteration ===\n");

const greeting = "Hello!";
process.stdout.write("  for...of string: ");
for (const char of greeting) {
  process.stdout.write(`'${char}' `);
}
console.log();

// Strings handle Unicode correctly with for...of
const emoji = "Hi \uD83D\uDE00\uD83D\uDC4D";
console.log(`\n  emoji string: "${emoji}"`);
console.log(`  .length:      ${emoji.length} (counts UTF-16 code units)`);
console.log(`  [...spread]:  [${[...emoji].map((c) => `"${c}"`).join(", ")}]`);
console.log(`  spread.length: ${[...emoji].length} (counts graphemes correctly)`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Generator Functions
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Generator Functions ===\n");

// A generator function is declared with function* and uses yield
function* countUp(start, end) {
  for (let i = start; i <= end; i++) {
    yield i; // pauses here, returns { value: i, done: false }
  }
  // after the loop, returns { value: undefined, done: true }
}

const counter = countUp(1, 5);
console.log("  Manual next() calls:");
console.log("   ", counter.next()); // { value: 1, done: false }
console.log("   ", counter.next()); // { value: 2, done: false }
console.log("   ", counter.next()); // { value: 3, done: false }
console.log("   ", counter.next()); // { value: 4, done: false }
console.log("   ", counter.next()); // { value: 5, done: false }
console.log("   ", counter.next()); // { value: undefined, done: true }

// Generators are iterable — works with for...of, spread, destructuring
console.log("\n  [...countUp(10, 15)]:", [...countUp(10, 15)]);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Infinite Generators & Lazy Evaluation
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Infinite Generators & Lazy Evaluation ===\n");

// Fibonacci — infinite sequence, computed lazily
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Helper: take the first n items from any iterable
function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) return;
    yield item;
    count++;
  }
}

const first10Fib = [...take(10, fibonacci())];
console.log("  First 10 Fibonacci:", first10Fib);

// Natural numbers — infinite
function* naturals(start = 1) {
  let n = start;
  while (true) {
    yield n++;
  }
}

// Composing generators: take + filter
function* filter(predicate, iterable) {
  for (const item of iterable) {
    if (predicate(item)) yield item;
  }
}

// First 10 even natural numbers — lazily computed
const first10Evens = [...take(10, filter((n) => n % 2 === 0, naturals()))];
console.log("  First 10 even naturals:", first10Evens);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Generator Composition with yield*
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. yield* — Delegating to Another Generator ===\n");

function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // delegates to inner — yields 'a' then 'b'
  yield 2;
}

console.log("  [...outer()]:", [...outer()]); // [1, 'a', 'b', 2]

// Practical example: tree traversal
function* preorder(node) {
  yield node.value;
  if (node.left) yield* preorder(node.left);
  if (node.right) yield* preorder(node.right);
}

const tree = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4, left: null, right: null },
    right: { value: 5, left: null, right: null },
  },
  right: {
    value: 3,
    left: null,
    right: { value: 6, left: null, right: null },
  },
};

console.log("  Tree preorder traversal:", [...preorder(tree)]);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Practical Example: Paginated Data
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Practical: Paginated Data Generator ===\n");

// Simulates fetching pages of data — each page is generated on demand
function* paginatedData(allData, pageSize) {
  for (let offset = 0; offset < allData.length; offset += pageSize) {
    const page = allData.slice(offset, offset + pageSize);
    const pageNum = Math.floor(offset / pageSize) + 1;
    yield { page: pageNum, data: page };
  }
}

const allItems = Array.from({ length: 12 }, (_, i) => `item-${i + 1}`);
const pages = paginatedData(allItems, 4);

for (const { page, data } of pages) {
  console.log(`  Page ${page}: [${data.join(", ")}]`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. for...of vs for...in (array pitfall)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 9. for...of vs for...in ===\n");

const nums = [10, 20, 30];

console.log("  for...of (values):");
for (const val of nums) {
  console.log(`    ${val} (type: ${typeof val})`);
}

console.log("\n  for...in (keys — AVOID for arrays):");
for (const key in nums) {
  console.log(`    "${key}" (type: ${typeof key}) — value: ${nums[key]}`);
}
console.log("  (for...in gives string keys, iterates prototype, wrong for arrays)");

console.log("\n--- End of 03-iterators-generators.js ---\n");
