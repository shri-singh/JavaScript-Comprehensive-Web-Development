// login.js — Login page component

import { login } from '../auth.js';

/**
 * Renders the login page with a form.
 *
 * @returns {HTMLElement}
 */
export function LoginPage() {
  const container = document.createElement('div');
  container.className = 'login-container';

  const card = document.createElement('div');
  card.className = 'login-card';

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Sign In';
  card.appendChild(title);

  // Subtitle
  const subtitle = document.createElement('p');
  subtitle.className = 'login-subtitle';
  subtitle.textContent = 'Enter your credentials to access the dashboard.';
  card.appendChild(subtitle);

  // Error message area (hidden by default)
  const errorDiv = document.createElement('div');
  errorDiv.className = 'login-error';
  errorDiv.style.display = 'none';
  card.appendChild(errorDiv);

  // Form
  const form = document.createElement('form');
  form.setAttribute('novalidate', '');

  // Username field
  const usernameGroup = document.createElement('div');
  usernameGroup.className = 'form-group';

  const usernameLabel = document.createElement('label');
  usernameLabel.className = 'form-label';
  usernameLabel.setAttribute('for', 'login-username');
  usernameLabel.textContent = 'Username';
  usernameGroup.appendChild(usernameLabel);

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'login-username';
  usernameInput.className = 'form-input';
  usernameInput.placeholder = 'Enter your username';
  usernameInput.autocomplete = 'username';
  usernameInput.required = true;
  usernameGroup.appendChild(usernameInput);

  form.appendChild(usernameGroup);

  // Password field
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';

  const passwordLabel = document.createElement('label');
  passwordLabel.className = 'form-label';
  passwordLabel.setAttribute('for', 'login-password');
  passwordLabel.textContent = 'Password';
  passwordGroup.appendChild(passwordLabel);

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'login-password';
  passwordInput.className = 'form-input';
  passwordInput.placeholder = 'Enter your password';
  passwordInput.autocomplete = 'current-password';
  passwordInput.required = true;
  passwordGroup.appendChild(passwordInput);

  form.appendChild(passwordGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Sign In';
  form.appendChild(submitBtn);

  card.appendChild(form);

  // Hint
  const hint = document.createElement('div');
  hint.className = 'login-hint';
  hint.textContent = 'Demo credentials: username "demo", password "password"';
  card.appendChild(hint);

  container.appendChild(card);

  // -----------------------------------------------------------------------
  // Event handling
  // -----------------------------------------------------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Clear previous errors
    errorDiv.style.display = 'none';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');

    // Validate
    if (!username) {
      usernameInput.classList.add('error');
      errorDiv.textContent = 'Please enter your username.';
      errorDiv.style.display = 'block';
      usernameInput.focus();
      return;
    }

    if (!password) {
      passwordInput.classList.add('error');
      errorDiv.textContent = 'Please enter your password.';
      errorDiv.style.display = 'block';
      passwordInput.focus();
      return;
    }

    // Attempt login
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      await login(username, password);
      // Force a full re-render by triggering hashchange after updating header
      window.location.hash = '#/dashboard';
      // Reload to update header state
      window.dispatchEvent(new CustomEvent('auth-change'));
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });

  // Focus username on mount
  setTimeout(() => usernameInput.focus(), 50);

  return container;
}
