/**
 * validation.js — Pure validation logic (no DOM access except where noted)
 *
 * This module contains all the rules for validating individual fields
 * and entire form steps. Field elements are passed in so the module can
 * inspect .name, .value, .type, .required, and .checked.
 */

/**
 * Validate a single form field.
 *
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
 *   The form field element to validate.
 * @returns {string} An error message string, or '' if the field is valid.
 */
export function validateField(field) {
  const value = field.value.trim();
  const name = field.name;

  // ── Required-field check (covers text inputs and checkboxes) ──
  if (field.required) {
    if (field.type === 'checkbox' && !field.checked) {
      return 'You must accept the Terms of Service.';
    }
    if (field.type !== 'checkbox' && value === '') {
      return 'This field is required.';
    }
  }

  // ── Field-specific rules ──
  switch (name) {
    case 'email': {
      const emailPattern = /^\S+@\S+\.\S+$/;
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address.';
      }
      break;
    }

    case 'username': {
      if (value.length < 3 || value.length > 20) {
        return 'Username must be between 3 and 20 characters.';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return 'Username can only contain letters, numbers, and underscores.';
      }
      break;
    }

    case 'password': {
      if (value.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      break;
    }

    case 'confirmPassword': {
      const password = document.getElementById('password').value;
      if (value !== password) {
        return 'Passwords do not match.';
      }
      break;
    }

    // terms checkbox is already handled by the required-check above
    default:
      break;
  }

  return '';
}

/**
 * Validate all required fields within a given step.
 *
 * @param {number} step — The step number (1, 2, or 3).
 * @returns {Array<{field: HTMLElement, message: string}>}
 *   An array of error objects. Empty array means the step is valid.
 */
export function validateStep(step) {
  const fields = document.querySelectorAll(`#step-${step} [required]`);
  const errors = [];

  fields.forEach((field) => {
    const message = validateField(field);
    if (message) {
      errors.push({ field, message });
    }
  });

  return errors;
}

/**
 * Get the error-message element associated with a field.
 *
 * @param {HTMLElement} field
 * @returns {HTMLElement|null} The error span element, or null.
 */
export function getFieldError(field) {
  return document.getElementById(`${field.id}-error`);
}

/**
 * Calculate password strength.
 *
 * @param {string} password — The current password value.
 * @returns {{ score: number, label: string, level: string }}
 *   - score: 0-4 numeric strength score
 *   - label: human-readable label ('Weak', 'Fair', 'Strong', 'Very Strong')
 *   - level: CSS-friendly key ('weak', 'fair', 'strong', 'very-strong')
 *
 * Scoring:
 *   +1 for length >= 8
 *   +1 for containing both lowercase AND uppercase letters
 *   +1 for containing at least one digit
 *   +1 for containing at least one special character
 */
export function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const levels = [
    { label: 'Weak', level: 'weak' },       // 0
    { label: 'Weak', level: 'weak' },       // 1
    { label: 'Fair', level: 'fair' },       // 2
    { label: 'Strong', level: 'strong' },   // 3
    { label: 'Very Strong', level: 'very-strong' }, // 4
  ];

  const { label, level } = levels[score];

  return { score, label, level };
}
