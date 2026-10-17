// auth.js — Authentication module
// Mock credentials: username = 'demo', password = 'password'

const TOKEN_KEY = 'taskboard_token';

/**
 * Attempt to log in with the given credentials.
 * Should validate against hardcoded demo credentials.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} Resolves with { success: true, user } or rejects with an error
 */
export async function login(username, password) {
  // TODO: Check username and password against mock credentials ('demo' / 'password')
  // TODO: If valid, create a mock JWT-like token (e.g. base64-encoded JSON with username and timestamp)
  // TODO: Store the token in sessionStorage under TOKEN_KEY
  // TODO: Return { success: true, user: { username } }
  // TODO: If invalid, throw new Error('Invalid username or password')
}

/**
 * Log out the current user.
 * Clears the stored token and navigates to the login page.
 */
export function logout() {
  // TODO: Remove the token from sessionStorage
  // TODO: Navigate to #/login (set window.location.hash)
}

/**
 * Check whether the user is currently authenticated.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  // TODO: Check if a token exists in sessionStorage
  // TODO: Optionally check if the token is not expired
  // TODO: Return true or false
}

/**
 * Get the current user's information from the stored token.
 *
 * @returns {object|null} User object { username } or null if not authenticated
 */
export function getUser() {
  // TODO: Read the token from sessionStorage
  // TODO: Decode the mock token to extract user info
  // TODO: Return { username } or null
}

/**
 * Route guard — checks auth and redirects to login if not authenticated.
 *
 * @returns {boolean} true if authenticated, false otherwise
 */
export function requireAuth() {
  // TODO: Call isAuthenticated()
  // TODO: If not authenticated, set window.location.hash = '#/login' and return false
  // TODO: If authenticated, return true
}
