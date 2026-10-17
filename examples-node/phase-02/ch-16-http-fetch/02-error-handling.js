/**
 * Chapter 16 — Example 02: Error Handling with Fetch
 *
 * Run:  node examples-node/phase-02/ch-16-http-fetch/02-error-handling.js
 *
 * This file demonstrates proper error handling: network errors vs HTTP errors,
 * the response.ok check, timeout with AbortSignal.timeout(), and a robust
 * fetchJSON wrapper function.
 *
 * Requires Node.js 18+ (native fetch support).
 */

const BASE_URL = "https://jsonplaceholder.typicode.com";

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. fetch Does NOT Reject on HTTP Errors
// ═══════════════════════════════════════════════════════════════════════════════
header("1. fetch Does NOT Reject on HTTP Errors");

{
  console.log("  Fetching a URL that returns 404...\n");

  try {
    const response = await fetch(`${BASE_URL}/posts/99999`);

    console.log("  Did fetch throw?  No!");
    console.log("  response.ok:     ", response.ok);      // false
    console.log("  response.status: ", response.status);   // 404
    console.log("  response.statusText:", response.statusText);
    console.log();
    console.log("  IMPORTANT: fetch only rejects on NETWORK errors.");
    console.log("  A 404 or 500 is still a successful HTTP response.");
    console.log("  You MUST check response.ok yourself.\n");

    // Consume body to prevent hanging
    await response.json();
  } catch (error) {
    console.log("  This block would only run for network errors:", error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Proper Error Checking Pattern
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Proper Error Checking Pattern");

{
  async function fetchUser(id) {
    const response = await fetch(`${BASE_URL}/users/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Success case
  try {
    const user = await fetchUser(1);
    console.log("  Success:", user.name);
  } catch (error) {
    console.log("  Error:", error.message);
  }

  // Failure case (user does not exist)
  try {
    const user = await fetchUser(99999);
    console.log("  Success:", user.name);
  } catch (error) {
    console.log("  Error:", error.message);
  }

  console.log("\n  Always check response.ok before reading the body.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Network Error vs HTTP Error
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Network Error vs HTTP Error");

{
  async function classifyError(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return {
          type: response.status >= 500 ? "server" : "client",
          status: response.status,
          message: response.statusText,
        };
      }

      await response.json();
      return { type: "success", status: response.status };
    } catch (error) {
      if (error.name === "AbortError") {
        return { type: "timeout", message: "Request timed out" };
      }
      if (error instanceof TypeError) {
        return { type: "network", message: error.message };
      }
      return { type: "unknown", message: error.message };
    }
  }

  // Test with real endpoints
  const tests = [
    { label: "Valid endpoint", url: `${BASE_URL}/users/1` },
    { label: "404 endpoint", url: `${BASE_URL}/users/99999` },
    { label: "Invalid domain", url: "https://this-domain-definitely-does-not-exist-abc123.com/api" },
  ];

  for (const test of tests) {
    const result = await classifyError(test.url);
    console.log(`  ${test.label.padEnd(20)} -> ${JSON.stringify(result)}`);
  }

  console.log("\n  Network errors give TypeError; HTTP errors give status codes.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Timeout with AbortSignal.timeout()
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Timeout with AbortSignal.timeout()");

{
  console.log("  Fetching with a generous timeout (10s) — should succeed...");
  try {
    const response = await fetch(`${BASE_URL}/users/1`, {
      signal: AbortSignal.timeout(10_000),
    });
    const user = await response.json();
    console.log("  Success:", user.name);
  } catch (error) {
    console.log("  Error:", error.name, error.message);
  }

  console.log("\n  Fetching with an extremely short timeout (1ms) — should timeout...");
  try {
    const response = await fetch(`${BASE_URL}/users/1`, {
      signal: AbortSignal.timeout(1),
    });
    const user = await response.json();
    console.log("  Success:", user.name);
  } catch (error) {
    console.log("  Error:", error.name, "-", error.message);
    console.log("  Timed out as expected. error.name is 'TimeoutError'.\n");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Robust fetchJSON Wrapper
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Robust fetchJSON Wrapper");

/**
 * A production-ready fetch wrapper that:
 * - Adds JSON headers automatically
 * - Stringifies the body
 * - Checks response.ok
 * - Provides a timeout
 * - Extracts error details from the response body
 *
 * @param {string} url
 * @param {object} options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<any>} Parsed JSON response
 */
async function fetchJSON(url, { timeout = 10_000, body, ...options } = {}) {
  const headers = {
    "Accept": "application/json",
    ...options.headers,
  };

  // Add Content-Type for requests with a body
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal ?? AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch {
      // Response body was not JSON
    }

    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  // Handle 204 No Content (no body to parse)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Test the wrapper
console.log("  Testing fetchJSON wrapper:\n");

// GET
try {
  const user = await fetchJSON(`${BASE_URL}/users/1`);
  console.log("  GET /users/1:", user.name, `(${user.email})`);
} catch (error) {
  console.log("  Error:", error.message);
}

// POST
try {
  const post = await fetchJSON(`${BASE_URL}/posts`, {
    method: "POST",
    body: { title: "Test", body: "Created via fetchJSON", userId: 1 },
  });
  console.log("  POST /posts:", `id=${post.id}, title="${post.title}"`);
} catch (error) {
  console.log("  Error:", error.message);
}

// 404
try {
  await fetchJSON(`${BASE_URL}/users/99999`);
} catch (error) {
  console.log("  GET /users/99999:", error.message, `(status: ${error.status})`);
}

console.log("\n  The wrapper handles all the boilerplate in one place.\n");

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Retry with Exponential Backoff
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Retry with Exponential Backoff");

{
  let attempt = 0;

  /**
   * Simulates a flaky endpoint that fails the first N times.
   */
  async function flakyFetch(url, failCount = 2) {
    attempt++;
    if (attempt <= failCount) {
      throw new Error(`Simulated failure on attempt ${attempt}`);
    }
    return fetch(url);
  }

  async function fetchWithRetry(url, { maxRetries = 3, baseDelay = 100 } = {}) {
    for (let i = 1; i <= maxRetries; i++) {
      try {
        console.log(`  Attempt ${i}/${maxRetries}...`);
        const response = await flakyFetch(url, 2);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.log(`    Failed: ${error.message}`);

        if (i === maxRetries) {
          throw new Error(`All ${maxRetries} attempts failed. Last error: ${error.message}`);
        }

        const backoff = baseDelay * 2 ** (i - 1);
        console.log(`    Retrying in ${backoff}ms (exponential backoff)...`);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }

  try {
    const user = await fetchWithRetry(`${BASE_URL}/users/1`, {
      maxRetries: 3,
      baseDelay: 50,
    });
    console.log(`  Final result: ${user.name}`);
  } catch (error) {
    console.log(`  Gave up: ${error.message}`);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Reading Response Headers
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Reading Response Headers");

{
  const response = await fetch(`${BASE_URL}/posts?_limit=5`);

  console.log("  Selected response headers:\n");

  const interestingHeaders = [
    "content-type",
    "cache-control",
    "x-powered-by",
    "access-control-allow-credentials",
  ];

  for (const name of interestingHeaders) {
    const value = response.headers.get(name);
    if (value) {
      console.log(`    ${name}: ${value}`);
    }
  }

  console.log("\n  All headers:");
  for (const [name, value] of response.headers) {
    console.log(`    ${name}: ${value}`);
  }

  // Consume body
  await response.json();
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Response.clone() — Reading Body Multiple Times
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Response.clone() — Reading Body Multiple Times");

{
  const response = await fetch(`${BASE_URL}/users/1`);
  const clone = response.clone();

  // Read the original as JSON
  const json = await response.json();
  console.log("  As JSON:", json.name);

  // Read the clone as text
  const text = await clone.text();
  console.log("  As text (first 80 chars):", text.slice(0, 80) + "...");

  console.log("\n  The body can only be consumed once. Use .clone() to read it multiple times.");

  // Demonstrate the error
  try {
    await response.json(); // second read on the same response
  } catch (error) {
    console.log("  Second read error:", error.message);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 02-error-handling.js ---\n");
