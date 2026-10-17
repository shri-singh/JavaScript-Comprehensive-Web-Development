/**
 * Chapter 17 — Example: dynamic-import.js
 *
 * Run:  node examples-node/phase-03/ch-17-modules/dynamic-import.js
 *
 * Demonstrates dynamic import() for on-demand module loading.
 * Unlike static `import` declarations, dynamic import() can be:
 *   - Called conditionally
 *   - Called inside functions
 *   - Used with computed/dynamic paths
 *
 * Requires Node.js 18+.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic Dynamic Import
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Basic Dynamic import()");

{
  console.log("  Before import — math module is NOT loaded yet.");

  // import() returns a Promise that resolves to the module namespace
  const mathModule = await import("./math.js");

  console.log("  After import — math module is now loaded.");
  console.log("  mathModule keys:", Object.keys(mathModule));
  console.log("  mathModule.add(3, 4) =", mathModule.add(3, 4));
  console.log("  mathModule.PI =", mathModule.PI);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Destructuring Dynamic Import
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Destructuring the Dynamic Import Result");

{
  // You can destructure just like a static import
  const { multiply, factorial, circleArea } = await import("./math.js");

  console.log("  multiply(6, 7)   =", multiply(6, 7));
  console.log("  factorial(5)     =", factorial(5));
  console.log("  circleArea(3)    =", circleArea(3).toFixed(4));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Default Export via Dynamic Import
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Accessing Default Export via Dynamic import()");

{
  // The default export lives on the `.default` property
  const loggerModule = await import("./logger.js");

  console.log("  loggerModule.default:", typeof loggerModule.default);
  console.log("  loggerModule.LOG_LEVELS:", loggerModule.LOG_LEVELS);

  const createLogger = loggerModule.default;
  const log = createLogger("DynamicDemo");
  log.info("Loaded logger dynamically!");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Conditional Loading
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Conditional Loading");

{
  const needsAdvancedMath = true; // simulate a runtime condition

  if (needsAdvancedMath) {
    const { factorial, circleArea } = await import("./math.js");
    console.log("  Advanced math loaded conditionally.");
    console.log("  factorial(8) =", factorial(8));
    console.log("  circleArea(5) =", circleArea(5).toFixed(2));
  } else {
    console.log("  Advanced math was NOT needed — module NOT loaded.");
  }

  console.log("  This pattern avoids loading code you do not use.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Dynamic Path (Computed Module Specifier)
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Dynamic Path (Computed Module Specifier)");

{
  // Static import cannot do this — the path must be a string literal.
  // Dynamic import() accepts any expression that evaluates to a string.
  const modules = ["math", "logger"];

  for (const name of modules) {
    const mod = await import(`./${name}.js`);
    const exportNames = Object.keys(mod);
    console.log(`  ./${name}.js exports: [${exportNames.join(", ")}]`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Loading Inside a Function (Lazy Loading Pattern)
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Lazy Loading Pattern");

{
  // In real apps, you would use this pattern to defer loading until a user
  // action triggers the need for a module.

  async function computeCircleArea(radius) {
    // Module is only loaded the first time this function runs.
    // Subsequent calls reuse the cached module (import() caches).
    const { circleArea } = await import("./math.js");
    return circleArea(radius);
  }

  console.log("  Function defined — math module not loaded yet (in theory).");
  const area = await computeCircleArea(10);
  console.log(`  computeCircleArea(10) = ${area.toFixed(4)}`);
  console.log("  In a real app, the module loads only when the function is first called.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Error Handling with Dynamic Import
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Error Handling with Dynamic import()");

{
  try {
    await import("./nonexistent-module.js");
  } catch (error) {
    console.log("  Caught error loading nonexistent module:");
    console.log(`  ${error.constructor.name}: ${error.message.split("\n")[0]}`);
    console.log("  Always wrap dynamic import() in try/catch for robust code.");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n--- End of dynamic-import.js ---\n");
