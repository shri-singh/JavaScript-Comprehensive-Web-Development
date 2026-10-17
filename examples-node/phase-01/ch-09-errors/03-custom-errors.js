/**
 * Chapter 9 — Example 03: Custom Errors
 *
 * Run:  node examples-node/phase-01/ch-09-errors/03-custom-errors.js
 *
 * This file demonstrates how to create custom error classes by extending
 * Error, build error hierarchies, implement validation patterns, and
 * use error.cause for chaining.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic Custom Error
// ═══════════════════════════════════════════════════════════════════════════════
console.log("=== 1. Basic Custom Error ===\n");

class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);       // pass options for { cause } support
    this.name = "AppError";
    this.timestamp = new Date().toISOString();
  }
}

const err = new AppError("Something went wrong");
console.log(`  err.name:      "${err.name}"`);
console.log(`  err.message:   "${err.message}"`);
console.log(`  err.timestamp: "${err.timestamp}"`);
console.log(`  err instanceof AppError: ${err instanceof AppError}`);
console.log(`  err instanceof Error:    ${err instanceof Error}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Error Hierarchy
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 2. Error Hierarchy ===\n");

class HttpError extends AppError {
  constructor(statusCode, message, options) {
    super(message, options);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }

  get isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }
}

class NotFoundError extends HttpError {
  constructor(resource, id) {
    super(404, `${resource} with id "${id}" not found`);
    this.name = "NotFoundError";
    this.resource = resource;
    this.resourceId = id;
  }
}

class ValidationError extends AppError {
  constructor(fields) {
    const message = fields
      .map((f) => `${f.field}: ${f.message}`)
      .join("; ");
    super(message);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

class DatabaseError extends AppError {
  constructor(query, message, options) {
    super(message, options);
    this.name = "DatabaseError";
    this.query = query;
  }
}

// Demonstrate the hierarchy
const notFound = new NotFoundError("User", 42);
console.log(`  ${notFound.name}: "${notFound.message}"`);
console.log(`  statusCode: ${notFound.statusCode}`);
console.log(`  isClientError: ${notFound.isClientError}`);
console.log(`  instanceof chain:`);
console.log(`    NotFoundError: ${notFound instanceof NotFoundError}`);
console.log(`    HttpError:     ${notFound instanceof HttpError}`);
console.log(`    AppError:      ${notFound instanceof AppError}`);
console.log(`    Error:         ${notFound instanceof Error}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Catching Specific Error Types
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 3. Catching Specific Error Types ===\n");

const simulateRequest = (path) => {
  if (path === "/users/999") {
    throw new NotFoundError("User", 999);
  }
  if (path === "/bad-input") {
    throw new ValidationError([
      { field: "email", message: "invalid format" },
      { field: "age", message: "must be a positive number" },
    ]);
  }
  if (path === "/db-error") {
    throw new DatabaseError(
      "SELECT * FROM users",
      "Connection refused"
    );
  }
  return { status: 200, data: "OK" };
};

const handleRequest = (path) => {
  try {
    const result = simulateRequest(path);
    console.log(`  ${path}: ${JSON.stringify(result)}`);
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log(`  ${path}: 404 — ${error.resource} ${error.resourceId} not found`);
    } else if (error instanceof ValidationError) {
      console.log(`  ${path}: 400 — Validation failed:`);
      for (const f of error.fields) {
        console.log(`    - ${f.field}: ${f.message}`);
      }
    } else if (error instanceof DatabaseError) {
      console.log(`  ${path}: 500 — DB error on query "${error.query}": ${error.message}`);
    } else if (error instanceof HttpError) {
      console.log(`  ${path}: ${error.statusCode} — ${error.message}`);
    } else {
      console.log(`  ${path}: Unexpected error — ${error.message}`);
      throw error; // rethrow unknown errors
    }
  }
};

handleRequest("/users/1");
handleRequest("/users/999");
handleRequest("/bad-input");
handleRequest("/db-error");

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Validation Patterns
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 4. Validation Patterns ===\n");

// Validator that collects all errors before throwing
class Validator {
  #errors = [];

  check(condition, field, message) {
    if (!condition) {
      this.#errors.push({ field, message });
    }
    return this; // enable chaining
  }

  validate() {
    if (this.#errors.length > 0) {
      throw new ValidationError([...this.#errors]);
    }
  }
}

const validateUser = (data) => {
  new Validator()
    .check(
      typeof data.name === "string" && data.name.length > 0,
      "name",
      "must be a non-empty string"
    )
    .check(
      typeof data.email === "string" && data.email.includes("@"),
      "email",
      "must be a valid email"
    )
    .check(
      Number.isInteger(data.age) && data.age >= 0 && data.age <= 150,
      "age",
      "must be an integer between 0 and 150"
    )
    .validate();

  return { ...data, validated: true };
};

// Valid user
try {
  const user = validateUser({ name: "Alice", email: "alice@example.com", age: 30 });
  console.log("  Valid user:", user);
} catch (e) {
  console.log("  Error:", e.message);
}

// Invalid user — collects ALL validation errors
try {
  validateUser({ name: "", email: "invalid", age: -5 });
} catch (e) {
  if (e instanceof ValidationError) {
    console.log("  Validation errors:");
    for (const f of e.fields) {
      console.log(`    - ${f.field}: ${f.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Error Cause Chaining (ES2022)
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 5. Error Cause Chaining (ES2022) ===\n");

const fetchFromDatabase = (id) => {
  throw new DatabaseError(
    `SELECT * FROM products WHERE id = ${id}`,
    "Connection timeout after 5000ms"
  );
};

const getProduct = (id) => {
  try {
    return fetchFromDatabase(id);
  } catch (dbError) {
    throw new HttpError(503, `Service unavailable: could not fetch product ${id}`, {
      cause: dbError,
    });
  }
};

const handleProductRequest = (id) => {
  try {
    return getProduct(id);
  } catch (httpError) {
    throw new AppError(`Request failed for product ${id}`, { cause: httpError });
  }
};

// Walk the error cause chain
try {
  handleProductRequest(42);
} catch (error) {
  console.log("  Error chain:");
  let current = error;
  let depth = 0;
  while (current) {
    const indent = "  ".repeat(depth + 1);
    console.log(`${indent}[${depth}] ${current.name}: ${current.message}`);
    current = current.cause;
    depth++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Defensive Guard Clauses
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 6. Defensive Guard Clauses ===\n");

const createUser = (name, email, age) => {
  // Guard clauses — validate at the boundary
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError("name must be a non-empty string");
  }
  if (typeof email !== "string" || !email.includes("@")) {
    throw new TypeError("email must contain @");
  }
  if (!Number.isFinite(age) || age < 0) {
    throw new RangeError("age must be a non-negative finite number");
  }

  // If we reach here, all inputs are valid
  return {
    name: name.trim(),
    email: email.toLowerCase(),
    age: Math.floor(age),
    createdAt: new Date().toISOString(),
  };
};

// Valid call
try {
  const user = createUser("  Alice  ", "Alice@Example.COM", 30.7);
  console.log("  Created user:", user);
} catch (e) {
  console.log(`  Error: ${e.message}`);
}

// Invalid calls
const invalidCalls = [
  [null, "a@b.com", 30],
  ["Alice", "no-at-sign", 30],
  ["Alice", "a@b.com", -5],
  ["Alice", "a@b.com", Infinity],
];

for (const args of invalidCalls) {
  try {
    createUser(...args);
  } catch (e) {
    console.log(`  createUser(${args.map((a) => JSON.stringify(a)).join(", ")}): ${e.name} — ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Safe Wrapper Pattern
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 7. Safe Wrapper Pattern ===\n");

// Generic wrapper that converts throwing functions into result objects
const trySafe = (fn) => {
  try {
    return { ok: true, data: fn() };
  } catch (error) {
    return { ok: false, error };
  }
};

const result1 = trySafe(() => JSON.parse('{"valid": true}'));
console.log("  Valid JSON:  ", result1);

const result2 = trySafe(() => JSON.parse("nope"));
console.log("  Invalid JSON:", { ok: result2.ok, error: result2.error.message });

// Wrap an existing function
const safeCreateUser = (...args) => trySafe(() => createUser(...args));

console.log("\n  safeCreateUser('Bob', 'bob@test.com', 25):");
console.log("   ", safeCreateUser("Bob", "bob@test.com", 25));

console.log("  safeCreateUser('', 'bob@test.com', 25):");
const badResult = safeCreateUser("", "bob@test.com", 25);
console.log(`    { ok: false, error: "${badResult.error.message}" }`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Summary: Error Handling Decision Tree
// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n=== 8. Error Handling Decision Tree ===\n");

console.log("  Can you prevent the error? -> Use guard clauses / validation");
console.log("  Is it an expected failure?  -> Catch and handle gracefully");
console.log("  Is it a programmer bug?    -> Fix the code, do not just catch it");
console.log("  Can you recover?           -> Return a default or retry");
console.log("  Can you not recover?       -> Rethrow or let it propagate");
console.log("  Do you need cleanup?       -> Use finally");
console.log("  Need error context?        -> Use { cause } when rethrowing");

console.log("\n--- End of 03-custom-errors.js ---\n");
