# Chapter 12 — HTML Forms

## Learning Objectives

By the end of this chapter you will be able to:

- Identify the most common form elements and their purposes (`input`, `textarea`, `select`, `checkbox`, `radio`).
- Access form data programmatically using the `FormData` API.
- Implement client-side validation using built-in HTML attributes (`required`, `pattern`, `minlength`, `maxlength`, `min`, `max`).
- Use the Constraint Validation API (`checkValidity`, `setCustomValidity`, `reportValidity`, `validity` states).
- Build accessible forms with proper `<label>` associations, `aria-describedby`, and `aria-live` regions for error messages.
- Prevent default form submission and handle data with JavaScript.
- Manage form state: track dirty fields, handle loading/submitting states, and reset forms.

---

## 12.1 Form Elements Overview

### Text Inputs

```html
<label for="username">Username</label>
<input type="text" id="username" name="username" required minlength="3" maxlength="20">

<label for="email">Email</label>
<input type="email" id="email" name="email" required>

<label for="password">Password</label>
<input type="password" id="password" name="password" required minlength="8">
```

### Other Input Types

| Type | Purpose | Key Attributes |
|---|---|---|
| `number` | Numeric input with spinners | `min`, `max`, `step` |
| `tel` | Phone number (no built-in validation) | `pattern` |
| `url` | URL with protocol validation | — |
| `date` | Date picker | `min`, `max` |
| `range` | Slider control | `min`, `max`, `step` |
| `color` | Color picker | — |
| `file` | File upload | `accept`, `multiple` |
| `hidden` | Invisible data field | — |

### Multi-Line Text

```html
<label for="bio">Bio</label>
<textarea id="bio" name="bio" rows="4" maxlength="500"></textarea>
```

### Select Menus

```html
<label for="role">Role</label>
<select id="role" name="role">
  <option value="">Choose a role...</option>
  <option value="admin">Admin</option>
  <option value="editor">Editor</option>
  <option value="viewer">Viewer</option>
</select>
```

### Checkboxes and Radio Buttons

```html
<!-- Checkbox -->
<label>
  <input type="checkbox" name="agree" value="yes" required>
  I agree to the terms
</label>

<!-- Radio group -->
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> Phone</label>
</fieldset>
```

---

## 12.2 Accessing Form Data

### The FormData API

`FormData` collects all named form controls into a key-value structure:

```js
const form = document.querySelector("#registration-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);

  // Individual values
  const username = data.get("username");
  const email = data.get("email");

  // All values for a multi-select or checkboxes
  const interests = data.getAll("interests");

  // Iterate over all entries
  for (const [key, value] of data) {
    console.log(`${key}: ${value}`);
  }

  // Convert to a plain object
  const obj = Object.fromEntries(data);
  console.log(obj);
});
```

### Direct Element Access

You can also read values directly from form elements:

```js
const form = document.querySelector("#my-form");

// By name
form.elements.username.value;
form.elements.email.value;

// Checkbox checked state
form.elements.agree.checked;

// Selected radio value
form.elements.contact.value;  // value of the selected radio in the group
```

---

## 12.3 Client-Side Validation

### HTML Validation Attributes

HTML5 provides built-in validation attributes that work without any JavaScript:

| Attribute | Purpose | Example |
|---|---|---|
| `required` | Field must not be empty | `<input required>` |
| `minlength` / `maxlength` | Text length limits | `<input minlength="3">` |
| `min` / `max` | Numeric or date range | `<input type="number" min="0">` |
| `pattern` | Regex the value must match | `<input pattern="[A-Za-z]+">` |
| `type="email"` | Must be a valid email format | `<input type="email">` |
| `type="url"` | Must be a valid URL | `<input type="url">` |

When a form is submitted and validation fails, the browser shows a built-in error tooltip.

### The Constraint Validation API

For programmatic control, use the Constraint Validation API:

```js
const input = document.querySelector("#username");

// Check validity
input.checkValidity();     // returns true/false, fires "invalid" event if false
input.reportValidity();    // same as checkValidity, but also shows browser tooltip

// Read validity states
input.validity.valueMissing;    // true if required and empty
input.validity.tooShort;        // true if shorter than minlength
input.validity.tooLong;         // true if longer than maxlength
input.validity.patternMismatch; // true if pattern does not match
input.validity.typeMismatch;    // true if type="email" / type="url" fails
input.validity.rangeUnderflow;  // true if below min
input.validity.rangeOverflow;   // true if above max
input.validity.stepMismatch;    // true if value does not fit step
input.validity.customError;     // true if setCustomValidity was called
input.validity.valid;           // true if all checks pass

// Custom validation message
input.setCustomValidity("Username is already taken");
input.reportValidity();

// Clear custom error (required to allow re-submission)
input.setCustomValidity("");
```

### Custom Validation Logic

Combine HTML attributes with JavaScript for complex rules:

```js
const password = document.querySelector("#password");
const confirm = document.querySelector("#confirm-password");

confirm.addEventListener("input", () => {
  if (confirm.value !== password.value) {
    confirm.setCustomValidity("Passwords do not match");
  } else {
    confirm.setCustomValidity("");
  }
});
```

---

## 12.4 Accessible Forms

### Labels

Every input must have an associated `<label>`. Screen readers use this association to announce the field purpose:

```html
<!-- Explicit association (preferred for styling flexibility) -->
<label for="email">Email address</label>
<input type="email" id="email" name="email">

<!-- Implicit association (wrapping) -->
<label>
  Email address
  <input type="email" name="email">
</label>
```

### Describing Inputs

Use `aria-describedby` to link an input with helper text or error messages:

```html
<label for="password">Password</label>
<input type="password" id="password" name="password"
       aria-describedby="password-help password-error">
<p id="password-help" class="help-text">Must be at least 8 characters</p>
<p id="password-error" class="error" role="alert" aria-live="assertive"></p>
```

### Live Error Announcements

Screen readers need to be notified when error messages appear. Use `aria-live="assertive"` or `role="alert"` on the error container:

```js
function showError(input, message) {
  const errorEl = document.querySelector(`#${input.id}-error`);
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input) {
  const errorEl = document.querySelector(`#${input.id}-error`);
  errorEl.textContent = "";
  input.removeAttribute("aria-invalid");
}
```

### Fieldset and Legend

Group related controls (radio buttons, checkboxes) in a `<fieldset>` with a `<legend>`:

```html
<fieldset>
  <legend>Notification preferences</legend>
  <label><input type="checkbox" name="notify" value="email"> Email</label>
  <label><input type="checkbox" name="notify" value="sms"> SMS</label>
</fieldset>
```

---

## 12.5 Preventing Default Submit

Without JavaScript, forms navigate to the `action` URL. To handle submission in JavaScript:

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();

  // Validate
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Process data
  const data = new FormData(form);
  submitToServer(Object.fromEntries(data));
});
```

### The `novalidate` Attribute

Add `novalidate` to the `<form>` tag to disable built-in browser validation tooltips when you provide your own custom validation UI:

```html
<form id="registration" novalidate>
  <!-- custom validation handled in JS -->
</form>
```

---

## 12.6 Handling Form State

### Tracking Dirty Fields

A field is "dirty" if the user has changed its value from the initial state:

```js
const form = document.querySelector("form");
const dirtyFields = new Set();

form.addEventListener("input", (event) => {
  const field = event.target;
  if (field.value !== field.defaultValue) {
    dirtyFields.add(field.name);
  } else {
    dirtyFields.delete(field.name);
  }
});
```

### Submitting State

Disable the submit button during submission to prevent double-submit:

```js
const submitBtn = form.querySelector('button[type="submit"]');

async function handleSubmit(event) {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    await submitToServer(new FormData(form));
    form.reset();
  } catch (error) {
    showFormError(error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
}
```

### Resetting Forms

```js
form.reset();  // resets all fields to their initial HTML values
```

You can also listen for the `reset` event:

```js
form.addEventListener("reset", () => {
  dirtyFields.clear();
  clearAllErrors();
});
```

---

## Tricky Things & Gotchas

1. **`FormData` ignores disabled fields** — disabled inputs are not included in `FormData`. If you need to send their values, use `readonly` instead or add them manually.

2. **Checkboxes are absent when unchecked** — `FormData` only includes a checkbox if it is checked. An unchecked checkbox simply does not appear in the data. Use a hidden input with the same name as a fallback, or check for absence in your handler.

3. **`setCustomValidity("")` is required to clear errors** — if you set a custom validity message, the field will remain invalid until you explicitly call `setCustomValidity("")`. Forgetting this is a common bug.

4. **`input` vs `change` event** — `input` fires on every keystroke (or paste). `change` fires only when the field loses focus after its value has changed. For real-time validation feedback, use `input`. For "when done editing" logic, use `change`.

5. **Radio buttons share a name** — all radio buttons in a group must have the same `name` attribute. `FormData.get(name)` returns the value of the selected one.

6. **File inputs and FormData** — `data.get("avatar")` returns a `File` object, not a string. You need to handle it differently when sending to a server (typically via `fetch` with `FormData` body, not JSON).

---

## Best Practices

- Always associate `<label>` elements with their inputs using `for`/`id` or wrapping.
- Use HTML validation attributes (`required`, `pattern`, `minlength`) as the first layer of validation.
- Add JavaScript validation only for rules HTML cannot express (e.g., "passwords must match").
- Use `aria-describedby` to link inputs with help text and error messages.
- Use `aria-live="assertive"` or `role="alert"` on error containers so screen readers announce errors immediately.
- Use `novalidate` on the form element when providing custom validation UI.
- Disable the submit button during async submission to prevent double-submit.
- Use `FormData` instead of manually reading each field — it is more maintainable and works with any form structure.

---

## Exercises

1. **Basic form reader.** Create a form with three fields (name, email, message) and a submit button. On submit, prevent the default, create a `FormData` object, and log all entries to the console.

2. **Password strength meter.** Build an input that shows a strength indicator (weak/medium/strong) as the user types. Check for length, uppercase, lowercase, numbers, and symbols. Use `setCustomValidity` to prevent submission of weak passwords.

3. **Dynamic field validation.** Create a form where each field shows a red border and error message on `blur` if invalid, and a green border if valid. Use the `validity` property to determine the specific error.

4. **Accessible error summary.** When the form is submitted with errors, display a summary of all errors at the top of the form inside an `aria-live` region. Each error should link to the corresponding field.

5. **Multi-step form.** Create a two-step form (step 1: personal info, step 2: preferences). Validate each step before proceeding. On the final step, collect all data and display a summary.

6. **FormData manipulation.** Create a form and demonstrate `FormData` methods: `append`, `set`, `delete`, `has`, `getAll`. Show how to convert a FormData object to JSON and to URL-encoded format.

7. **File upload preview.** Build a file input that shows a live image preview when the user selects a file. Use `URL.createObjectURL` or `FileReader`. Validate file type and size.

8. **Dirty form warning.** Track which fields have been modified. When the user tries to navigate away (or click a "Cancel" button) with unsaved changes, show a confirmation dialog.

---

## Mini-Lab

Open the interactive example in [`../../examples-web/phase-02/ch-12-forms/`](../../examples-web/phase-02/ch-12-forms/) to see every concept from this chapter in action. Run it with:

```bash
npm run dev:forms-ex
```

The example page provides:
- A complete registration form with accessible labels and descriptions
- Real-time validation with custom error messages
- A FormData inspector panel showing collected values
- Visual indicators for field validity states

---

## What's Next

Now that you can capture and validate user input, Chapter 13 introduces state management — how to design, store, and render application state so that your UI stays consistent and predictable.
