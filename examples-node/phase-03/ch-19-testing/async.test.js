/**
 * Chapter 19 — Example: async.test.js
 *
 * Run:  npx vitest run examples-node/phase-03/ch-19-testing/async.test.js
 *
 * Demonstrates testing async functions with Vitest:
 * - async/await in test cases
 * - Testing resolved and rejected promises
 * - Mocking async functions with vi.fn()
 * - Fake timers for testing delays
 *
 * Requires: npm install -D vitest
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions to Test
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulates fetching a user by ID.
 * In a real app, this would call a real API.
 */
async function fetchUser(id, fetcher = globalThis.fetch) {
  const response = await fetcher(`https://api.example.com/users/${id}`);

  if (!response.ok) {
    throw new Error(`User not found: ${id}`);
  }

  return response.json();
}

/**
 * Returns a promise that resolves after `ms` milliseconds.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function up to `maxRetries` times with a delay between attempts.
 */
async function retry(fn, maxRetries = 3, delayMs = 100) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Fetches multiple URLs in parallel and returns results.
 */
async function fetchAll(urls, fetcher = globalThis.fetch) {
  const responses = await Promise.all(
    urls.map(async (url) => {
      const response = await fetcher(url);
      return response.json();
    }),
  );
  return responses;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic Async Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe("fetchUser", () => {
  it("returns user data for a valid ID", async () => {
    // Arrange — create a mock fetcher
    const mockUser = { id: 1, name: "Alice", email: "alice@example.com" };
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    // Act
    const user = await fetchUser(1, mockFetcher);

    // Assert
    expect(user).toEqual(mockUser);
    expect(mockFetcher).toHaveBeenCalledWith("https://api.example.com/users/1");
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it("throws for a non-existent user", async () => {
    // Arrange
    const mockFetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    // Act & Assert
    await expect(fetchUser(999, mockFetcher)).rejects.toThrow("User not found: 999");
  });

  it("throws when the network fails", async () => {
    // Arrange — simulate a network error
    const mockFetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    // Act & Assert
    await expect(fetchUser(1, mockFetcher)).rejects.toThrow("Failed to fetch");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Testing with resolves/rejects Helpers
// ═══════════════════════════════════════════════════════════════════════════════

describe("Promise resolves/rejects helpers", () => {
  it("verifies a promise resolves to a value", async () => {
    const promise = Promise.resolve(42);
    await expect(promise).resolves.toBe(42);
  });

  it("verifies a promise rejects with an error", async () => {
    const promise = Promise.reject(new Error("boom"));
    await expect(promise).rejects.toThrow("boom");
  });

  it("chains matchers with resolves", async () => {
    const promise = Promise.resolve({ name: "Alice", age: 30 });
    await expect(promise).resolves.toEqual({ name: "Alice", age: 30 });
    await expect(promise).resolves.toHaveProperty("name", "Alice");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Testing with Fake Timers
// ═══════════════════════════════════════════════════════════════════════════════

describe("delay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after the specified time", async () => {
    let resolved = false;
    const promise = delay(1000).then(() => {
      resolved = true;
    });

    // Not resolved yet
    expect(resolved).toBe(false);

    // Advance time by 1000ms
    await vi.advanceTimersByTimeAsync(1000);

    // Now it should be resolved
    await promise;
    expect(resolved).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Testing Retry Logic
// ═══════════════════════════════════════════════════════════════════════════════

describe("retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const resultPromise = retry(fn, 3, 100);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds on second attempt", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockResolvedValue("success");

    const resultPromise = retry(fn, 3, 100);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("persistent failure"));

    const resultPromise = retry(fn, 3, 100);
    await vi.runAllTimersAsync();

    await expect(resultPromise).rejects.toThrow("persistent failure");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Testing Parallel Async Operations
// ═══════════════════════════════════════════════════════════════════════════════

describe("fetchAll", () => {
  it("fetches multiple URLs in parallel", async () => {
    // Arrange
    const mockFetcher = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 1 }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 2 }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ id: 3 }) });

    // Act
    const results = await fetchAll(
      ["https://api.example.com/a", "https://api.example.com/b", "https://api.example.com/c"],
      mockFetcher,
    );

    // Assert
    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(results).toHaveLength(3);
    expect(mockFetcher).toHaveBeenCalledTimes(3);
  });

  it("returns an empty array for no URLs", async () => {
    const mockFetcher = vi.fn();
    const results = await fetchAll([], mockFetcher);

    expect(results).toEqual([]);
    expect(mockFetcher).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Mock Function Assertions
// ═══════════════════════════════════════════════════════════════════════════════

describe("vi.fn() — Mock Function Capabilities", () => {
  it("tracks call count and arguments", () => {
    const mockFn = vi.fn();

    mockFn("a", 1);
    mockFn("b", 2);
    mockFn("c", 3);

    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(mockFn).toHaveBeenCalledWith("a", 1);
    expect(mockFn).toHaveBeenLastCalledWith("c", 3);

    // Access the calls directly
    expect(mockFn.mock.calls).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  it("can mock return values", () => {
    const mockFn = vi.fn()
      .mockReturnValueOnce("first")
      .mockReturnValueOnce("second")
      .mockReturnValue("default");

    expect(mockFn()).toBe("first");
    expect(mockFn()).toBe("second");
    expect(mockFn()).toBe("default");
    expect(mockFn()).toBe("default");
  });

  it("can mock async return values", async () => {
    const mockFn = vi.fn()
      .mockResolvedValueOnce("async result 1")
      .mockResolvedValueOnce("async result 2");

    const result1 = await mockFn();
    const result2 = await mockFn();

    expect(result1).toBe("async result 1");
    expect(result2).toBe("async result 2");
  });

  it("can use a custom implementation", () => {
    const mockFn = vi.fn((a, b) => a + b);

    expect(mockFn(2, 3)).toBe(5);
    expect(mockFn(10, 20)).toBe(30);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
