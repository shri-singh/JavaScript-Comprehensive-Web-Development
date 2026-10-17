// ──────────────────────────────────────────────
// Chapter 12 — HTML Forms: Interactive Demo
// ──────────────────────────────────────────────

// ── Logging Utility ──────────────────────────
const logPanel = document.querySelector("#log");

function log(label, message) {
  const entry = document.createElement("div");
  entry.classList.add("log-entry");

  const labelSpan = document.createElement("span");
  labelSpan.classList.add("log-label");
  labelSpan.textContent = `[${label}]`;

  entry.append(labelSpan, ` ${message}`);
  logPanel.prepend(entry);
}

// ── DOM References ───────────────────────────
const form = document.querySelector("#registration-form");
const submitBtn = document.querySelector("#submit-btn");
const errorSummary = document.querySelector("#error-summary");
const errorSummaryList = document.querySelector("#error-summary-list");
const successBanner = document.querySelector("#success-banner");
const formDataInspector = document.querySelector("#formdata-inspector");
const validityPanel = document.querySelector("#validity-panel");
const bioTextarea = document.querySelector("#bio");
const bioCount = document.querySelector("#bio-count");
const password = document.querySelector("#password");
const confirmPassword = document.querySelector("#confirm-password");

// ── Validation Error Messages ────────────────

const errorMessages = {
  valueMissing: "This field is required.",
  typeMismatch: "Please enter a valid value for this field.",
  tooShort: (el) => `Must be at least ${el.minLength} characters (currently ${el.value.length}).`,
  tooLong: (el) => `Must be no more than ${el.maxLength} characters.`,
  rangeUnderflow: (el) => `Must be at least ${el.min}.`,
  rangeOverflow: (el) => `Must be no more than ${el.max}.`,
  patternMismatch: "Please match the required format.",
  customError: (el) => el.validationMessage,
};

function getErrorMessage(input) {
  const v = input.validity;

  if (v.valueMissing) return errorMessages.valueMissing;
  if (v.typeMismatch) {
    if (input.type === "email") return "Please enter a valid email address.";
    if (input.type === "url") return "Please enter a valid URL (e.g., https://example.com).";
    return errorMessages.typeMismatch;
  }
  if (v.tooShort) return errorMessages.tooShort(input);
  if (v.tooLong) return errorMessages.tooLong(input);
  if (v.rangeUnderflow) return errorMessages.rangeUnderflow(input);
  if (v.rangeOverflow) return errorMessages.rangeOverflow(input);
  if (v.patternMismatch) {
    if (input.name === "username") return "Only letters, numbers, and underscores are allowed.";
    return errorMessages.patternMismatch;
  }
  if (v.customError) return errorMessages.customError(input);

  return "Invalid value.";
}

// ── Show/Clear Individual Field Errors ───────

function showFieldError(input) {
  const errorEl = document.querySelector(`#${input.id}-error`);
  const message = getErrorMessage(input);

  if (errorEl) {
    errorEl.textContent = message;
  }

  input.classList.add("invalid");
  input.classList.remove("valid");
  input.setAttribute("aria-invalid", "true");
  log("Validate", `${input.name}: ${message}`);
}

function clearFieldError(input) {
  const errorEl = document.querySelector(`#${input.id}-error`);
  if (errorEl) {
    errorEl.textContent = "";
  }

  input.classList.remove("invalid");
  input.removeAttribute("aria-invalid");
}

function markFieldValid(input) {
  clearFieldError(input);
  if (input.value.trim() !== "") {
    input.classList.add("valid");
  } else {
    input.classList.remove("valid");
  }
}

// ── Real-Time Validation on blur ─────────────

const validatableInputs = form.querySelectorAll("input, select, textarea");

for (const input of validatableInputs) {
  // Validate on blur
  input.addEventListener("blur", () => {
    if (input.value === "" && !input.required) {
      clearFieldError(input);
      input.classList.remove("valid");
      return;
    }
    if (!input.checkValidity()) {
      showFieldError(input);
    } else {
      markFieldValid(input);
    }
  });

  // Clear error on input (give instant feedback when fixing)
  input.addEventListener("input", () => {
    if (input.classList.contains("invalid")) {
      if (input.checkValidity()) {
        markFieldValid(input);
      }
    }
    updateFormDataInspector();
    updateValidityPanel();
  });
}

// ── Password Match Validation ────────────────

confirmPassword.addEventListener("input", () => {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPassword.setCustomValidity("Passwords do not match.");
  } else {
    confirmPassword.setCustomValidity("");
  }
});

password.addEventListener("input", () => {
  // Re-check confirm when password changes
  if (confirmPassword.value) {
    if (confirmPassword.value !== password.value) {
      confirmPassword.setCustomValidity("Passwords do not match.");
    } else {
      confirmPassword.setCustomValidity("");
    }
  }
});

// ── Bio Character Counter ────────────────────

bioTextarea.addEventListener("input", () => {
  bioCount.textContent = bioTextarea.value.length;
});

// ── FormData Inspector (real-time) ───────────

function updateFormDataInspector() {
  const data = new FormData(form);
  const entries = [];

  for (const [key, value] of data) {
    entries.push(`  "${key}": "${value}"`);
  }

  if (entries.length === 0) {
    formDataInspector.textContent = "{ empty form }";
  } else {
    formDataInspector.textContent = `{\n${entries.join(",\n")}\n}`;
  }
}

// ── Validity Panel (real-time) ───────────────

function updateValidityPanel() {
  const fields = form.querySelectorAll("input[name], select[name], textarea[name]");
  let html = "";

  for (const field of fields) {
    // Skip hidden fields and radio/checkbox duplicates
    if (field.type === "hidden") continue;
    if ((field.type === "radio" || field.type === "checkbox") && field !== form.querySelector(`[name="${field.name}"]`)) continue;

    const valid = field.validity.valid;
    const icon = valid ? "OK" : "XX";
    const color = valid ? "#27ae60" : "#e94560";
    const name = field.name.padEnd(18);
    html += `<div style="color:${color}">[${icon}] ${name} ${valid ? "valid" : getShortValidity(field)}</div>`;
  }

  validityPanel.innerHTML = html;
}

function getShortValidity(input) {
  const v = input.validity;
  if (v.valueMissing) return "missing";
  if (v.typeMismatch) return "type mismatch";
  if (v.tooShort) return "too short";
  if (v.tooLong) return "too long";
  if (v.rangeUnderflow) return "too low";
  if (v.rangeOverflow) return "too high";
  if (v.patternMismatch) return "pattern mismatch";
  if (v.customError) return "custom error";
  return "invalid";
}

// ── Error Summary ────────────────────────────

function showErrorSummary(invalidFields) {
  errorSummaryList.replaceChildren();

  for (const field of invalidFields) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${field.id}`;
    link.textContent = `${getLabelText(field)}: ${getErrorMessage(field)}`;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      field.focus();
    });
    li.append(link);
    errorSummaryList.append(li);
  }

  errorSummary.classList.add("visible");
  successBanner.classList.remove("visible");
  errorSummary.focus();
  log("Submit", `Form has ${invalidFields.length} validation error(s)`);
}

function hideErrorSummary() {
  errorSummary.classList.remove("visible");
  errorSummaryList.replaceChildren();
}

function getLabelText(input) {
  const label = form.querySelector(`label[for="${input.id}"]`);
  if (label) return label.textContent.replace(/\s*\*\s*$/, "").trim();
  return input.name;
}

// ── Form Submission ──────────────────────────

form.addEventListener("submit", (event) => {
  event.preventDefault();
  log("Submit", "Form submit event fired — preventDefault called");

  // Clear previous state
  hideErrorSummary();
  successBanner.classList.remove("visible");

  // Collect invalid fields
  const invalidFields = [];
  const fields = form.querySelectorAll("input, select, textarea");

  for (const field of fields) {
    if (!field.checkValidity()) {
      showFieldError(field);
      invalidFields.push(field);
    } else {
      markFieldValid(field);
    }
  }

  if (invalidFields.length > 0) {
    showErrorSummary(invalidFields);
    return;
  }

  // Success — read FormData
  const data = new FormData(form);
  const obj = Object.fromEntries(data);

  // Handle multi-value fields (checkboxes)
  obj.interests = data.getAll("interests");

  log("Submit", "Validation passed! FormData collected:");
  log("FormData", JSON.stringify(obj, null, 2));

  // Simulate async submit
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
    successBanner.classList.add("visible");
    log("Submit", "Registration complete (simulated)");
  }, 1500);
});

// ── Form Reset ───────────────────────────────

form.addEventListener("reset", () => {
  // Wait a tick so the reset actually clears the fields
  setTimeout(() => {
    hideErrorSummary();
    successBanner.classList.remove("visible");

    for (const input of validatableInputs) {
      input.classList.remove("valid", "invalid");
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
    }

    // Clear all error messages
    for (const el of form.querySelectorAll(".error-message")) {
      el.textContent = "";
    }

    bioCount.textContent = "0";
    updateFormDataInspector();
    updateValidityPanel();
    log("Reset", "Form has been reset");
  }, 0);
});

// ── Change Events on Select & Checkboxes ─────

form.addEventListener("change", () => {
  updateFormDataInspector();
  updateValidityPanel();
});

// ── Initial State ────────────────────────────
updateFormDataInspector();
updateValidityPanel();
log("Ready", "Forms demo loaded. Fill in the form and submit to see validation in action.");
