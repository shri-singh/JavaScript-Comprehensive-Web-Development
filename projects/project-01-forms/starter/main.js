/**
 * main.js — Entry point for the Multi-Step Registration Form
 *
 * This file wires together the validation, persistence, and UI modules.
 * Follow the TODO comments to complete the implementation.
 */

// TODO: Import the functions you need from each module:
// - From './modules/validation.js': validateField, validateStep
// - From './modules/persistence.js': saveDraft, loadDraft, clearDraft
// - From './modules/ui.js': showStep, updateProgress, showError, clearError, updatePasswordStrength

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
 * TODO: Implement the init() function. It should:
 * 1. Restore any saved draft data from localStorage using loadDraft()
 * 2. If draft data exists, populate the form fields with the saved values
 * 3. Set up all event listeners (see below)
 * 4. Show the correct initial step
 */
function init() {
  // TODO: Load saved draft
  // const draft = loadDraft();

  // TODO: If draft data exists, populate form fields
  // Hint: loop over each key in the draft object and set the
  // corresponding input's value. Handle checkboxes separately.

  // Set up event listeners
  setupEventListeners();

  // Show step 1
  // TODO: Call showStep(currentStep)
  // TODO: Call updateProgress(currentStep, totalSteps)
}

// ── Event Listeners ──

function setupEventListeners() {
  // TODO: Add click handler for the Next button
  // - Call handleNext()
  btnNext.addEventListener('click', handleNext);

  // TODO: Add click handler for the Back button
  // - Call handleBack()
  btnBack.addEventListener('click', handleBack);

  // TODO: Add submit handler for the form
  // - Call handleSubmit(e)
  form.addEventListener('submit', handleSubmit);

  // TODO: Add blur validation to all required inputs
  // Hint: querySelectorAll('#registration-form input[required], #registration-form select[required]')
  // For each input, add a 'blur' event listener that:
  //   1. Calls validateField(input) to get an error message (or empty string)
  //   2. If there's an error, calls showError(input, errorMessage)
  //   3. If no error, calls clearError(input)

  // TODO: Add 'input' event listener to the password field
  // - On each keystroke, call updatePasswordStrength(passwordInput.value)

  // TODO: Add 'input' event listener to all form inputs to save drafts
  // Hint: use event delegation on the form, or add listeners to each input
  // On every input change, gather all form data and call saveDraft(formData)

  // TODO: Add 'input' event listener to the bio textarea to update character count
  // - Update bioCount.textContent with the current length vs maxlength
}

// ── Navigation Handlers ──

function handleNext() {
  // TODO: Validate the current step using validateStep(currentStep)
  // - validateStep returns an array of { field, message } objects
  // - If there are errors, show them using showError() and return early
  // - If no errors, advance to the next step

  // TODO: Increment currentStep
  // TODO: Call showStep(currentStep)
  // TODO: Call updateProgress(currentStep, totalSteps)
}

function handleBack() {
  // TODO: Decrement currentStep (minimum 1)
  // TODO: Call showStep(currentStep)
  // TODO: Call updateProgress(currentStep, totalSteps)
}

// ── Form Submission ──

function handleSubmit(e) {
  e.preventDefault();

  // TODO: Validate the final step
  // - If there are errors, show them and return

  // TODO: Gather all form data (you can use FormData or read fields manually)

  // TODO: Clear the saved draft using clearDraft()

  // TODO: Hide the form and show the success message
  // form.hidden = true;
  // document.querySelector('.progress-bar').hidden = true;
  // successMessage.hidden = false;

  // TODO: Log or process the form data
  // console.log('Form submitted:', formData);
}

// ── Helpers ──

/**
 * TODO: Implement a helper function to gather all form data into a plain object.
 * This object will be passed to saveDraft() and used on submission.
 *
 * Hint: You can use `new FormData(form)` and convert it, or manually read
 * each input's value. Remember to handle checkboxes (notifications) as arrays.
 */
function gatherFormData() {
  // TODO: Return an object with all form field values
  return {};
}

// ── Start ──
document.addEventListener('DOMContentLoaded', init);
