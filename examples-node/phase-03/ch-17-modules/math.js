/**
 * Chapter 17 — Module: math.js
 *
 * A module demonstrating named exports.
 * Every function and constant here is individually importable.
 */

export const PI = 3.141592653589793;
export const E = 2.718281828459045;

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

export function circleArea(radius) {
  return PI * radius ** 2;
}

/**
 * Calculates the factorial of a non-negative integer.
 */
export function factorial(n) {
  if (n < 0) throw new Error("Factorial is not defined for negative numbers");
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
