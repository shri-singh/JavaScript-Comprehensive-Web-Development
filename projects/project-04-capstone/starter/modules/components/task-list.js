// task-list.js — Task list / card grid component
// TODO: Import { deleteTask } from '../api.js'

/**
 * Renders a grid of task cards.
 *
 * Each card displays:
 * - Title
 * - Description (truncated)
 * - Status badge
 * - Priority badge
 * - Edit button (navigates to #/tasks/:id/edit)
 * - Delete button (confirms before deleting)
 *
 * IMPORTANT: Use textContent (not innerHTML) for user-supplied data to prevent XSS.
 *
 * @param {Array} tasks - Array of task objects
 * @param {Function} onDelete - Callback to invoke after a task is deleted (to refresh the list)
 * @returns {HTMLElement}
 */
export function TaskList(tasks, onDelete) {
  const container = document.createElement('div');

  // TODO: If tasks array is empty, show an empty state message
  //   <div class="empty-state">
  //     <h3>No tasks found</h3>
  //     <p>Create a new task or adjust your filters.</p>
  //   </div>

  // TODO: Create a div.task-grid container

  // TODO: For each task, create a task card:
  //   <div class="task-card">
  //     <div class="task-card-header">
  //       <span class="task-card-title">{title}</span>  ← use textContent!
  //     </div>
  //     <p class="task-card-description">{description}</p>  ← use textContent!
  //     <div class="task-card-meta">
  //       <span class="badge badge-{status}">{status}</span>
  //       <span class="badge badge-{priority}">{priority}</span>
  //     </div>
  //     <div class="task-card-actions">
  //       <button class="btn btn-outline btn-sm">Edit</button>
  //       <button class="btn btn-danger btn-sm">Delete</button>
  //     </div>
  //   </div>

  // TODO: Wire edit button to navigate to #/tasks/{id}/edit
  // TODO: Wire delete button to confirm("Delete this task?") then call deleteTask(id)
  //       On success, call onDelete() to refresh the list

  return container;
}
