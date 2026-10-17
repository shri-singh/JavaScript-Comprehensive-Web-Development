/**
 * persistence.js — localStorage wrapper for form draft data
 *
 * This module provides a thin abstraction over localStorage so the rest
 * of the application doesn't need to know about serialisation or the
 * storage key.
 */

const STORAGE_KEY = 'registration_draft';

/**
 * Save the current form data as a draft in localStorage.
 *
 * @param {Object} formData — A plain object containing all form field values.
 *
 * TODO: Implement this function:
 * 1. Convert formData to a JSON string
 * 2. Store it in localStorage under STORAGE_KEY
 *
 * Hint: localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
 *
 * Bonus: wrap in try/catch in case localStorage is full or disabled.
 */
export function saveDraft(formData) {
  // TODO: Implement this function
}

/**
 * Load the saved draft data from localStorage.
 *
 * @returns {Object|null} The parsed form data object, or null if no draft exists.
 *
 * TODO: Implement this function:
 * 1. Retrieve the item from localStorage using STORAGE_KEY
 * 2. Parse it from JSON
 * 3. Return the parsed object, or null if nothing was stored
 *
 * Hint: JSON.parse(localStorage.getItem(STORAGE_KEY))
 *
 * Bonus: wrap in try/catch to handle corrupted data gracefully.
 */
export function loadDraft() {
  // TODO: Implement this function
  return null;
}

/**
 * Clear the saved draft from localStorage.
 *
 * TODO: Implement this function:
 * - Remove the item stored under STORAGE_KEY
 *
 * Hint: localStorage.removeItem(STORAGE_KEY)
 */
export function clearDraft() {
  // TODO: Implement this function
}
