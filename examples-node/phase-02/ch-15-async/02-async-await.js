/**
 * Chapter 15 — Example 02: async/await
 *
 * Run:  node examples-node/phase-02/ch-15-async/02-async-await.js
 *
 * This file demonstrates async functions, error handling with try/catch,
 * sequential vs parallel execution, and common pitfalls.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ── Simulated API functions ──────────────────────────────────────────────────

function simulateFetch(label, ms, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`${label}: network error`));
      } else {
        resolve({ label, data: `Data from ${label}`, fetchedIn: `${ms}ms` });
      }
    }, ms);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic async/await
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Basic async/await");

async function getUser(id) {
  // await pauses until the promise settles
  const result = await simulateFetch(`User ${id}`, 100);
  return result;
}

const user = await getUser(42);
console.log("  User:", user);
console.log("  An async function always returns a Promise.");
console.log("  The resolved value is what you return inside it.\n");

// Verify it returns a promise
const promise = getUser(1); // no await
console.log("  Without await:", promise); // Promise { <pending> }
await promise; // wait for it to settle
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Error Handling with try/catch
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Error Handling with try/catch");

async function loadUserData(id) {
  try {
    console.log(`  Fetching user ${id}...`);
    const user = await simulateFetch(`User ${id}`, 50);
    console.log("  User loaded:", user.data);

    console.log("  Fetching orders (will fail)...");
    const orders = await simulateFetch("Orders", 50, true); // this fails
    console.log("  Orders:", orders); // never reached
  } catch (error) {
    console.log("  Caught error:", error.message);
    console.log("  The catch block handles errors from any await in the try block.");
  } finally {
    console.log("  Finally block: always runs (cleanup, hide loaders, etc.)");
  }
}

await loadUserData(1);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Sequential vs Parallel Execution
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Sequential vs Parallel Execution");

// --- Sequential ---
console.log("  --- Sequential (each waits for the previous) ---\n");
const seqStart = performance.now();

const seqA = await simulateFetch("A", 100);
const seqB = await simulateFetch("B", 100);
const seqC = await simulateFetch("C", 100);

const seqTime = Math.round(performance.now() - seqStart);
console.log(`  Sequential results: ${seqA.label}, ${seqB.label}, ${seqC.label}`);
console.log(`  Sequential time:    ~${seqTime}ms (expected ~300ms)\n`);

// --- Parallel ---
console.log("  --- Parallel (all run at the same time) ---\n");
const parStart = performance.now();

const [parA, parB, parC] = await Promise.all([
  simulateFetch("A", 100),
  simulateFetch("B", 100),
  simulateFetch("C", 100),
]);

const parTime = Math.round(performance.now() - parStart);
console.log(`  Parallel results:   ${parA.label}, ${parB.label}, ${parC.label}`);
console.log(`  Parallel time:      ~${parTime}ms (expected ~100ms)\n`);

console.log(`  Speedup: ${seqTime}ms -> ${parTime}ms (${(seqTime / parTime).toFixed(1)}x faster)`);
console.log("  Use Promise.all when operations are independent of each other.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Common Pitfall: await in forEach
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Common Pitfall: await in forEach");

const ids = [1, 2, 3];

console.log("  BAD: forEach does not await the callback:");
console.log("    [1,2,3].forEach(async (id) => { await fetch(id); })");
console.log("    // All three start simultaneously, forEach returns immediately");
console.log("    // You cannot await the result of forEach\n");

console.log("  GOOD option 1: for...of loop (sequential)");
console.log("    for (const id of [1,2,3]) {");
console.log("      const result = await fetch(id); // waits for each");
console.log("    }\n");

// Demonstrate for...of
const forOfStart = performance.now();
const forOfResults = [];
for (const id of ids) {
  const result = await simulateFetch(`User ${id}`, 50);
  forOfResults.push(result.label);
}
const forOfTime = Math.round(performance.now() - forOfStart);
console.log(`    Results: ${forOfResults.join(", ")} in ~${forOfTime}ms (sequential)\n`);

console.log("  GOOD option 2: Promise.all with map (parallel)");
console.log("    const results = await Promise.all(ids.map(id => fetch(id)));\n");

// Demonstrate Promise.all + map
const mapStart = performance.now();
const mapResults = await Promise.all(
  ids.map((id) => simulateFetch(`User ${id}`, 50)),
);
const mapTime = Math.round(performance.now() - mapStart);
console.log(`    Results: ${mapResults.map((r) => r.label).join(", ")} in ~${mapTime}ms (parallel)\n`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. async Functions Always Return Promises
// ═══════════════════════════════════════════════════════════════════════════════
header("5. async Functions Always Return Promises");

async function returnNumber() {
  return 42;
}

async function returnNothing() {
  // implicit return undefined
}

async function throwError() {
  throw new Error("Something broke");
}

const num = returnNumber();
const nothing = returnNothing();
const error = throwError().catch((e) => e); // catch to prevent unhandled rejection

console.log("  returnNumber():", num);      // Promise { 42 }
console.log("  returnNothing():", nothing);  // Promise { undefined }
console.log("  throwError():", await error); // Error: Something broke

console.log("\n  Even 'return 42' becomes Promise.resolve(42).");
console.log("  A thrown error becomes a rejected promise.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Combining async/await with Promise Methods
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Combining async/await with Promise Methods");

async function loadDashboard() {
  console.log("  Loading dashboard data in parallel...\n");

  // Use Promise.allSettled so one failure does not cancel others
  const results = await Promise.allSettled([
    simulateFetch("User Profile", 80),
    simulateFetch("Notifications", 120),
    simulateFetch("Analytics", 60, true), // this one fails
    simulateFetch("Recent Activity", 100),
  ]);

  for (const [i, result] of results.entries()) {
    const label = ["User Profile", "Notifications", "Analytics", "Recent Activity"][i];
    if (result.status === "fulfilled") {
      console.log(`    [OK]   ${label}: ${result.value.data}`);
    } else {
      console.log(`    [FAIL] ${label}: ${result.reason.message}`);
    }
  }

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`\n  Dashboard loaded: ${succeeded} succeeded, ${failed} failed`);
}

await loadDashboard();
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Error Handling Strategies
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Error Handling Strategies");

// Strategy 1: try/catch at the call site
async function strategyCallSite() {
  try {
    const data = await simulateFetch("API", 50, true);
    return data;
  } catch (error) {
    console.log("  Strategy 1 — try/catch at call site:", error.message);
    return null; // graceful fallback
  }
}

await strategyCallSite();

// Strategy 2: .catch on the promise
async function strategyCatch() {
  const data = await simulateFetch("API", 50, true).catch((error) => {
    console.log("  Strategy 2 — .catch on promise:", error.message);
    return null; // fallback value
  });
  console.log("    Fallback value:", data);
}

await strategyCatch();

// Strategy 3: Wrapper function (Go-style error handling)
async function tryCatch(asyncFn) {
  try {
    const data = await asyncFn();
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}

const [data, err] = await tryCatch(() => simulateFetch("API", 50, true));
console.log("  Strategy 3 — Go-style [data, error]:", data, err?.message);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Top-Level await
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Top-Level await");

console.log("  This entire file uses top-level await (ES modules).");
console.log("  Every 'await' at the top level works because this is an ES module.");
console.log("  (package.json has \"type\": \"module\")\n");

// Demonstrating top-level await for configuration loading
const config = await new Promise((resolve) => {
  setTimeout(() => resolve({ env: "development", port: 3000 }), 50);
});

console.log("  Config loaded at module level:", config);
console.log("  Top-level await is great for config, DB connections, etc.\n");

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 02-async-await.js ---\n");
