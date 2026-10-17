/**
 * validation.js — Pure validation logic (no DOM access)
 *
 * This module contains all the rules for validating individual fields
 * and entire form steps. It should NOT touch the DOM — only receive
 * values and return validation results.
 */

/**
 * Validate a single form field.
 *
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} field
 *   The form field element to validate. Use field.name, field.value,
 *   field.type, field.required, etc. to determine which rules to apply.
 * @returns {string} An error message string, or '' if the field is valid.
 *
 * TODO: Implement validation rules for each field:
 *
 *  - firstName (required): Must not be empty
 *  - lastName  (required): Must not be empty
 *  - email     (required): Must not be empty; must match a basic email pattern
 *  - username  (required): Must not be empty; 3-20 characters; alphanumeric + underscores only
 *  - password  (required): Must not be empty; minimum 8 characters;
 *                          should encourage complexity (uppercase, lowercase, digit, symbol)
 *  - confirmPassword (required): Must not be empty; must match the password field's value
 *  - terms     (required): Must be checked
 *
 * Hint: For confirmPassword, you'll need access to the password value.
 * You can get it from the DOM (document.getElementById('password').value)
 * or pass it in as context. The DOM approach is simpler here since this is
 * a small project.
 */
export function validateField(field) {
  // TODO: Implement this function
  return '';
}

/**
 * Validate all required fields within a given step.
 *
 * @param {number} step — The step number (1, 2, or 3).
 * @returns {Array<{field: HTMLElement, message: string}>}
 *   An array of error objects. Empty array means the step is valid.
 *
 * TODO: Implement this function:
 * 1. Determine which fieldset corresponds to the step (e.g., #step-1)
 * 2. Query all required inputs/selects/textareas within that fieldset
 * 3. Run validateField() on each one
 * 4. Collect any errors into the return array
 *
 * Hint: document.querySelectorAll(`#step-${step} [required]`)
 */
export function validateStep(step) {
  // TODO: Implement this function
  return [];
}

/**
 * Get the error-message element associated with a field.
 *
 * @param {HTMLElement} field
 * @returns {HTMLElement|null} The error span element, or null.
 *
 * TODO: Implement this function.
 * Convention: the error element's id is `${field.id}-error`.
 *
 * Example: for <input id="email">, the error span is #email-error.
 */
export function getFieldError(field) {
  // TODO: Implement this function
  return null;
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
 * TODO: Implement strength scoring:
 *   +1 point for length >= 8
 *   +1 point for containing a lowercase AND an uppercase letter
 *   +1 point for containing at least one digit
 *   +1 point for containing at least one special character (!@#$%^&* etc.)
 *
 *   0-1 → Weak, 2 → Fair, 3 → Strong, 4 → Very Strong
 */
export function getPasswordStrength(password) {
  // TODO: Implement this function
  return { score: 0, label: '', level: '' };
}
