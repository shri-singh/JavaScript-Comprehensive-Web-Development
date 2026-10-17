/**
 * Chapter 5 — Example 02: Arrow Functions & Lexical `this`
 *
 * Run:  node examples-node/phase-01/ch-05-functions/02-arrow-functions.js
 *
 * This file focuses on arrow functions — particularly how they inherit
 * `this` from their enclosing scope (lexical this) and the consequences
 * of that behaviour.
 */

"use strict";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Lexical `this` — the key difference
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Lexical this — Arrow vs Regular ===\n");

const team = {
  name: "Engineering",
  members: ["Alice", "Bob", "Carlos"],

  // Regular method — `this` is set by the caller (team.printRegular())
  printRegular() {
    console.log("  Using regular function callback:");
    this.members.forEach(function (member) {
      // In strict mode, `this` is undefined here (NOT the team object)
      // In sloppy mode, `this` would be the global object
      try {
        console.log(`    ${member} → this.name = "${this.name}"`);
      } catch {
        console.log(`    ${member} → this is undefined (strict mode)`);
      }
    });
  },

  // Regular method — `this` is set by the caller (team.printArrow())
  printArrow() {
    console.log("\n  Using arrow function callback:");
    this.members.forEach((member) => {
      // Arrow captures `this` from printArrow's scope — which is `team`
      console.log(`    ${member} → this.name = "${this.name}"`);
    });
  },
};

team.printRegular();
team.printArrow();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. The old workaround: `const self = this`
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Pre-Arrow Workaround: const self = this ===\n");

const project = {
  title: "Dashboard",
  tasks: ["Design", "Develop", "Test"],

  printTasks() {
    const self = this; // capture `this` in a variable
    this.tasks.forEach(function (task) {
      // `self` still points to the project object
      console.log(`  ${self.title}: ${task}`);
    });
  },
};

project.printTasks();
console.log("  (Arrow functions made this pattern unnecessary)");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Arrow functions and object methods — a common mistake
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Arrow Functions as Object Methods (Don't!) ===\n");

const user = {
  name: "Alice",

  // Regular method — `this` works as expected
  greetRegular() {
    return `Hello, I'm ${this.name}`;
  },

  // Arrow method — `this` is NOT the object!
  // It captures `this` from the enclosing scope (module level)
  greetArrow: () => {
    return `Hello, I'm ${typeof globalThis !== "undefined" ? "???" : "???"}`;
  },
};

console.log(`  user.greetRegular(): "${user.greetRegular()}"`);
console.log(`  user.greetArrow():   this.name is undefined because arrow`);
console.log("  inherits this from the module scope, not from the object.\n");
console.log("  Rule: use regular functions (or shorthand) for object methods.");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Arrow functions cannot be constructors
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Arrow Functions Cannot Be Constructors ===\n");

const RegularPerson = function (name) {
  this.name = name;
};

const ArrowPerson = (name) => {
  this.name = name;
};

const p1 = new RegularPerson("Alice");
console.log(`  new RegularPerson("Alice"): ${JSON.stringify(p1)}`);

try {
  const p2 = new ArrowPerson("Bob"); // eslint-disable-line no-unused-vars
} catch (e) {
  console.log(`  new ArrowPerson("Bob"):    ${e.constructor.name}: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Arrow functions do not have `arguments`
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Arrow Functions and `arguments` ===\n");

function outer() {
  // Regular function has its own `arguments`
  console.log(`  outer arguments: [${Array.from(arguments)}]`);

  const inner = () => {
    // Arrow inherits `arguments` from the nearest regular function
    console.log(`  inner (arrow) arguments: [${Array.from(arguments)}]`);
    console.log("  (Same as outer — arrow inherited it)");
  };

  inner();
}

outer(1, 2, 3);

console.log("\n  Better approach — use rest parameters:");

const betterInner = (...args) => {
  console.log(`  rest args: [${args}]`);
};
betterInner(1, 2, 3);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Arrow functions in class methods
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Arrow Functions in Classes ===\n");

class Timer {
  constructor(label) {
    this.label = label;
    this.seconds = 0;
  }

  // Regular method — `this` depends on how it's called
  tick() {
    this.seconds++;
    console.log(`  ${this.label}: ${this.seconds}s`);
  }

  // Arrow as class field — `this` is always the instance
  // (this is syntactic sugar for binding in the constructor)
  tickArrow = () => {
    this.seconds++;
    console.log(`  ${this.label} (arrow): ${this.seconds}s`);
  };
}

const timer = new Timer("Stopwatch");

// Direct call — both work
timer.tick();
timer.tickArrow();

// Extracted method — regular loses `this`, arrow keeps it
const extractedTick = timer.tick;
const extractedArrow = timer.tickArrow;

try {
  extractedTick(); // `this` is undefined in strict mode
} catch {
  console.log("  extractedTick(): `this` is lost (undefined in strict mode)");
}

extractedArrow(); // `this` is still the timer instance
console.log("  extractedArrow(): `this` is preserved (lexical binding)\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Practical patterns: chaining with arrows
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 7. Practical — Chaining with Arrows ===\n");

const people = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Carlos", age: 35 },
  { name: "Diana", age: 28 },
];

// Readable chain of transformations using arrows
const result = people
  .filter((p) => p.age >= 28)
  .map((p) => `${p.name} (${p.age})`)
  .sort()
  .join(", ");

console.log(`  People aged 28+: ${result}`);

// Composing small arrow functions
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const processName = pipe(
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
);

console.log(`  processName("  alice SMITH  "): "${processName("  alice SMITH  ")}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Summary: when to use which
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. When to Use Which ===\n");

console.log("  Use arrow functions when:");
console.log("    - Writing short callbacks (map, filter, reduce, event handlers)");
console.log("    - You need lexical `this` (class fields, nested functions)");
console.log("    - You want concise, readable code\n");

console.log("  Use regular functions when:");
console.log("    - Defining object methods (needs dynamic `this`)");
console.log("    - Using as a constructor (new keyword)");
console.log("    - You need `arguments` (rare — prefer rest params)");
console.log("    - Defining generator functions (function*)");

console.log("\n--- End of 02-arrow-functions.js ---\n");
