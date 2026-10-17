/**
 * api.js -- Open Library API layer
 *
 * Provides a single function to search for books using the Open Library
 * Search API. Supports AbortSignal for request cancellation.
 */

const BASE_URL = 'https://openlibrary.org/search.json';
const RESULTS_PER_PAGE = 12;

/**
 * Search for books on Open Library.
 *
 * @param {string} query   -- The search term.
 * @param {number} page    -- The page number (1-based).
 * @param {AbortSignal} signal -- An AbortSignal to cancel the request.
 * @returns {Promise<{ books: Array, totalResults: number, page: number }>}
 */
export async function searchBooks(query, page = 1, signal) {
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&page=${page}&limit=${RESULTS_PER_PAGE}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Search request failed (status ${response.status})`);
  }

  const data = await response.json();

  const books = data.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
    year: doc.first_publish_year ?? null,
    coverId: doc.cover_i ?? null,
    key: doc.key,
  }));

  return {
    books,
    totalResults: data.numFound,
    page,
  };
}
