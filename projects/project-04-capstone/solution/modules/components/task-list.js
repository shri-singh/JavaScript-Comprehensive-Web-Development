// task-list.js — Task list / card grid component

import { deleteTask } from '../api.js';

/**
 * Renders a grid of task cards.
 * Uses textContent for all user-supplied data to prevent XSS.
 *
 * @param {Array} tasks - Array of task objects
 * @param {Function} onDelete - Callback after a task is deleted (to refresh the list)
 * @returns {HTMLElement}
 */
export function TaskList(tasks, onDelete) {
  const container = document.createElement('div');

  // Empty state
  if (!tasks || tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';

    const h3 = document.createElement('h3');
    h3.textContent = 'No tasks found';
    empty.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = 'Create a new task or adjust your filters.';
    empty.appendChild(p);

    container.appendChild(empty);
    return container;
  }

  // Task grid
  const grid = document.createElement('div');
  grid.className = 'task-grid';

  for (const task of tasks) {
    const card = document.createElement('div');
    card.className = 'task-card';

    // Header
    const header = document.createElement('div');
    header.className = 'task-card-header';

    const titleEl = document.createElement('span');
    titleEl.className = 'task-card-title';
    titleEl.textContent = task.title; // XSS-safe
    header.appendChild(titleEl);

    card.appendChild(header);

    // Description
    const desc = document.createElement('p');
    desc.className = 'task-card-description';
    desc.textContent = task.description
      ? task.description.length > 120
        ? task.description.substring(0, 120) + '...'
        : task.description
      : 'No description provided.';
    card.appendChild(desc);

    // Meta (badges)
    const meta = document.createElement('div');
    meta.className = 'task-card-meta';

    const statusBadge = document.createElement('span');
    statusBadge.className = `badge badge-${task.status}`;
    statusBadge.textContent = formatStatus(task.status);
    meta.appendChild(statusBadge);

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge badge-${task.priority}`;
    priorityBadge.textContent = task.priority;
    meta.appendChild(priorityBadge);

    card.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      window.location.hash = `#/tasks/${task.id}/edit`;
    });
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
      );
      if (!confirmed) return;

      deleteBtn.disabled = true;
      deleteBtn.textContent = 'Deleting...';

      try {
        await deleteTask(task.id);
        if (typeof onDelete === 'function') {
          onDelete();
        }
      } catch (err) {
        alert('Failed to delete task: ' + err.message);
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Delete';
      }
    });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    grid.appendChild(card);
  }

  container.appendChild(grid);
  return container;
}

/**
 * Format a status value for display.
 */
function formatStatus(status) {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'todo':
      return 'Todo';
    case 'done':
      return 'Done';
    default:
      return status;
  }
}
