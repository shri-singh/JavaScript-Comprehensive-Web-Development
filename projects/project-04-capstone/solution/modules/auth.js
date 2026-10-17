// auth.js — Authentication module
// Mock credentials: username = 'demo', password = 'password'

const TOKEN_KEY = 'taskboard_token';
const MOCK_USERNAME = 'demo';
const MOCK_PASSWORD = 'password';

/**
 * Encode a simple mock token (base64-encoded JSON).
 * This is NOT real security — it simulates how a JWT might work.
 */
function encodeToken(payload) {
  return btoa(JSON.stringify(payload));
}

/**
 * Decode the mock token back to an object.
 */
function decodeToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

/**
 * Attempt to log in with the given credentials.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ success: boolean, user: { username: string } }>}
 */
export async function login(username, password) {
  // Simulate a short network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
    const token = encodeToken({
      username,
      iat: Date.now(),
      exp: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    sessionStorage.setItem(TOKEN_KEY, token);
    return { success: true, user: { username } };
  }

  throw new Error('Invalid username or password');
}

/**
 * Log out the current user.
 */
export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  window.location.hash = '#/login';
}

/**
 * Check whether the user is currently authenticated.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  // Check expiration
  if (payload.exp && payload.exp < Date.now()) {
    sessionStorage.removeItem(TOKEN_KEY);
    return false;
  }

  return true;
}

/**
 * Get the current user's information from the stored token.
 *
 * @returns {{ username: string } | null}
 */
export function getUser() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  return { username: payload.username };
}

/**
 * Route guard — redirects to login if not authenticated.
 *
 * @returns {boolean}
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}
