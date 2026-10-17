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
 */
export function saveDraft(formData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  } catch (err) {
    console.warn('Could not save draft to localStorage:', err);
  }
}

/**
 * Load the saved draft data from localStorage.
 *
 * @returns {Object|null} The parsed form data object, or null if no draft exists.
 */
export function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Could not load draft from localStorage:', err);
    return null;
  }
}

/**
 * Clear the saved draft from localStorage.
 */
export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
