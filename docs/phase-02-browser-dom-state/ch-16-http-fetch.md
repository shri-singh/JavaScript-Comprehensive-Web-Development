# Chapter 16 — HTTP + Fetch + APIs

## Learning Objectives

By the end of this chapter you will be able to:

- Explain the HTTP request/response cycle, including methods, status codes, and headers.
- Use the Fetch API to make GET, POST, PUT, and DELETE requests.
- Work with Request and Response objects, including reading JSON and handling streams.
- Handle errors properly with fetch (distinguishing network errors from HTTP errors).
- Explain what CORS is, why it exists, and what a preflight request does.
- Compare cookies, localStorage, and sessionStorage for client-side data storage.
- Describe JWT-based authentication and the bearer token pattern.
- Implement rate-limiting awareness and retry strategies for API calls.

---

## 16.1 HTTP Basics

HTTP (HyperText Transfer Protocol) is the foundation of data exchange on the web. Every time your browser loads a page, submits a form, or calls an API, it uses HTTP.

### The Request/Response Cycle

1. The **client** (browser, Node.js, mobile app) sends an HTTP **request** to a server.
2. The **server** processes the request and sends back an HTTP **response**.
3. The client reads the response and acts on it.

### HTTP Methods

| Method | Purpose | Has Body | Idempotent |
|---|---|---|---|
| `GET` | Retrieve a resource | No | Yes |
| `POST` | Create a new resource | Yes | No |
| `PUT` | Replace a resource entirely | Yes | Yes |
| `PATCH` | Partially update a resource | Yes | No* |
| `DELETE` | Remove a resource | Rarely | Yes |
| `HEAD` | Like GET but no body (headers only) | No | Yes |
| `OPTIONS` | Describe communication options (CORS preflight) | No | Yes |

*PATCH is technically not guaranteed to be idempotent, but many APIs implement it that way.

### Status Codes

| Range | Category | Common Codes |
|---|---|---|
| 1xx | Informational | 100 Continue, 101 Switching Protocols |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection | 301 Moved Permanently, 304 Not Modified |
| 4xx | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Server Error | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

### Headers

Headers carry metadata about the request or response:

```
// Request headers
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json

// Response headers
Content-Type: application/json; charset=utf-8
Cache-Control: max-age=3600
X-RateLimit-Remaining: 47
```

---

## 16.2 The Fetch API

`fetch()` is the modern, promise-based API for making HTTP requests. It is available in browsers and Node.js 18+.

### Basic GET Request

```js
const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
const user = await response.json();
console.log(user.name); // "Leanne Graham"
```

### POST Request (Creating Data)

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "My Post",
    body: "Hello, world!",
    userId: 1,
  }),
});

const newPost = await response.json();
console.log(newPost.id); // 101 (assigned by server)
```

### PUT Request (Replacing Data)

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id: 1,
    title: "Updated Title",
    body: "Updated body",
    userId: 1,
  }),
});
```

### DELETE Request

```js
const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
  method: "DELETE",
});
console.log(response.status); // 200
```

---

## 16.3 Request and Response Objects

### The Request Object

`fetch` accepts a URL string or a `Request` object:

```js
const request = new Request("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "value" }),
});

const response = await fetch(request);
```

### The Response Object

The `Response` object has several useful properties:

```js
const response = await fetch(url);

response.ok;          // true if status is 200-299
response.status;      // 200
response.statusText;  // "OK"
response.headers;     // Headers object
response.url;         // final URL (after redirects)
response.redirected;  // true if the request was redirected
```

### Reading the Response Body

The body can only be read **once**. Choose the right method:

```js
const json = await response.json();   // Parse as JSON
const text = await response.text();   // Read as plain text
const blob = await response.blob();   // Read as Blob (binary)
const buffer = await response.arrayBuffer(); // Read as ArrayBuffer
```

If you need to read the body multiple times, clone the response first:

```js
const clone = response.clone();
const json = await response.json();
const text = await clone.text();
```

---

## 16.4 JSON Handling

### Sending JSON

Always set the `Content-Type` header and stringify the body:

```js
const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify(data),
});
```

### Receiving JSON

```js
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const data = await response.json();
```

### JSON.parse Safety

Always wrap `JSON.parse` in try/catch when dealing with user input or external data:

```js
function safeJsonParse(text) {
  try {
    return { data: JSON.parse(text), error: null };
  } catch (error) {
    return { data: null, error };
  }
}
```

---

## 16.5 CORS (Cross-Origin Resource Sharing)

### What Is CORS?

The **Same-Origin Policy** prevents a web page from making requests to a different origin (protocol + domain + port). CORS is a mechanism that allows servers to explicitly permit cross-origin requests.

### How It Works

1. The browser adds an `Origin` header to cross-origin requests.
2. The server responds with `Access-Control-Allow-Origin` headers.
3. If the server allows the origin, the browser lets the response through.

### Simple Requests vs Preflight

**Simple requests** (GET, POST with simple headers) go directly to the server.

**Preflight requests** happen when the request uses non-simple methods (PUT, DELETE, PATCH) or custom headers. The browser sends an OPTIONS request first:

```
OPTIONS /api/data HTTP/1.1
Origin: https://myapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization

// Server responds:
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### Common CORS Errors

- **"No 'Access-Control-Allow-Origin' header"** — the server does not allow your origin. Fix this on the server, not the client.
- **"Request header field X is not allowed"** — add the header to `Access-Control-Allow-Headers` on the server.
- CORS is a **browser** security feature. Server-to-server requests (Node.js) are not affected by CORS.

---

## 16.6 Error Handling with Fetch

**Critical concept**: `fetch` only rejects on **network errors** (DNS failure, no internet). It does **not** reject for HTTP errors (404, 500, etc.):

```js
// This does NOT throw for 404 or 500!
const response = await fetch("/api/missing-endpoint");
console.log(response.ok);     // false
console.log(response.status);  // 404
```

### Proper Error Handling Pattern

```js
async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    // Try to extract error details from the response body
    let errorBody;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json();
}

// Usage
try {
  const user = await fetchJSON("/api/users/1");
  console.log(user);
} catch (error) {
  if (error.status === 404) {
    console.log("User not found");
  } else if (error.status === 401) {
    console.log("Not authenticated — redirect to login");
  } else {
    console.log("Unexpected error:", error.message);
  }
}
```

### Network Error vs HTTP Error

```js
try {
  const response = await fetch(url);

  // HTTP error (server responded, but with an error status)
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const data = await response.json();
} catch (error) {
  if (error instanceof TypeError) {
    // Network error (no response at all)
    console.log("Network error:", error.message);
  } else {
    // HTTP error or JSON parse error
    console.log("Application error:", error.message);
  }
}
```

---

## 16.7 Cookies vs localStorage vs sessionStorage

| Feature | Cookies | localStorage | sessionStorage |
|---|---|---|---|
| Capacity | ~4 KB | ~5-10 MB | ~5-10 MB |
| Sent with requests | Yes (automatic) | No | No |
| Expiration | Set by server or JS | Manual only | Tab/window close |
| Scope | Per-domain, per-path | Per-origin | Per-tab, per-origin |
| Accessible from JS | Yes (unless `HttpOnly`) | Yes | Yes |
| Best for | Auth tokens (HttpOnly), tracking | User preferences, cached data | Temporary form data |

### Cookies

```js
// Set a cookie (from JavaScript)
document.cookie = "theme=dark; max-age=31536000; path=/; SameSite=Strict";

// Read cookies
const cookies = document.cookie; // "theme=dark; session=abc123"

// Delete a cookie (set max-age to 0)
document.cookie = "theme=; max-age=0; path=/";
```

### localStorage / sessionStorage

```js
// Store
localStorage.setItem("user", JSON.stringify({ name: "Alice" }));

// Retrieve
const user = JSON.parse(localStorage.getItem("user"));

// Remove
localStorage.removeItem("user");

// Clear all
localStorage.clear();
```

### Security Considerations

- **Never store sensitive tokens in localStorage** — it is accessible to any JavaScript on the page, including XSS attacks.
- **Prefer `HttpOnly` cookies for auth tokens** — they cannot be read by JavaScript.
- **Use `Secure` and `SameSite` cookie flags** to prevent CSRF attacks.
- **localStorage is synchronous** — very large reads/writes can block the main thread.

---

## 16.8 Authentication Concepts

### JWT (JSON Web Token)

A JWT is a self-contained token with three parts separated by dots:

```
header.payload.signature
eyJhbGciOiJIUzI1NiIs...  .  eyJzdWIiOiIxMjM0NTY3ODkw...  .  SflKxwRJSMeKKF2QT4fw...
```

- **Header** — algorithm and token type (base64-encoded JSON).
- **Payload** — claims like user ID, roles, expiration (base64-encoded JSON).
- **Signature** — cryptographic signature to verify the token was not tampered with.

### The Bearer Token Pattern

```js
// After login, store the token
const loginResponse = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const { token } = await loginResponse.json();

// Use the token in subsequent requests
const userResponse = await fetch("/api/profile", {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});
```

### Token Refresh Pattern

Tokens expire. A common pattern uses two tokens:

1. **Access token** — short-lived (e.g., 15 minutes), used for API requests.
2. **Refresh token** — long-lived (e.g., 7 days), used only to get a new access token.

```js
async function fetchWithAuth(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Authorization": `Bearer ${getAccessToken()}`,
    },
  });

  // If token expired, refresh and retry
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${newToken}`,
      },
    });
  }

  return response;
}
```

---

## 16.9 Rate Limiting

APIs often limit how many requests you can make in a given time window:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700000060
```

### Handling Rate Limits

```js
async function fetchWithRateLimit(url, options = {}) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60_000;

    console.log(`Rate limited. Retrying after ${waitMs / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    return fetchWithRateLimit(url, options); // retry
  }

  return response;
}
```

### Client-Side Rate Limiting

Prevent overwhelming the server by limiting requests on the client side:

```js
function createRateLimiter(maxRequests, windowMs) {
  const timestamps = [];

  return async function rateLimitedFetch(url, options) {
    const now = Date.now();

    // Remove timestamps outside the window
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
      timestamps.shift();
    }

    if (timestamps.length >= maxRequests) {
      const waitMs = timestamps[0] + windowMs - now;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    timestamps.push(Date.now());
    return fetch(url, options);
  };
}

// Allow 10 requests per second
const limitedFetch = createRateLimiter(10, 1000);
```

---

## Tricky Things & Gotchas

1. **`fetch` does not reject on 404 or 500** — this is the most common fetch mistake. Always check `response.ok` or `response.status` before reading the body.

2. **The body can only be consumed once** — calling `response.json()` a second time throws. Use `response.clone()` if you need to read the body multiple times.

3. **`Content-Type` must match the body** — sending JSON without `Content-Type: application/json` causes servers to misinterpret the request body.

4. **CORS cannot be fixed from the client** — CORS headers must come from the server. If you do not control the server, use a backend proxy.

5. **Cookies require `credentials: "include"`** — by default, `fetch` does not send cookies on cross-origin requests. Set `credentials: "include"` if you need them.

6. **JWT tokens are base64-encoded, not encrypted** — anyone can decode the payload. Never put secrets in a JWT. The signature only ensures the token was not modified.

7. **localStorage is synchronous and blocking** — reading or writing large amounts of data can freeze the UI. Keep stored data small.

8. **`Retry-After` header values vary** — some servers send seconds (`60`), others send dates (`Wed, 21 Oct 2025 07:28:00 GMT`). Handle both formats.

---

## Best Practices

- Always check `response.ok` before reading the body from a fetch response.
- Set `Content-Type` and `Accept` headers explicitly for JSON APIs.
- Use a wrapper function (like `fetchJSON`) that handles error checking, so you do not repeat the same boilerplate in every fetch call.
- Store auth tokens in `HttpOnly` cookies rather than localStorage when possible.
- Implement request timeouts using `AbortSignal.timeout()`.
- Handle rate limiting gracefully with exponential backoff and `Retry-After` headers.
- Never put sensitive data in JWT payloads — the payload is not encrypted.
- Use HTTPS for all API requests to prevent token interception.

---

## Exercises

1. **GET request.** Use fetch to get a user from `https://jsonplaceholder.typicode.com/users/1`. Log the user's name, email, and company name. Handle errors properly.

2. **POST request.** Create a new post using the JSONPlaceholder API. Send a title, body, and userId. Log the response including the assigned id.

3. **fetchJSON wrapper.** Build a `fetchJSON(url, options)` function that automatically adds JSON headers, stringifies the body, checks `response.ok`, and parses the JSON response. Throw a descriptive error for non-OK responses.

4. **Parallel fetching.** Fetch all 10 users and all 100 posts from JSONPlaceholder in parallel using `Promise.all`. Log how long both requests took combined.

5. **Error classifier.** Write a function that takes a fetch error and classifies it as: `"network"` (TypeError), `"timeout"` (AbortError), `"client"` (4xx), `"server"` (5xx), or `"unknown"`. Test it with simulated errors.

6. **Rate limiter.** Implement a `createThrottledFetch(requestsPerSecond)` function that queues requests to stay under the limit. Test it by making 20 requests and verifying they are spaced correctly.

7. **Token refresh.** Simulate a JWT auth flow: login to get a token, make an authenticated request, handle a 401 by refreshing the token, and retry the original request. Use simulated endpoints.

8. **Storage comparison.** Write a program that stores the same 1,000-item dataset in localStorage and sessionStorage. Measure write and read times for each. Document the results.

---

## Mini-Lab

Run the Node.js examples in [`../../examples-node/phase-02/ch-16-http-fetch/`](../../examples-node/phase-02/ch-16-http-fetch/) to see every concept from this chapter in action:

```bash
node examples-node/phase-02/ch-16-http-fetch/01-fetch-basics.js
node examples-node/phase-02/ch-16-http-fetch/02-error-handling.js
node examples-node/phase-02/ch-16-http-fetch/03-auth-patterns.js
```

The examples cover:
- GET, POST, PUT, and DELETE requests against a real API (JSONPlaceholder)
- Proper error handling for network errors vs HTTP errors, with timeouts
- Simulated JWT authentication flow, bearer token pattern, and storage comparison

---

## What's Next

With HTTP and the Fetch API mastered, you are ready to build real applications that communicate with servers. Phase 3 will bring these skills together with routing, testing, and professional development practices.
