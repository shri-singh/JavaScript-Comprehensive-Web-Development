/**
 * Chapter 19 — Example: math.test.js
 *
 * Run:  npx vitest run examples-node/phase-03/ch-19-testing/math.test.js
 *
 * This file demonstrates how to write unit tests with Vitest.
 * It covers: describe/it/expect, common matchers, testing errors,
 * edge cases, and the Arrange-Act-Assert pattern.
 *
 * Requires: npm install -D vitest
 */

import { describe, it, expect } from "vitest";
import { add, subtract, multiply, divide, average, clamp, factorial, isPrime } from "./math.js";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic Tests — add
// ═══════════════════════════════════════════════════════════════════════════════

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("adds negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("adds a positive and a negative number", () => {
    expect(add(10, -3)).toBe(7);
  });

  it("handles zero", () => {
    expect(add(0, 0)).toBe(0);
    expect(add(5, 0)).toBe(5);
    expect(add(0, 5)).toBe(5);
  });

  it("handles floating point numbers", () => {
    // Note: floating point precision — use toBeCloseTo for decimals
    expect(add(0.1, 0.2)).toBeCloseTo(0.3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. subtract and multiply
// ═══════════════════════════════════════════════════════════════════════════════

describe("subtract", () => {
  it("subtracts two numbers", () => {
    expect(subtract(10, 3)).toBe(7);
  });

  it("returns negative when second is larger", () => {
    expect(subtract(3, 10)).toBe(-7);
  });
});

describe("multiply", () => {
  it("multiplies two numbers", () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it("returns zero when multiplying by zero", () => {
    expect(multiply(100, 0)).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(multiply(-3, 4)).toBe(-12);
    expect(multiply(-3, -4)).toBe(12);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Testing Errors — divide
// ═══════════════════════════════════════════════════════════════════════════════

describe("divide", () => {
  it("divides two numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("returns a decimal result", () => {
    expect(divide(7, 2)).toBe(3.5);
  });

  it("throws when dividing by zero", () => {
    // IMPORTANT: wrap in a function so expect can catch the error
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });

  it("throws an Error instance when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow(Error);
  });

  it("does not throw for valid divisions", () => {
    expect(() => divide(10, 2)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Testing Arrays and Objects — average
// ═══════════════════════════════════════════════════════════════════════════════

describe("average", () => {
  it("calculates the average of an array of numbers", () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it("handles a single-element array", () => {
    expect(average([42])).toBe(42);
  });

  it("handles decimal results", () => {
    expect(average([1, 2])).toBe(1.5);
  });

  it("throws for an empty array", () => {
    expect(() => average([])).toThrow("Cannot calculate average of empty array");
  });

  it("throws for non-array input", () => {
    expect(() => average(null)).toThrow();
    expect(() => average(undefined)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Testing Boundary Values — clamp
// ═══════════════════════════════════════════════════════════════════════════════

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to minimum when below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to maximum when above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns min/max when value equals the boundary", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("throws when min is greater than max", () => {
    expect(() => clamp(5, 10, 0)).toThrow("min must be less than or equal to max");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Testing Multiple Cases — factorial
// ═══════════════════════════════════════════════════════════════════════════════

describe("factorial", () => {
  it("returns 1 for 0", () => {
    expect(factorial(0)).toBe(1);
  });

  it("returns 1 for 1", () => {
    expect(factorial(1)).toBe(1);
  });

  it("calculates factorial for small numbers", () => {
    expect(factorial(5)).toBe(120);
    expect(factorial(6)).toBe(720);
    expect(factorial(10)).toBe(3628800);
  });

  it("throws for negative numbers", () => {
    expect(() => factorial(-1)).toThrow("Factorial is not defined for negative numbers");
  });

  it("throws for non-integers", () => {
    expect(() => factorial(3.5)).toThrow("Factorial requires an integer");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Boolean Results — isPrime
// ═══════════════════════════════════════════════════════════════════════════════

describe("isPrime", () => {
  it("returns false for numbers less than 2", () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it("returns true for 2", () => {
    expect(isPrime(2)).toBe(true);
  });

  it("returns true for prime numbers", () => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
    for (const p of primes) {
      expect(isPrime(p)).toBe(true);
    }
  });

  it("returns false for composite numbers", () => {
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20];
    for (const c of composites) {
      expect(isPrime(c)).toBe(false);
    }
  });

  it("handles larger primes", () => {
    expect(isPrime(97)).toBe(true);
    expect(isPrime(101)).toBe(true);
  });
});
