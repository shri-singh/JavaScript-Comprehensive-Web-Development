// api.js — Mock REST API with in-memory data store
// Each task: { id, title, description, status, priority, createdAt, updatedAt }
// Status values: 'todo', 'in-progress', 'done'
// Priority values: 'low', 'medium', 'high'

// TODO: Create an in-memory array of seed tasks (15-20 items)
// Example:
// let tasks = [
//   { id: '1', title: 'Design homepage layout', description: '...', status: 'done',
//     priority: 'high', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-20T14:30:00Z' },
//   ...
// ];

let tasks = [];

// TODO: Create a helper to generate unique IDs (e.g. Date.now().toString(36) + random string)
function generateId() {
  // TODO: Implement ID generation
}

// TODO: Create a helper to simulate async delay
// function delay(ms = 300) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

/**
 * Get a paginated, filtered, and sorted list of tasks.
 *
 * @param {object} params
 * @param {string} [params.search] - Search text (matches title or description)
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.priority] - Filter by priority
 * @param {string} [params.sortBy='createdAt'] - Field to sort by
 * @param {string} [params.sortOrder='desc'] - 'asc' or 'desc'
 * @param {number} [params.page=1] - Current page
 * @param {number} [params.limit=6] - Items per page
 * @returns {Promise<{ tasks: Array, total: number, page: number, totalPages: number }>}
 */
export async function getTasks(params = {}) {
  // TODO: Destructure params with defaults
  // TODO: Filter tasks by search (title or description includes search text, case-insensitive)
  // TODO: Filter by status if provided
  // TODO: Filter by priority if provided
  // TODO: Sort by the specified field and order
  // TODO: Calculate pagination (total, totalPages)
  // TODO: Slice the array for the current page
  // TODO: Return { tasks: slicedTasks, total, page, totalPages } after a delay
}

/**
 * Get a single task by ID.
 *
 * @param {string} id
 * @returns {Promise<object>} The task object
 */
export async function getTask(id) {
  // TODO: Find the task in the array
  // TODO: If not found, throw new Error('Task not found')
  // TODO: Return the task after a delay
}

/**
 * Create a new task.
 *
 * @param {object} data - { title, description, status, priority }
 * @returns {Promise<object>} The created task
 */
export async function createTask(data) {
  // TODO: Validate that title is provided
  // TODO: Create a new task object with generated id, timestamps, and defaults
  // TODO: Push it onto the tasks array
  // TODO: Return the new task after a delay
}

/**
 * Update an existing task.
 *
 * @param {string} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>} The updated task
 */
export async function updateTask(id, data) {
  // TODO: Find the task index
  // TODO: If not found, throw new Error('Task not found')
  // TODO: Merge data into the existing task, update updatedAt
  // TODO: Return the updated task after a delay
}

/**
 * Delete a task by ID.
 *
 * @param {string} id
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteTask(id) {
  // TODO: Find the task index
  // TODO: If not found, throw new Error('Task not found')
  // TODO: Remove it from the array
  // TODO: Return { success: true } after a delay
}
