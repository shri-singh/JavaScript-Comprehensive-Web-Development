/**
 * Chapter 20 — Example: debounce-throttle.js
 *
 * Run:  node examples-node/phase-03/ch-20-performance/debounce-throttle.js
 *
 * Implements debounce and throttle from scratch and demonstrates their
 * behavior with simulated rapid function calls.
 *
 * Requires Node.js 18+.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Debounce Implementation
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Debounce — Implementation");

/**
 * Creates a debounced version of a function.
 *
 * The debounced function delays invoking `fn` until `delayMs` milliseconds
 * have passed since the last time the debounced function was called.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} delayMs - The delay in milliseconds.
 * @returns {Function} The debounced function (with a `.cancel()` method).
 */
function debounce(fn, delayMs) {
  let timerId;

  function debounced(...args) {
    // Clear any pending timer — resets the waiting period
    clearTimeout(timerId);

    // Set a new timer
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  }

  // Allow manual cancellation
  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = undefined;
  };

  return debounced;
}

console.log("  debounce(fn, delayMs):");
console.log("    - Waits for a 'quiet period' after the last call.");
console.log("    - If called again before the delay, the timer resets.");
console.log("    - Only the LAST call in a burst actually executes.");
console.log("    - Use case: search-as-you-type, window resize handler.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Throttle Implementation
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Throttle — Implementation");

/**
 * Creates a throttled version of a function.
 *
 * The throttled function executes at most once every `intervalMs` milliseconds.
 * Calls during the cooldown period are silently ignored.
 *
 * @param {Function} fn - The function to throttle.
 * @param {number} intervalMs - The minimum interval between executions.
 * @returns {Function} The throttled function.
 */
function throttle(fn, intervalMs) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= intervalMs) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

console.log("  throttle(fn, intervalMs):");
console.log("    - Executes immediately on first call.");
console.log("    - Ignores calls during the cooldown interval.");
console.log("    - Guarantees at most one execution per interval.");
console.log("    - Use case: scroll handler, rate-limited API calls.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Throttle with Trailing Call
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Throttle with Trailing Call — Implementation");

/**
 * A more complete throttle that guarantees the last call is not lost.
 *
 * Executes immediately on the leading edge, then at most once per interval.
 * If a call arrives during cooldown, it schedules a trailing execution.
 */
function throttleWithTrailing(fn, intervalMs) {
  let lastTime = 0;
  let timerId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = intervalMs - (now - lastTime);

    if (remaining <= 0) {
      // Enough time has passed — execute immediately
      clearTimeout(timerId);
      timerId = null;
      lastTime = now;
      fn.apply(this, args);
    } else if (!timerId) {
      // Schedule a trailing call
      timerId = setTimeout(() => {
        lastTime = Date.now();
        timerId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

console.log("  throttleWithTrailing(fn, intervalMs):");
console.log("    - Same as throttle, but ensures the final call is not lost.");
console.log("    - Schedules a trailing call if a call arrives during cooldown.");
console.log("    - Use case: saving data on scroll (need the final position).\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Debounce Demo — Simulated Typing
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Debounce Demo — Simulated Typing");

{
  const results = [];

  const search = debounce((query) => {
    results.push(query);
  }, 150);

  // Simulate rapid keystrokes (each 50ms apart)
  const keystrokes = ["h", "he", "hel", "hell", "hello"];
  let callCount = 0;

  console.log("  Simulating 5 keystrokes at 50ms intervals (debounce delay: 150ms):\n");

  await new Promise((resolve) => {
    function simulateKeystroke() {
      if (callCount < keystrokes.length) {
        const query = keystrokes[callCount];
        console.log(`    [${callCount * 50}ms] Keystroke: "${query}" → debounce timer reset`);
        search(query);
        callCount++;
        setTimeout(simulateKeystroke, 50);
      } else {
        // Wait for debounce to fire
        setTimeout(() => {
          console.log(`\n    [${callCount * 50 + 150}ms] Debounce fires!`);
          console.log(`    Executed with: "${results[0]}"`);
          console.log(`    Total executions: ${results.length} (out of ${keystrokes.length} calls)`);
          console.log("\n    Only the last value ('hello') triggered the function.");
          resolve();
        }, 200);
      }
    }
    simulateKeystroke();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Throttle Demo — Simulated Scroll
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Throttle Demo — Simulated Scroll Events");

{
  const executions = [];

  const onScroll = throttle((position) => {
    executions.push(position);
  }, 100);

  console.log("  Simulating 20 scroll events at 30ms intervals (throttle: 100ms):\n");

  await new Promise((resolve) => {
    let eventCount = 0;
    const totalEvents = 20;

    function simulateScroll() {
      if (eventCount < totalEvents) {
        const position = eventCount * 15; // Simulate scroll position
        onScroll(position);
        eventCount++;
        setTimeout(simulateScroll, 30);
      } else {
        setTimeout(() => {
          console.log(`    Total scroll events fired:   ${totalEvents}`);
          console.log(`    Times function executed:      ${executions.length}`);
          console.log(`    Positions that executed:      [${executions.join(", ")}]`);
          console.log(`\n    Throttle reduced ${totalEvents} events to ${executions.length} executions.`);
          resolve();
        }, 150);
      }
    }
    simulateScroll();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Comparison: No Limit vs Debounce vs Throttle
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Comparison — No Limit vs Debounce vs Throttle");

{
  let noLimitCount = 0;
  let debounceCount = 0;
  let throttleCount = 0;

  const noLimit = () => { noLimitCount++; };
  const debounced = debounce(() => { debounceCount++; }, 100);
  const throttled = throttle(() => { throttleCount++; }, 100);

  console.log("  Calling all three functions 50 times at 20ms intervals...\n");

  await new Promise((resolve) => {
    let i = 0;
    function call() {
      if (i < 50) {
        noLimit();
        debounced();
        throttled();
        i++;
        setTimeout(call, 20);
      } else {
        // Wait for debounce to settle
        setTimeout(() => {
          console.log(`    No limit:  ${noLimitCount} executions`);
          console.log(`    Debounce:  ${debounceCount} execution(s)  (only after quiet period)`);
          console.log(`    Throttle:  ${throttleCount} executions    (at most 1 per 100ms)`);
          resolve();
        }, 200);
      }
    }
    call();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Debounce Cancel Demo
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Debounce Cancel Demo");

{
  let executed = false;

  const debouncedFn = debounce(() => {
    executed = true;
  }, 100);

  debouncedFn();
  console.log("  Called debounced function.");
  console.log("  Calling .cancel() before the delay expires...");
  debouncedFn.cancel();

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(`  Function executed: ${executed}`);
      console.log("  The .cancel() method prevented execution.");
      resolve();
    }, 200);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Performance Measurement
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Measuring Performance with performance.now()");

{
  function heavyComputation() {
    let sum = 0;
    for (let i = 0; i < 1_000_000; i++) {
      sum += Math.sqrt(i);
    }
    return sum;
  }

  const start = performance.now();
  const result = heavyComputation();
  const duration = performance.now() - start;

  console.log(`  Computed sum of 1,000,000 square roots.`);
  console.log(`  Result: ${result.toFixed(2)}`);
  console.log(`  Duration: ${duration.toFixed(2)}ms`);
  console.log("\n  Use performance.now() to measure real execution times.");
  console.log("  Profile before optimizing — focus on the biggest bottlenecks.");
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n--- End of debounce-throttle.js ---\n");
