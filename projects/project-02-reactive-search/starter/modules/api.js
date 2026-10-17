/**
 * api.js -- Open Library API layer
 *
 * Provides a single function to search for books using the Open Library
 * Search API. Supports AbortSignal for request cancellation.
 *
 * API endpoint:
 *   https://openlibrary.org/search.json?q=<query>&page=<page>&limit=12
 *
 * Response shape (relevant fields):
 *   {
 *     numFound: number,
 *     docs: [
 *       { title, author_name, first_publish_year, cover_i, key }
 *     ]
 *   }
 */

/**
 * Search for books on Open Library.
 *
 * @param {string} query   -- The search term.
 * @param {number} page    -- The page number (1-based).
 * @param {AbortSignal} signal -- An AbortSignal to cancel the request.
 * @returns {Promise<{ books: Array, totalResults: number, page: number }>}
 *
 * Each book object should have:
 *   - title:   string
 *   - author:  string  (first author, or "Unknown Author")
 *   - year:    number | null
 *   - coverId: number | null  (used to build cover image URL)
 *   - key:     string         (Open Library work key, e.g. "/works/OL123W")
 */
export async function searchBooks(query, page = 1, signal) {
  // TODO: Build the request URL with encodeURIComponent(query), page, and limit=12.

  // TODO: Call fetch() with the URL and pass { signal } as the second argument.

  // TODO: Check if the response is OK. If not, throw an error with a descriptive message.

  // TODO: Parse the JSON response.

  // TODO: Map response.docs into an array of book objects with the shape above.

  // TODO: Return { books, totalResults: data.numFound, page }.
}
