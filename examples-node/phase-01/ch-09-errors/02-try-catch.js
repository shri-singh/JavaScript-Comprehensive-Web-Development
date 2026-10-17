/**
 * Chapter 9 — Example 02: try / catch / finally
 *
 * Run:  node examples-node/phase-01/ch-09-errors/02-try-catch.js
 *
 * This file demonstrates try/catch/finally patterns including basic
 * error handling, rethrowing, nested try blocks, finally guarantees,
 * and the catch-without-binding syntax.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic try / catch
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Basic try / catch ===\n");

const safeJsonParse = (str) => {
  try {
    const data = JSON.parse(str);
    console.log(`  Parsed successfully: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.log(`  Parse failed: ${error.message}`);
    return null;
  }
};

safeJsonParse('{"name": "Alice", "age": 30}');
safeJsonParse("not valid json");
safeJsonParse("");

// ═══════════════════════════════════════════════════════════════════════════════
// 2. try / catch / finally
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. try / catch / finally ===\n");

const processData = (data) => {
  console.log("  [try] Starting processing...");
  try {
    if (!data) throw new Error("No data provided");
    if (!Array.isArray(data)) throw new TypeError("Data must be an array");
    console.log(`  [try] Processed ${data.length} items`);
    return data.length;
  } catch (error) {
    console.log(`  [catch] ${error.name}: ${error.message}`);
    return -1;
  } finally {
    // Always runs — even after return in try or catch
    console.log("  [finally] Cleanup complete (always runs)");
  }
};

console.log("  Result:", processData([1, 2, 3]));
console.log();
console.log("  Result:", processData(null));
console.log();
console.log("  Result:", processData("not an array"));

// ═══════════════════════════════════════════════════════════════════════════════
// 3. finally Overrides return
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. finally Overrides return (GOTCHA) ===\n");

const trickyReturn = () => {
  try {
    return "from try";
  } finally {
    // WARNING: returning from finally overrides the try return
    return "from finally"; // eslint-disable-line no-unsafe-finally
  }
};

console.log(`  trickyReturn() = "${trickyReturn()}"`);
console.log("  (finally's return overrides try's return — avoid this pattern!)");

// Correct pattern: use finally for cleanup only
const correctPattern = () => {
  let result;
  try {
    result = "from try";
  } finally {
    console.log("  cleanup in finally (no return here)");
  }
  return result;
};

console.log(`  correctPattern() = "${correctPattern()}"`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Rethrowing Errors
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Rethrowing Errors ===\n");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

const validateAge = (age) => {
  if (typeof age !== "number") throw new TypeError("age must be a number");
  if (age < 0 || age > 150) throw new ValidationError(`Invalid age: ${age}`);
  return age;
};

const handleUser = (age) => {
  try {
    const validAge = validateAge(age);
    console.log(`  Valid age: ${validAge}`);
  } catch (error) {
    if (error instanceof ValidationError) {
      // We know how to handle this
      console.log(`  Handled ValidationError: ${error.message}`);
    } else {
      // Not our problem — rethrow
      console.log(`  Rethrowing ${error.name}: ${error.message}`);
      throw error;
    }
  }
};

handleUser(25);       // valid
handleUser(-5);       // ValidationError — handled
handleUser(200);      // ValidationError — handled

try {
  handleUser("abc");  // TypeError — rethrown
} catch (error) {
  console.log(`  Caught rethrown ${error.name}: ${error.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Nested try / catch
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Nested try / catch ===\n");

const fetchConfig = () => {
  const rawData = '{"port": "not a number"}';

  try {
    console.log("  [outer try] Fetching config...");

    let config;
    try {
      console.log("  [inner try] Parsing JSON...");
      config = JSON.parse(rawData);
      console.log("  [inner try] Parse successful");
    } catch (parseError) {
      console.log(`  [inner catch] Parse error: ${parseError.message}`);
      throw new Error("Config file is corrupted", { cause: parseError });
    }

    // Validate
    if (typeof config.port !== "number") {
      throw new TypeError(`port must be a number, got "${config.port}"`);
    }

    return config;
  } catch (error) {
    console.log(`  [outer catch] ${error.name}: ${error.message}`);
    if (error.cause) {
      console.log(`    Caused by: ${error.cause.message}`);
    }
    // Return defaults
    return { port: 3000 };
  } finally {
    console.log("  [finally] Config loading complete");
  }
};

const config = fetchConfig();
console.log(`  Final config: ${JSON.stringify(config)}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Catch Without Binding (ES2019)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Catch Without Binding (ES2019) ===\n");

const featureAvailable = (feature) => {
  try {
    // Attempt to use the feature
    if (feature === "optional-chaining") {
      eval("const x = {}; x?.y;");
      return true;
    }
    return false;
  } catch {
    // We do not need the error object — just know it failed
    return false;
  }
};

console.log(`  optional-chaining available: ${featureAvailable("optional-chaining")}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Error Handling Patterns
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Error Handling Patterns ===\n");

// Pattern 1: Result object (never throws)
const safeDivide = (a, b) => {
  if (typeof a !== "number" || typeof b !== "number") {
    return { ok: false, error: "Both arguments must be numbers" };
  }
  if (b === 0) {
    return { ok: false, error: "Division by zero" };
  }
  return { ok: true, result: a / b };
};

console.log("  safeDivide(10, 3):", safeDivide(10, 3));
console.log("  safeDivide(10, 0):", safeDivide(10, 0));
console.log('  safeDivide("a", 3):', safeDivide("a", 3));

// Pattern 2: Default with try/catch
const getConfigValue = (key) => {
  const configJson = '{"host": "localhost", "port": 3000}';
  try {
    const cfg = JSON.parse(configJson);
    return cfg[key] ?? null;
  } catch {
    return null;
  }
};

console.log(`\n  getConfigValue("host") = "${getConfigValue("host")}"`);
console.log(`  getConfigValue("missing") = ${getConfigValue("missing")}`);

// Pattern 3: Retry logic
const unreliableOperation = (() => {
  let attempts = 0;
  return () => {
    attempts++;
    if (attempts < 3) {
      throw new Error(`Attempt ${attempts} failed`);
    }
    return "success!";
  };
})();

const retry = (fn, maxAttempts) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = fn();
      console.log(`  Attempt ${attempt}: ${result}`);
      return result;
    } catch (error) {
      console.log(`  Attempt ${attempt}: ${error.message}`);
      if (attempt === maxAttempts) {
        throw new Error(`Failed after ${maxAttempts} attempts`, { cause: error });
      }
    }
  }
};

console.log("\n  Retry pattern:");
try {
  retry(unreliableOperation, 5);
} catch (e) {
  console.log(`  Final error: ${e.message}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Error vs Exception: Operational vs Programmer Errors
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Operational vs Programmer Errors ===\n");

console.log("  Operational errors (expected, should be handled):");
console.log("    - File not found");
console.log("    - Network timeout");
console.log("    - Invalid user input");
console.log("    - JSON parse failure");

console.log("\n  Programmer errors (bugs, should be fixed):");
console.log("    - TypeError from accessing property of undefined");
console.log("    - ReferenceError from undeclared variable");
console.log("    - Wrong number of arguments");
console.log("    - Logic errors");

console.log("\n  Rule of thumb:");
console.log("    - Catch and handle operational errors");
console.log("    - Fix programmer errors in your code (do not just catch them)");

console.log("\n--- End of 02-try-catch.js ---\n");
