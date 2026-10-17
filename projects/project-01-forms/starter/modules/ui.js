/**
 * ui.js — DOM manipulation for step navigation, progress, and error display
 *
 * This module handles all visual updates: showing/hiding form steps,
 * updating the progress bar, displaying validation errors with proper
 * ARIA attributes, and updating the password strength meter.
 */

/**
 * Show the specified form step and hide all others.
 *
 * @param {number} step — The step number to show (1, 2, or 3).
 *
 * TODO: Implement this function:
 * 1. Select all elements with class 'form-step'
 * 2. Add the `hidden` attribute to every step
 * 3. Remove `hidden` from the target step (#step-{step})
 * 4. Also add/remove the 'form-step--active' class for CSS animation
 * 5. Update the navigation buttons:
 *    - Hide the Back button on step 1
 *    - Hide the Next button on the last step
 *    - Show the Submit button only on the last step
 * 6. Move focus to the step's legend or first input for accessibility
 *
 * Hint for button references:
 *   const btnBack = document.getElementById('btn-back');
 *   const btnNext = document.getElementById('btn-next');
 *   const btnSubmit = document.getElementById('btn-submit');
 */
export function showStep(step) {
  // TODO: Implement this function
}

/**
 * Update the progress bar to reflect the current step.
 *
 * @param {number} current — The current step number.
 * @param {number} total — The total number of steps.
 *
 * TODO: Implement this function:
 * 1. Calculate the fill percentage: (current / total) * 100
 * 2. Update the width of '.progress-bar__fill'
 * 3. Update the aria-valuenow attribute on '.progress-bar'
 * 4. Update step indicators:
 *    - Steps before `current` get class 'progress-bar__step--completed'
 *    - The current step gets class 'progress-bar__step--active' and aria-current="step"
 *    - Steps after `current` have no active/completed class
 * 5. Announce the step change to screen readers via the live region
 *
 * Hint: document.getElementById('live-region').textContent = `Step ${current} of ${total}`;
 */
export function updateProgress(current, total) {
  // TODO: Implement this function
}

/**
 * Display an error message for a specific form field.
 *
 * @param {HTMLElement} field — The input/select/textarea element.
 * @param {string} message — The error message to display.
 *
 * TODO: Implement this function:
 * 1. Set aria-invalid="true" on the field
 * 2. Find the associated error element (convention: id="${field.id}-error")
 * 3. Set the error element's textContent to the message
 * 4. Optionally add a CSS class to the parent .form-field for styling
 */
export function showError(field, message) {
  // TODO: Implement this function
}

/**
 * Clear the error message for a specific form field.
 *
 * @param {HTMLElement} field — The input/select/textarea element.
 *
 * TODO: Implement this function:
 * 1. Remove aria-invalid from the field (or set to "false")
 * 2. Clear the associated error element's textContent
 * 3. Remove any error CSS class from the parent .form-field
 */
export function clearError(field) {
  // TODO: Implement this function
}

/**
 * Update the password strength meter UI.
 *
 * @param {{ score: number, label: string, level: string }} strength
 *   The strength object returned by getPasswordStrength().
 *
 * TODO: Implement this function:
 * 1. Get the strength fill element (#password-strength-fill)
 * 2. Get the strength text element (#password-strength-text)
 * 3. Set data-strength attribute on the fill element to strength.level
 *    (this drives the CSS width and colour)
 * 4. Set the text content to strength.label
 * 5. If the password is empty, clear both the attribute and text
 */
export function updatePasswordStrength(strength) {
  // TODO: Implement this function
}
