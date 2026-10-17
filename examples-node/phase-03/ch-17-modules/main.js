/**
 * Chapter 17 — Example: main.js
 *
 * Run:  node examples-node/phase-03/ch-17-modules/main.js
 *
 * Demonstrates importing from modules with named exports, default exports,
 * namespace imports, and renaming imports.
 *
 * Requires Node.js 18+ and "type": "module" in package.json (or use .mjs).
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Named Imports
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Named Imports from math.js");

import { add, subtract, multiply, divide, PI, circleArea, factorial } from "./math.js";

console.log("  add(10, 5)       =", add(10, 5));
console.log("  subtract(10, 5)  =", subtract(10, 5));
console.log("  multiply(10, 5)  =", multiply(10, 5));
console.log("  divide(10, 5)    =", divide(10, 5));
console.log("  PI               =", PI);
console.log("  circleArea(10)   =", circleArea(10));
console.log("  factorial(6)     =", factorial(6));

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Default Import
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Default Import from logger.js");

// Default export — we choose the name
import createLogger from "./logger.js";

const log = createLogger("MainApp");

log.debug("This is a debug message");
log.info("Application started successfully");
log.warn("Memory usage is high");
log.error("Failed to connect to database");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Named + Default Import Together
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Named + Default Import Together");

// You can import default and named exports in one statement
import createLoggerAgain, { LOG_LEVELS } from "./logger.js";

console.log("  Available log levels:", LOG_LEVELS);

const warnLogger = createLoggerAgain("WarnOnly", LOG_LEVELS.WARN);
warnLogger.debug("This will NOT appear (below WARN level)");
warnLogger.info("This will NOT appear (below WARN level)");
warnLogger.warn("This WILL appear");
warnLogger.error("This WILL appear");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Namespace Import
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Namespace Import (import * as)");

import * as math from "./math.js";

console.log("  Namespace object keys:", Object.keys(math));
console.log("  math.add(100, 200)   =", math.add(100, 200));
console.log("  math.E               =", math.E);
console.log("  math.factorial(10)   =", math.factorial(10));

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Renaming Imports
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Renaming Imports");

import { add as sum, multiply as product } from "./math.js";

console.log("  sum(3, 7)        =", sum(3, 7));
console.log("  product(3, 7)    =", product(3, 7));
console.log("  (These are add and multiply renamed at import time)");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Module Scope Demonstration
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Module Scope — Variables Are Private");

// The internal `count` variable in a hypothetical counter module would not
// be accessible here. Let's demonstrate with our math module:
console.log("  typeof PI (imported):", typeof PI);
// math.js does not expose any mutable internal state,
// demonstrating that modules control what is public.
console.log("  Modules only expose what they explicitly export.");
console.log("  Internal variables remain private to the module.");

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n--- End of main.js ---\n");
