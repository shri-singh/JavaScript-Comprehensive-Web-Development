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
 */
export function showStep(step) {
  const totalSteps = 3;

  // Hide every step and remove the active class
  const steps = document.querySelectorAll('.form-step');
  steps.forEach((el) => {
    el.hidden = true;
    el.classList.remove('form-step--active');
  });

  // Show the target step
  const target = document.getElementById(`step-${step}`);
  if (target) {
    target.hidden = false;
    target.classList.add('form-step--active');
  }

  // Update navigation buttons
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');

  btnBack.hidden = step === 1;
  btnNext.hidden = step === totalSteps;
  btnSubmit.hidden = step !== totalSteps;

  // Move focus to the first input in the new step for accessibility
  if (target) {
    const firstInput = target.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }
}

/**
 * Update the progress bar to reflect the current step.
 *
 * @param {number} current — The current step number.
 * @param {number} total — The total number of steps.
 */
export function updateProgress(current, total) {
  // Update the fill width
  const fill = document.querySelector('.progress-bar__fill');
  const percentage = (current / total) * 100;
  fill.style.width = `${percentage}%`;

  // Update aria-valuenow on the progress bar container
  const progressBar = document.querySelector('.progress-bar');
  progressBar.setAttribute('aria-valuenow', String(current));

  // Update step dot classes
  const stepItems = document.querySelectorAll('.progress-bar__step');
  stepItems.forEach((item, index) => {
    const stepNumber = index + 1;

    // Reset classes
    item.classList.remove('progress-bar__step--active', 'progress-bar__step--completed');
    item.removeAttribute('aria-current');

    if (stepNumber < current) {
      item.classList.add('progress-bar__step--completed');
    } else if (stepNumber === current) {
      item.classList.add('progress-bar__step--active');
      item.setAttribute('aria-current', 'step');
    }
  });

  // Announce step change to screen readers via the live region
  const liveRegion = document.getElementById('live-region');
  liveRegion.textContent = `Step ${current} of ${total}`;
}

/**
 * Display an error message for a specific form field.
 *
 * @param {HTMLElement} field — The input/select/textarea element.
 * @param {string} message — The error message to display.
 */
export function showError(field, message) {
  field.setAttribute('aria-invalid', 'true');

  const errorEl = document.getElementById(`${field.id}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

/**
 * Clear the error message for a specific form field.
 *
 * @param {HTMLElement} field — The input/select/textarea element.
 */
export function clearError(field) {
  field.removeAttribute('aria-invalid');

  const errorEl = document.getElementById(`${field.id}-error`);
  if (errorEl) {
    errorEl.textContent = '';
  }
}

/**
 * Update the password strength meter UI.
 *
 * @param {{ score: number, label: string, level: string }} strength
 *   The strength object returned by getPasswordStrength().
 */
export function updatePasswordStrength(strength) {
  const fill = document.getElementById('password-strength-fill');
  const text = document.getElementById('password-strength-text');

  if (!fill || !text) return;

  if (strength.score === 0 && strength.label === '') {
    // Password is empty — clear the meter
    fill.removeAttribute('data-strength');
    text.textContent = '';
  } else {
    fill.setAttribute('data-strength', strength.level);
    text.textContent = strength.label;
  }
}
