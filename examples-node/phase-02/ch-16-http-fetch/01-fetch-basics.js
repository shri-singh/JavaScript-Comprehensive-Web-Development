/**
 * Chapter 16 — Example 01: Fetch Basics
 *
 * Run:  node examples-node/phase-02/ch-16-http-fetch/01-fetch-basics.js
 *
 * This file demonstrates GET, POST, PUT, and DELETE requests using the
 * Fetch API against the public JSONPlaceholder API.
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
// 1. GET Request — Fetching a Single Resource
// ═══════════════════════════════════════════════════════════════════════════════
header("1. GET Request — Fetching a Single User");

{
  const response = await fetch(`${BASE_URL}/users/1`);

  console.log("  Response status:", response.status);
  console.log("  Response ok:", response.ok);
  console.log("  Content-Type:", response.headers.get("Content-Type"));
  console.log();

  const user = await response.json();
  console.log("  User:", {
    name: user.name,
    email: user.email,
    company: user.company.name,
    city: user.address.city,
  });
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GET Request — Fetching a Collection
// ═══════════════════════════════════════════════════════════════════════════════
header("2. GET Request — Fetching All Users");

{
  const response = await fetch(`${BASE_URL}/users`);
  const users = await response.json();

  console.log(`  Fetched ${users.length} users:\n`);
  for (const user of users) {
    console.log(`    ${user.id}. ${user.name} (${user.email})`);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GET with Query Parameters
// ═══════════════════════════════════════════════════════════════════════════════
header("3. GET with Query Parameters");

{
  // Use URLSearchParams for clean query string building
  const params = new URLSearchParams({
    userId: "1",
    _limit: "3",
  });

  const url = `${BASE_URL}/posts?${params}`;
  console.log("  Request URL:", url);

  const response = await fetch(url);
  const posts = await response.json();

  console.log(`  Fetched ${posts.length} posts for userId=1:\n`);
  for (const post of posts) {
    console.log(`    ${post.id}. ${post.title.slice(0, 50)}...`);
  }
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. POST Request — Creating a Resource
// ═══════════════════════════════════════════════════════════════════════════════
header("4. POST Request — Creating a New Post");

{
  const newPost = {
    title: "Understanding the Fetch API",
    body: "The Fetch API provides a modern, promise-based way to make HTTP requests.",
    userId: 1,
  };

  console.log("  Sending POST request...");
  console.log("  Body:", JSON.stringify(newPost, null, 4));
  console.log();

  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(newPost),
  });

  console.log("  Response status:", response.status);
  console.log("  Response statusText:", response.statusText);

  const created = await response.json();
  console.log("  Created post:", created);
  console.log(`  Server assigned id: ${created.id}`);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PUT Request — Replacing a Resource
// ═══════════════════════════════════════════════════════════════════════════════
header("5. PUT Request — Replacing a Post");

{
  const updatedPost = {
    id: 1,
    title: "Updated: Understanding HTTP Methods",
    body: "PUT replaces the entire resource with the new data.",
    userId: 1,
  };

  console.log("  Sending PUT to /posts/1...");

  const response = await fetch(`${BASE_URL}/posts/1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedPost),
  });

  const result = await response.json();
  console.log("  Response status:", response.status);
  console.log("  Updated post:", result);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PATCH Request — Partial Update
// ═══════════════════════════════════════════════════════════════════════════════
header("6. PATCH Request — Partial Update");

{
  console.log("  Sending PATCH to /posts/1 (only updating title)...");

  const response = await fetch(`${BASE_URL}/posts/1`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Patched Title Only",
    }),
  });

  const result = await response.json();
  console.log("  Response status:", response.status);
  console.log("  Patched post:", result);
  console.log("  Note: only the title changed; other fields remain.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DELETE Request
// ═══════════════════════════════════════════════════════════════════════════════
header("7. DELETE Request");

{
  console.log("  Sending DELETE to /posts/1...");

  const response = await fetch(`${BASE_URL}/posts/1`, {
    method: "DELETE",
  });

  console.log("  Response status:", response.status);
  console.log("  Response ok:", response.ok);
  console.log("  Resource deleted (JSONPlaceholder returns empty object):", await response.json());
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Parallel Fetching with Promise.all
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Parallel Fetching with Promise.all");

{
  const start = performance.now();

  const [users, posts, comments] = await Promise.all([
    fetch(`${BASE_URL}/users`).then((r) => r.json()),
    fetch(`${BASE_URL}/posts?_limit=10`).then((r) => r.json()),
    fetch(`${BASE_URL}/comments?_limit=10`).then((r) => r.json()),
  ]);

  const elapsed = Math.round(performance.now() - start);

  console.log(`  Fetched in parallel (~${elapsed}ms):`);
  console.log(`    Users:    ${users.length}`);
  console.log(`    Posts:    ${posts.length}`);
  console.log(`    Comments: ${comments.length}`);
  console.log("\n  Three requests ran simultaneously instead of sequentially.\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Response Object Properties
// ═══════════════════════════════════════════════════════════════════════════════
header("9. Response Object Properties");

{
  const response = await fetch(`${BASE_URL}/users/1`);

  console.log("  response.ok:         ", response.ok);
  console.log("  response.status:     ", response.status);
  console.log("  response.statusText: ", response.statusText);
  console.log("  response.url:        ", response.url);
  console.log("  response.redirected: ", response.redirected);
  console.log("  response.type:       ", response.type);

  console.log("\n  Selected headers:");
  console.log("    Content-Type:", response.headers.get("Content-Type"));
  console.log("    Cache-Control:", response.headers.get("Cache-Control"));

  // Consume the body so it does not hang
  await response.json();
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Using the Request Object
// ═══════════════════════════════════════════════════════════════════════════════
header("10. Using the Request Object");

{
  const request = new Request(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Custom-Header": "my-value",
    },
    body: JSON.stringify({ title: "Via Request object", body: "Testing", userId: 1 }),
  });

  console.log("  Request method:", request.method);
  console.log("  Request URL:", request.url);
  console.log("  Request headers:");
  for (const [key, value] of request.headers) {
    console.log(`    ${key}: ${value}`);
  }

  const response = await fetch(request);
  const result = await response.json();
  console.log("\n  Response:", result);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("--- End of 01-fetch-basics.js ---\n");
