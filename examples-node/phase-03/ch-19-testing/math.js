/**
 * Chapter 19 — Module to Test: math.js
 *
 * A simple math utility module used as the subject for unit tests
 * in math.test.js. Each function is straightforward, making it
 * ideal for learning test-writing fundamentals.
 */

/**
 * Adds two numbers.
 */
export function add(a, b) {
  return a + b;
}

/**
 * Subtracts b from a.
 */
export function subtract(a, b) {
  return a - b;
}

/**
 * Multiplies two numbers.
 */
export function multiply(a, b) {
  return a * b;
}

/**
 * Divides a by b.
 * @throws {Error} If b is zero.
 */
export function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

/**
 * Returns the average of an array of numbers.
 * @throws {Error} If the array is empty.
 */
export function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("Cannot calculate average of empty array");
  }
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return sum / numbers.length;
}

/**
 * Clamps a value between a minimum and maximum.
 */
export function clamp(value, min, max) {
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns the factorial of a non-negative integer.
 * @throws {Error} If n is negative.
 */
export function factorial(n) {
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  }
  if (!Number.isInteger(n)) {
    throw new Error("Factorial requires an integer");
  }
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Checks if a number is prime.
 */
export function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;

  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
