/**
 * Chapter 16 — Example 03: Authentication Patterns
 *
 * Run:  node examples-node/phase-02/ch-16-http-fetch/03-auth-patterns.js
 *
 * This file simulates JWT authentication flows, bearer token usage,
 * token refresh patterns, and compares storage mechanisms.
 * All "server" interactions are simulated locally for learning purposes.
 *
 * Requires Node.js 18+.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// Simulated Server (in-memory)
// ═══════════════════════════════════════════════════════════════════════════════

const SECRET = "super-secret-key-do-not-use-in-production";

/**
 * Simulates base64url encoding (like a real JWT, but simplified).
 * In production, use a proper JWT library like `jose` or `jsonwebtoken`.
 */
function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function decodeBase64url(str) {
  return JSON.parse(Buffer.from(str, "base64url").toString("utf-8"));
}

/**
 * Creates a simulated JWT token.
 * Real JWTs use cryptographic signatures; this is for learning only.
 */
function createToken(payload, expiresInMs) {
  const headerPart = base64url({ alg: "HS256", typ: "JWT" });
  const payloadPart = base64url({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + expiresInMs,
  });
  const signature = base64url({ sig: `${headerPart}.${payloadPart}.${SECRET}` });

  return `${headerPart}.${payloadPart}.${signature}`;
}

/**
 * Verifies and decodes a simulated JWT token.
 */
function verifyToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const payload = decodeBase64url(parts[1]);

  if (payload.exp < Date.now()) {
    throw new Error("Token expired");
  }

  return payload;
}

// Simulated user database
const users = [
  { id: 1, email: "alice@example.com", password: "password123", name: "Alice", role: "admin" },
  { id: 2, email: "bob@example.com", password: "secret456", name: "Bob", role: "user" },
];

// Simulated refresh tokens store
const refreshTokens = new Set();

/**
 * Simulated API endpoints.
 */
const simulatedServer = {
  async login(email, password) {
    await new Promise((resolve) => setTimeout(resolve, 50)); // simulate latency

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return { ok: false, status: 401, body: { error: "Invalid credentials" } };
    }

    const accessToken = createToken(
      { sub: user.id, email: user.email, role: user.role },
      5_000, // 5 second expiry (short for demo)
    );

    const refreshToken = createToken(
      { sub: user.id, type: "refresh" },
      60_000, // 60 second expiry
    );

    refreshTokens.add(refreshToken);

    return {
      ok: true,
      status: 200,
      body: {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    };
  },

  async getProfile(authHeader) {
    await new Promise((resolve) => setTimeout(resolve, 30));

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { ok: false, status: 401, body: { error: "Missing or invalid Authorization header" } };
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = verifyToken(token);
      const user = users.find((u) => u.id === payload.sub);
      return {
        ok: true,
        status: 200,
        body: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    } catch (error) {
      return { ok: false, status: 401, body: { error: error.message } };
    }
  },

  async refresh(refreshToken) {
    await new Promise((resolve) => setTimeout(resolve, 30));

    if (!refreshTokens.has(refreshToken)) {
      return { ok: false, status: 401, body: { error: "Invalid refresh token" } };
    }

    try {
      const payload = verifyToken(refreshToken);

      // Issue new access token
      const newAccessToken = createToken(
        { sub: payload.sub, email: users.find((u) => u.id === payload.sub).email, role: "user" },
        5_000,
      );

      return {
        ok: true,
        status: 200,
        body: { accessToken: newAccessToken },
      };
    } catch (error) {
      refreshTokens.delete(refreshToken);
      return { ok: false, status: 401, body: { error: "Refresh token expired" } };
    }
  },

  async logout(refreshToken) {
    refreshTokens.delete(refreshToken);
    return { ok: true, status: 200, body: { message: "Logged out" } };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. JWT Structure
// ═══════════════════════════════════════════════════════════════════════════════
header("1. JWT Structure");

{
  const token = createToken({ sub: 1, email: "alice@example.com", role: "admin" }, 60_000);

  console.log("  A JWT has three parts separated by dots:\n");
  console.log("    header.payload.signature\n");

  const [headerPart, payloadPart, signaturePart] = token.split(".");

  console.log("  Full token:");
  console.log(`    ${token.slice(0, 40)}...`);
  console.log();

  console.log("  Header (base64url decoded):");
  console.log("   ", decodeBase64url(headerPart));
  console.log();

  console.log("  Payload (base64url decoded):");
  const payload = decodeBase64url(payloadPart);
  console.log("   ", {
    ...payload,
    iat: `${payload.iat} (${new Date(payload.iat).toISOString()})`,
    exp: `${payload.exp} (${new Date(payload.exp).toISOString()})`,
  });
  console.log();

  console.log("  Signature (base64url decoded):");
  console.log("   ", decodeBase64url(signaturePart));
  console.log();

  console.log("  IMPORTANT: The payload is NOT encrypted, only base64-encoded.");
  console.log("  Anyone can decode it. Never put secrets in a JWT.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Login Flow — Getting a Token
// ═══════════════════════════════════════════════════════════════════════════════
header("2. Login Flow — Getting a Token");

let currentAccessToken = null;
let currentRefreshToken = null;

{
  console.log("  Logging in as alice@example.com...\n");

  const result = await simulatedServer.login("alice@example.com", "password123");

  if (result.ok) {
    currentAccessToken = result.body.accessToken;
    currentRefreshToken = result.body.refreshToken;

    console.log("  Login successful!");
    console.log("  User:", result.body.user);
    console.log("  Access token:", currentAccessToken.slice(0, 30) + "...");
    console.log("  Refresh token:", currentRefreshToken.slice(0, 30) + "...");
  } else {
    console.log("  Login failed:", result.body.error);
  }
  console.log();

  // Test failed login
  console.log("  Attempting login with wrong password...\n");
  const badResult = await simulatedServer.login("alice@example.com", "wrongpass");
  console.log("  Result:", badResult.body);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Bearer Token Pattern — Authenticated Requests
// ═══════════════════════════════════════════════════════════════════════════════
header("3. Bearer Token Pattern — Authenticated Requests");

{
  console.log("  Making an authenticated request to /profile...\n");

  // With valid token
  const result = await simulatedServer.getProfile(`Bearer ${currentAccessToken}`);
  console.log("  With valid token:");
  console.log("  Status:", result.status);
  console.log("  Profile:", result.body);
  console.log();

  // Without token
  const noAuthResult = await simulatedServer.getProfile(null);
  console.log("  Without token:");
  console.log("  Status:", noAuthResult.status);
  console.log("  Error:", noAuthResult.body);
  console.log();

  // With invalid token
  const badTokenResult = await simulatedServer.getProfile("Bearer invalid.token.here");
  console.log("  With invalid token:");
  console.log("  Status:", badTokenResult.status);
  console.log("  Error:", badTokenResult.body);
  console.log();

  console.log("  The Authorization header format is: 'Bearer <token>'\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Token Expiration and Refresh
// ═══════════════════════════════════════════════════════════════════════════════
header("4. Token Expiration and Refresh");

{
  console.log("  Our access token expires in 5 seconds.");
  console.log("  Waiting 6 seconds to let it expire...\n");

  await new Promise((resolve) => setTimeout(resolve, 6_000));

  // Try the expired token
  const expiredResult = await simulatedServer.getProfile(`Bearer ${currentAccessToken}`);
  console.log("  Expired token result:");
  console.log("  Status:", expiredResult.status);
  console.log("  Error:", expiredResult.body);
  console.log();

  // Refresh the token
  console.log("  Refreshing the access token...\n");
  const refreshResult = await simulatedServer.refresh(currentRefreshToken);

  if (refreshResult.ok) {
    currentAccessToken = refreshResult.body.accessToken;
    console.log("  New access token:", currentAccessToken.slice(0, 30) + "...");

    // Retry with new token
    const retryResult = await simulatedServer.getProfile(`Bearer ${currentAccessToken}`);
    console.log("  Retry with new token:");
    console.log("  Status:", retryResult.status);
    console.log("  Profile:", retryResult.body);
  } else {
    console.log("  Refresh failed:", refreshResult.body);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Automatic Token Refresh Wrapper
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Automatic Token Refresh Wrapper");

{
  /**
   * A fetch wrapper that automatically refreshes the token on 401 and retries.
   */
  async function authenticatedRequest(endpoint, options = {}) {
    // First attempt with current access token
    let result = await simulatedServer[endpoint](
      `Bearer ${currentAccessToken}`,
      ...Object.values(options),
    );

    // If 401, try refreshing the token
    if (result.status === 401 && currentRefreshToken) {
      console.log("    Token expired. Refreshing...");
      const refreshResult = await simulatedServer.refresh(currentRefreshToken);

      if (refreshResult.ok) {
        currentAccessToken = refreshResult.body.accessToken;
        console.log("    Token refreshed. Retrying request...");

        // Retry with new token
        result = await simulatedServer[endpoint](
          `Bearer ${currentAccessToken}`,
          ...Object.values(options),
        );
      } else {
        console.log("    Refresh failed. User must log in again.");
        return refreshResult;
      }
    }

    return result;
  }

  // Expire the token by waiting
  console.log("  Waiting for token to expire...\n");
  await new Promise((resolve) => setTimeout(resolve, 6_000));

  console.log("  Calling getProfile with automatic refresh:\n");
  const result = await authenticatedRequest("getProfile");
  console.log("  Final result:", result.body);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Logout — Invalidating Tokens
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Logout — Invalidating Tokens");

{
  console.log("  Before logout:");
  const beforeResult = await simulatedServer.getProfile(`Bearer ${currentAccessToken}`);
  console.log("  Profile accessible:", beforeResult.ok);
  console.log();

  console.log("  Logging out (invalidating refresh token)...");
  await simulatedServer.logout(currentRefreshToken);
  console.log("  Refresh token removed from server.\n");

  // The access token still works until it expires
  const afterResult = await simulatedServer.getProfile(`Bearer ${currentAccessToken}`);
  console.log("  Access token still works until it expires:", afterResult.ok);
  console.log("  This is why access tokens should be short-lived.\n");

  // But refresh will fail
  const refreshResult = await simulatedServer.refresh(currentRefreshToken);
  console.log("  Refresh after logout:", refreshResult.body);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Storage Comparison
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Storage Comparison (Conceptual)");

{
  console.log("  In the browser, you have three storage options for tokens:\n");

  const comparison = [
    {
      method: "localStorage",
      pros: "Persists across tabs and sessions",
      cons: "Vulnerable to XSS (any JS can read it)",
      use: "Non-sensitive preferences, cached data",
    },
    {
      method: "sessionStorage",
      pros: "Cleared when tab closes",
      cons: "Vulnerable to XSS, not shared across tabs",
      use: "Temporary session data",
    },
    {
      method: "HttpOnly Cookie",
      pros: "Not accessible to JavaScript (XSS-safe)",
      cons: "Sent with every request (CSRF risk), size limit",
      use: "Auth tokens (recommended)",
    },
    {
      method: "In-memory variable",
      pros: "Most secure (no persistence attack surface)",
      cons: "Lost on page refresh",
      use: "Short-lived tokens in SPAs",
    },
  ];

  for (const item of comparison) {
    console.log(`  ${item.method}:`);
    console.log(`    Pros: ${item.pros}`);
    console.log(`    Cons: ${item.cons}`);
    console.log(`    Best for: ${item.use}`);
    console.log();
  }

  console.log("  Recommendation: Use HttpOnly cookies for auth tokens when possible.");
  console.log("  If you must use localStorage, use short-lived tokens + refresh tokens.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Common Auth Security Patterns
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Common Auth Security Patterns");

{
  console.log("  1. ALWAYS use HTTPS");
  console.log("     Tokens sent over HTTP can be intercepted by anyone on the network.\n");

  console.log("  2. Short-lived access tokens (5-15 minutes)");
  console.log("     Limits the damage window if a token is stolen.\n");

  console.log("  3. Rotate refresh tokens on use");
  console.log("     Each refresh returns a new refresh token; the old one is invalidated.\n");

  console.log("  4. Store tokens securely");
  console.log("     HttpOnly cookies > in-memory > sessionStorage > localStorage.\n");

  console.log("  5. Validate tokens server-side");
  console.log("     Never trust a token without verifying its signature and expiration.\n");

  console.log("  6. Include audience (aud) and issuer (iss) claims");
  console.log("     Prevents tokens from being used across different services.\n");

  console.log("  7. Implement logout properly");
  console.log("     Invalidate refresh tokens on the server, not just on the client.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Real-World Fetch with Auth Helper
// ═══════════════════════════════════════════════════════════════════════════════
header("9. Real-World Auth Fetch Pattern");

{
  console.log("  Here is a complete auth-aware fetch wrapper you can use:\n");

  console.log(`    class AuthClient {
      #accessToken = null;
      #refreshToken = null;
      #baseUrl;

      constructor(baseUrl) {
        this.#baseUrl = baseUrl;
      }

      async login(email, password) {
        const res = await fetch(this.#baseUrl + "/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        this.#accessToken = data.accessToken;
        this.#refreshToken = data.refreshToken;
        return data.user;
      }

      async fetch(path, options = {}) {
        let res = await fetch(this.#baseUrl + path, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: "Bearer " + this.#accessToken,
          },
        });

        if (res.status === 401) {
          await this.#refresh();
          res = await fetch(this.#baseUrl + path, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: "Bearer " + this.#accessToken,
            },
          });
        }

        return res;
      }

      async #refresh() {
        const res = await fetch(this.#baseUrl + "/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.#refreshToken }),
        });
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        this.#accessToken = data.accessToken;
      }
    }`);

  console.log("\n  This class encapsulates the entire auth lifecycle.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 03-auth-patterns.js ---\n");
