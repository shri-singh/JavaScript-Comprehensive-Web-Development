/**
 * main.js — Entry point for the Multi-Step Registration Form
 *
 * This file wires together the validation, persistence, and UI modules.
 */

import { validateField, validateStep, getPasswordStrength } from './modules/validation.js';
import { saveDraft, loadDraft, clearDraft } from './modules/persistence.js';
import {
  showStep,
  updateProgress,
  showError,
  clearError,
  updatePasswordStrength,
} from './modules/ui.js';

// ── DOM References ──
const form = document.getElementById('registration-form');
const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const btnSubmit = document.getElementById('btn-submit');
const successMessage = document.getElementById('success-message');
const bioTextarea = document.getElementById('bio');
const bioCount = document.getElementById('bio-count');
const passwordInput = document.getElementById('password');

// ── State ──
let currentStep = 1;
const totalSteps = 3;

// ── Initialisation ──

/**
 * Initialise the form: restore draft data, set up listeners, show step 1.
 */
function init() {
  // Restore any saved draft data from localStorage
  const draft = loadDraft();

  if (draft) {
    // Populate form fields with saved values
    Object.keys(draft).forEach((key) => {
      const value = draft[key];

      // Handle checkbox arrays (e.g., notifications)
      if (Array.isArray(value)) {
        const checkboxes = form.querySelectorAll(`input[name="${key}"]`);
        checkboxes.forEach((cb) => {
          cb.checked = value.includes(cb.value);
        });
        return;
      }

      // Handle single checkboxes (e.g., terms)
      const field = form.elements[key];
      if (!field) return;

      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });

    // Update bio character count if bio was restored
    if (draft.bio) {
      bioCount.textContent = `${draft.bio.length} / ${bioTextarea.maxLength}`;
    }
  }

  // Set up event listeners
  setupEventListeners();

  // Show step 1
  showStep(currentStep);
  updateProgress(currentStep, totalSteps);
}

// ── Event Listeners ──

function setupEventListeners() {
  // Navigation buttons
  btnNext.addEventListener('click', handleNext);
  btnBack.addEventListener('click', handleBack);
  form.addEventListener('submit', handleSubmit);

  // Blur validation on all required inputs
  const requiredFields = form.querySelectorAll('input[required], select[required]');
  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => {
      const errorMessage = validateField(field);
      if (errorMessage) {
        showError(field, errorMessage);
      } else {
        clearError(field);
      }
    });
  });

  // Password strength meter — update on every keystroke
  passwordInput.addEventListener('input', () => {
    const strength = getPasswordStrength(passwordInput.value);
    updatePasswordStrength(strength);
  });

  // Auto-save draft on any form input change (event delegation)
  form.addEventListener('input', () => {
    const data = gatherFormData();
    saveDraft(data);
  });

  // Bio character count
  bioTextarea.addEventListener('input', () => {
    const current = bioTextarea.value.length;
    const max = bioTextarea.maxLength;
    bioCount.textContent = `${current} / ${max}`;
  });
}

// ── Navigation Handlers ──

function handleNext() {
  // Validate the current step
  const errors = validateStep(currentStep);

  if (errors.length > 0) {
    // Show errors and focus the first invalid field
    errors.forEach(({ field, message }) => showError(field, message));
    errors[0].field.focus();
    return;
  }

  // Clear errors for all fields in the current step before advancing
  const fields = document.querySelectorAll(`#step-${currentStep} [required]`);
  fields.forEach((field) => clearError(field));

  // Advance to the next step
  currentStep += 1;
  showStep(currentStep);
  updateProgress(currentStep, totalSteps);
}

function handleBack() {
  if (currentStep <= 1) return;

  currentStep -= 1;
  showStep(currentStep);
  updateProgress(currentStep, totalSteps);
}

// ── Form Submission ──

function handleSubmit(e) {
  e.preventDefault();

  // Validate the final step
  const errors = validateStep(currentStep);
  if (errors.length > 0) {
    errors.forEach(({ field, message }) => showError(field, message));
    errors[0].field.focus();
    return;
  }

  // Gather all form data
  const formData = gatherFormData();

  // Clear the saved draft
  clearDraft();

  // Hide the form and progress bar, show the success message
  form.hidden = true;
  document.querySelector('.progress-bar').hidden = true;
  successMessage.hidden = false;

  // Log the submitted data
  console.log('Form submitted:', formData);
}

// ── Helpers ──

/**
 * Gather all form data into a plain object.
 * Handles checkboxes (notifications) as arrays.
 *
 * @returns {Object} An object with all form field values.
 */
function gatherFormData() {
  const data = {};

  // Text inputs, email, password, select, textarea
  data.firstName = form.elements.firstName.value;
  data.lastName = form.elements.lastName.value;
  data.email = form.elements.email.value;
  data.username = form.elements.username.value;
  data.password = form.elements.password.value;
  data.confirmPassword = form.elements.confirmPassword.value;
  data.theme = form.elements.theme.value;
  data.bio = form.elements.bio.value;
  data.terms = form.elements.terms.checked;

  // Checkbox group — collect checked values as an array
  const notificationCheckboxes = form.querySelectorAll('input[name="notifications"]');
  data.notifications = [];
  notificationCheckboxes.forEach((cb) => {
    if (cb.checked) {
      data.notifications.push(cb.value);
    }
  });

  return data;
}

// ── Start ──
document.addEventListener('DOMContentLoaded', init);
