// login.js — Login page component
// TODO: Import { login } from '../auth.js'

/**
 * Renders the login page with a form.
 *
 * The form should:
 * - Have username and password inputs
 * - Display validation errors
 * - Call auth.login() on submit
 * - Redirect to #/dashboard on success
 * - Show an error message on failure
 *
 * @returns {HTMLElement} The login page container element
 */
export function LoginPage() {
  // TODO: Create the login container element
  const container = document.createElement('div');
  container.className = 'login-container';

  // TODO: Build the login card with:
  //   - h2 title "Sign In"
  //   - Subtitle paragraph
  //   - Error message area (hidden by default)
  //   - Form with:
  //     - Username input (form-group with label and input)
  //     - Password input (form-group with label and input)
  //     - Submit button (btn btn-primary)
  //   - Hint showing demo credentials

  // TODO: Add event listener on form submit:
  //   - Prevent default
  //   - Get username and password values
  //   - Validate that both fields are filled
  //   - Call login(username, password)
  //   - On success: navigate to #/dashboard
  //   - On error: display error message in the error area

  return container;
}
