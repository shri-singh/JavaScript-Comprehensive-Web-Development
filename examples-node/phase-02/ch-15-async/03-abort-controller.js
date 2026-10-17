/**
 * Chapter 15 — Example 03: AbortController
 *
 * Run:  node examples-node/phase-02/ch-15-async/03-abort-controller.js
 *
 * This file demonstrates AbortController for cancelling async operations,
 * AbortSignal.timeout(), custom abortable functions, and combining signals.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ── Helper: simulated fetch that respects AbortSignal ────────────────────────
function simulateFetch(url, ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    // Check if already aborted before starting
    if (signal?.aborted) {
      return reject(new DOMException("The operation was aborted.", "AbortError"));
    }

    const timeoutId = setTimeout(() => {
      resolve({
        ok: true,
        status: 200,
        url,
        data: `Response from ${url}`,
      });
    }, ms);

    // Listen for abort signal
    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("The operation was aborted.", "AbortError"));
    }, { once: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic AbortController Usage
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Basic AbortController Usage");

{
  const controller = new AbortController();
  const { signal } = controller;

  console.log("  Starting a request that takes 500ms...");
  console.log("  Aborting after 100ms...\n");

  // Start the fetch
  const fetchPromise = simulateFetch("/api/users", 500, { signal });

  // Abort after 100ms
  setTimeout(() => controller.abort(), 100);

  try {
    const result = await fetchPromise;
    console.log("  Result:", result); // never reached
  } catch (error) {
    console.log("  Error name:", error.name);     // "AbortError"
    console.log("  Error message:", error.message);
    console.log("  error.name === 'AbortError':", error.name === "AbortError");
  }

  console.log("\n  Always check error.name === 'AbortError' to distinguish");
  console.log("  cancellations from real errors.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AbortSignal.timeout()
// ═══════════════════════════════════════════════════════════════════════════════
header("2. AbortSignal.timeout() — Built-in Timeout");

{
  console.log("  Fetching with a 200ms timeout (request takes 500ms)...\n");

  try {
    const result = await simulateFetch("/api/slow", 500, {
      signal: AbortSignal.timeout(200),
    });
    console.log("  Result:", result); // never reached
  } catch (error) {
    console.log("  Error name:", error.name);
    console.log("  Error message:", error.message);
    console.log("  Timed out as expected.\n");
  }

  console.log("  Fetching with a 200ms timeout (request takes 50ms)...\n");

  try {
    const result = await simulateFetch("/api/fast", 50, {
      signal: AbortSignal.timeout(200),
    });
    console.log("  Result:", result.data);
    console.log("  Succeeded within the timeout.\n");
  } catch (error) {
    console.log("  Unexpected error:", error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Aborting an Already-Aborted Signal
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Checking signal.aborted Before Starting");

{
  const controller = new AbortController();
  controller.abort(); // abort BEFORE the request starts

  console.log("  signal.aborted:", controller.signal.aborted); // true
  console.log("  signal.reason:", controller.signal.reason);

  try {
    await simulateFetch("/api/data", 100, { signal: controller.signal });
  } catch (error) {
    console.log("  Rejected immediately:", error.message);
    console.log("\n  A pre-aborted signal rejects the promise instantly.\n");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Custom Abort Reason
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Custom Abort Reason");

{
  const controller = new AbortController();

  // Provide a custom reason
  controller.abort(new Error("User navigated away"));

  console.log("  signal.reason:", controller.signal.reason.message);

  try {
    await simulateFetch("/api/data", 100, { signal: controller.signal });
  } catch (error) {
    console.log("  Caught:", error.message);
    console.log("\n  You can pass any value to abort() as a custom reason.\n");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Cancelling Multiple Operations with One Controller
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Cancelling Multiple Operations with One Controller");

{
  const controller = new AbortController();
  const { signal } = controller;

  console.log("  Starting 3 parallel requests with the same signal...");
  console.log("  Aborting all after 100ms...\n");

  const requests = [
    simulateFetch("/api/users", 500, { signal }),
    simulateFetch("/api/products", 500, { signal }),
    simulateFetch("/api/orders", 500, { signal }),
  ];

  // Abort all after 100ms
  setTimeout(() => controller.abort(), 100);

  const results = await Promise.allSettled(requests);

  for (const [i, result] of results.entries()) {
    const url = ["/api/users", "/api/products", "/api/orders"][i];
    if (result.status === "rejected") {
      console.log(`  ${url}: ${result.reason.name} — ${result.reason.message}`);
    } else {
      console.log(`  ${url}: succeeded`);
    }
  }

  console.log("\n  One controller.abort() cancels every request using that signal.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Custom Abortable Function: cancellableDelay
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Custom Abortable Function: cancellableDelay");

function cancellableDelay(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

{
  console.log("  Test 1: delay completes normally...");
  await cancellableDelay(50);
  console.log("    50ms delay completed.\n");

  console.log("  Test 2: delay gets cancelled...");
  const controller = new AbortController();

  setTimeout(() => controller.abort(), 30);

  try {
    await cancellableDelay(200, { signal: controller.signal });
    console.log("    Completed (should not happen)");
  } catch (error) {
    console.log(`    Cancelled after ~30ms: ${error.name}`);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. AbortSignal.any — Combining Multiple Abort Conditions
// ═══════════════════════════════════════════════════════════════════════════════
header("7. AbortSignal.any — Combining Abort Conditions");

{
  // Abort if the user cancels OR if we time out
  const userController = new AbortController();

  // AbortSignal.any: abort when ANY signal fires
  const combinedSignal = AbortSignal.any([
    userController.signal,
    AbortSignal.timeout(200),
  ]);

  console.log("  Starting request with combined signal:");
  console.log("    - User cancel controller");
  console.log("    - 200ms timeout\n");

  // Simulate user clicking cancel after 100ms
  setTimeout(() => {
    console.log("  [100ms] User clicked cancel.");
    userController.abort();
  }, 100);

  try {
    await simulateFetch("/api/slow-data", 500, { signal: combinedSignal });
  } catch (error) {
    console.log(`  Aborted by: ${error.name} — ${error.message}`);
    console.log("  The first signal to fire wins.\n");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Practical Pattern: Retryable Fetch with Abort
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Practical Pattern: Retryable Fetch with Abort");

async function retryFetch(url, { maxRetries = 3, baseDelay = 100, signal } = {}) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}...`);
      const result = await simulateFetch(
        url,
        50,
        { signal },
      );

      // Simulate failure for the first two attempts
      if (attempt < 3) {
        throw new Error("Simulated server error");
      }

      return result;
    } catch (error) {
      // If aborted, do not retry
      if (error.name === "AbortError") {
        console.log("  Request was aborted — not retrying.");
        throw error;
      }

      console.log(`  Attempt ${attempt} failed: ${error.message}`);

      if (attempt === maxRetries) {
        throw new Error(`All ${maxRetries} attempts failed`);
      }

      // Exponential backoff
      const backoff = baseDelay * 2 ** (attempt - 1);
      console.log(`  Waiting ${backoff}ms before retry...`);
      await cancellableDelay(backoff, { signal });
    }
  }
}

try {
  const result = await retryFetch("/api/flaky", {
    maxRetries: 3,
    baseDelay: 50,
  });
  console.log("  Final result:", result.data);
} catch (error) {
  console.log("  All retries exhausted:", error.message);
}

console.log();

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Cleanup Pattern: addEventListener with { signal }
// ═══════════════════════════════════════════════════════════════════════════════
header("9. Cleanup Pattern: addEventListener with { signal }");

console.log("  AbortController can also clean up event listeners:\n");
console.log("    const controller = new AbortController();");
console.log("");
console.log('    element.addEventListener("click", handler, {');
console.log("      signal: controller.signal,");
console.log("    });\n");
console.log('    element.addEventListener("keydown", handler, {');
console.log("      signal: controller.signal,");
console.log("    });\n");
console.log("    // Later: remove ALL listeners at once");
console.log("    controller.abort();\n");
console.log("  This is much cleaner than tracking and removing each listener manually.\n");

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 03-abort-controller.js ---\n");
