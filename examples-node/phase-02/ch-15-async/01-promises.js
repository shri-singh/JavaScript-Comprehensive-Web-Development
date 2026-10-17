/**
 * Chapter 15 — Example 01: Promises
 *
 * Run:  node examples-node/phase-02/ch-15-async/01-promises.js
 *
 * This file demonstrates creating Promises, chaining, error handling,
 * and the static methods: Promise.all, Promise.allSettled, and Promise.race.
 */

// ── Helper: simulated async operation ────────────────────────────────────────
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Creating a Promise
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Creating a Promise");

const myPromise = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) {
      resolve({ id: 1, name: "Alice" });
    } else {
      reject(new Error("Failed to fetch user"));
    }
  }, 100);
});

// Consuming the promise
const user = await myPromise;
console.log("  Resolved value:", user);
console.log("  A promise wraps an eventual value.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Promise States
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Promise States");

const pending = new Promise(() => {}); // never settles
const fulfilled = Promise.resolve("done");
const rejected = Promise.reject(new Error("fail"));

// Suppress unhandled rejection for the demo
rejected.catch(() => {});

console.log("  pending:  ", pending);     // Promise { <pending> }
console.log("  fulfilled:", fulfilled);    // Promise { 'done' }
console.log("  rejected: ", rejected);     // Promise { <rejected> Error: fail }
console.log("\n  Once settled, a promise never changes state again.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Chaining with .then()
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Chaining with .then()");

function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: "Alice", departmentId: 42 }), 50);
  });
}

function fetchDepartment(deptId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: deptId, name: "Engineering" }), 50);
  });
}

function fetchProjects(deptId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(["Project Alpha", "Project Beta"]), 50);
  });
}

// Flat chain — each .then returns a new promise
const projects = await fetchUser(1)
  .then((user) => {
    console.log("  Step 1: Got user:", user.name);
    return fetchDepartment(user.departmentId);
  })
  .then((dept) => {
    console.log("  Step 2: Got department:", dept.name);
    return fetchProjects(dept.id);
  })
  .then((projects) => {
    console.log("  Step 3: Got projects:", projects);
    return projects;
  });

console.log("  Final result:", projects);
console.log("\n  Each .then() returns a new promise, enabling flat chains.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Error Handling with .catch()
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Error Handling with .catch()");

function fetchOrders(userId) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`No orders found for user ${userId}`)), 50);
  });
}

await fetchUser(1)
  .then((user) => {
    console.log("  Got user:", user.name);
    return fetchOrders(user.id);
  })
  .then((orders) => {
    // This never runs because fetchOrders rejects
    console.log("  Orders:", orders);
  })
  .catch((error) => {
    console.log("  Caught error:", error.message);
  })
  .finally(() => {
    console.log("  Finally: cleanup runs regardless of success or failure");
  });

console.log("\n  .catch() handles errors from anywhere in the chain.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Promise.all — Wait for All
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Promise.all — Wait for All");

const start5 = performance.now();

function fetchData(label, ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`${label} (took ${ms}ms)`), ms);
  });
}

const allResults = await Promise.all([
  fetchData("Users", 100),
  fetchData("Products", 200),
  fetchData("Orders", 150),
]);

const elapsed5 = Math.round(performance.now() - start5);

console.log("  Results:", allResults);
console.log(`  Total time: ~${elapsed5}ms (all ran in parallel, not ${100 + 200 + 150}ms)`);
console.log("\n  Promise.all resolves when ALL promises fulfill.\n");

// Promise.all — failure case
console.log("  --- Promise.all failure case ---\n");

const failResults = await Promise.all([
  fetchData("A", 50),
  Promise.reject(new Error("B failed")),
  fetchData("C", 50),
]).catch((error) => {
  console.log("  Promise.all rejected:", error.message);
  console.log("  When ANY promise rejects, the whole Promise.all rejects.");
  return "CAUGHT";
});

console.log("  Resolved to:", failResults);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Promise.allSettled — Get All Results
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Promise.allSettled — Get All Results");

const settledResults = await Promise.allSettled([
  fetchData("Users", 50),
  Promise.reject(new Error("Products API down")),
  fetchData("Orders", 50),
  Promise.reject(new Error("Payments API down")),
]);

for (const result of settledResults) {
  if (result.status === "fulfilled") {
    console.log(`  FULFILLED: ${result.value}`);
  } else {
    console.log(`  REJECTED:  ${result.reason.message}`);
  }
}

const summary = {
  fulfilled: settledResults.filter((r) => r.status === "fulfilled").length,
  rejected: settledResults.filter((r) => r.status === "rejected").length,
  total: settledResults.length,
};

console.log("\n  Summary:", summary);
console.log("  Promise.allSettled never rejects — it waits for every promise to settle.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Promise.race — First to Settle
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Promise.race — First to Settle Wins");

const raceResult = await Promise.race([
  fetchData("Slow server", 300),
  fetchData("Fast server", 50),
  fetchData("Medium server", 150),
]);

console.log("  Winner:", raceResult);
console.log("  Promise.race resolves with the first promise to settle.\n");

// Timeout pattern using Promise.race
console.log("  --- Timeout pattern ---\n");

function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
}

const timeoutResult = await Promise.race([
  fetchData("Slow API", 500),
  timeout(200),
]).catch((error) => {
  console.log("  Timeout caught:", error.message);
  return "TIMED OUT";
});

console.log("  Result:", timeoutResult);
console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Promise.any — First to Fulfill
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Promise.any — First to Fulfill Wins");

const anyResult = await Promise.any([
  Promise.reject(new Error("Server A down")),
  fetchData("Server B (backup)", 100),
  Promise.reject(new Error("Server C down")),
]);

console.log("  First success:", anyResult);
console.log("  Promise.any ignores rejections and returns the first fulfillment.\n");

// Promise.any — all reject case
console.log("  --- All reject case ---\n");

try {
  await Promise.any([
    Promise.reject(new Error("A failed")),
    Promise.reject(new Error("B failed")),
    Promise.reject(new Error("C failed")),
  ]);
} catch (error) {
  console.log("  AggregateError:", error.message);
  console.log("  Individual errors:", error.errors.map((e) => e.message));
  console.log("  When ALL promises reject, Promise.any throws an AggregateError.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Microtask vs Task Queue
// ═══════════════════════════════════════════════════════════════════════════════
header("9. Microtask vs Task Queue — Execution Order");

console.log("  Running the following code:");
console.log('    console.log("1 - sync")');
console.log('    setTimeout(() => console.log("5 - task"), 0)');
console.log('    Promise.resolve().then(() => console.log("3 - microtask"))');
console.log('    queueMicrotask(() => console.log("4 - microtask"))');
console.log('    console.log("2 - sync")');
console.log();

// Wait a tick so previous output flushes cleanly
await delay(50);

console.log("  Output:");
const output = [];
output.push("1 - sync");

const microtaskDone = new Promise((resolve) => {
  setTimeout(() => {
    output.push("5 - task (setTimeout)");
    resolve();
  }, 0);

  Promise.resolve().then(() => {
    output.push("3 - microtask (Promise.then)");
  });

  queueMicrotask(() => {
    output.push("4 - microtask (queueMicrotask)");
  });
});

output.push("2 - sync");

// Wait for all queued work to complete
await delay(50);

for (const line of output) {
  console.log(`    ${line}`);
}

console.log("\n  Sync runs first, then microtasks, then tasks.\n");

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 01-promises.js ---\n");
