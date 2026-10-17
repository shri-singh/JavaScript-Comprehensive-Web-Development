// task-form.js — Create / Edit task form component

import { createTask, updateTask, getTask } from '../api.js';

/**
 * Renders a form for creating or editing a task.
 *
 * @param {object} store - The app store instance
 * @param {string|null} taskId - The task ID if editing, null if creating
 * @returns {HTMLElement}
 */
export function TaskForm(store, taskId = null) {
  const container = document.createElement('div');
  container.className = 'task-form-container';

  const isEditing = taskId !== null;

  // Title
  const heading = document.createElement('h2');
  heading.textContent = isEditing ? 'Edit Task' : 'Create New Task';
  container.appendChild(heading);

  // Error area
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-error';
  errorDiv.style.display = 'none';
  container.appendChild(errorDiv);

  // Form
  const form = document.createElement('form');
  form.setAttribute('novalidate', '');

  // --- Title input ---
  const titleGroup = document.createElement('div');
  titleGroup.className = 'form-group';

  const titleLabel = document.createElement('label');
  titleLabel.className = 'form-label';
  titleLabel.setAttribute('for', 'task-title');
  titleLabel.textContent = 'Title *';
  titleGroup.appendChild(titleLabel);

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'task-title';
  titleInput.className = 'form-input';
  titleInput.placeholder = 'Enter task title';
  titleInput.required = true;
  titleGroup.appendChild(titleInput);

  const titleError = document.createElement('div');
  titleError.className = 'form-error';
  titleError.style.display = 'none';
  titleError.textContent = 'Title is required.';
  titleGroup.appendChild(titleError);

  form.appendChild(titleGroup);

  // --- Description textarea ---
  const descGroup = document.createElement('div');
  descGroup.className = 'form-group';

  const descLabel = document.createElement('label');
  descLabel.className = 'form-label';
  descLabel.setAttribute('for', 'task-description');
  descLabel.textContent = 'Description';
  descGroup.appendChild(descLabel);

  const descInput = document.createElement('textarea');
  descInput.id = 'task-description';
  descInput.className = 'form-textarea';
  descInput.placeholder = 'Enter task description (optional)';
  descGroup.appendChild(descInput);

  form.appendChild(descGroup);

  // --- Status select ---
  const statusGroup = document.createElement('div');
  statusGroup.className = 'form-group';

  const statusLabel = document.createElement('label');
  statusLabel.className = 'form-label';
  statusLabel.setAttribute('for', 'task-status');
  statusLabel.textContent = 'Status';
  statusGroup.appendChild(statusLabel);

  const statusSelect = document.createElement('select');
  statusSelect.id = 'task-status';
  statusSelect.className = 'form-select';

  const statusOptions = [
    { value: 'todo', label: 'Todo' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  for (const opt of statusOptions) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    statusSelect.appendChild(option);
  }

  statusGroup.appendChild(statusSelect);
  form.appendChild(statusGroup);

  // --- Priority select ---
  const priorityGroup = document.createElement('div');
  priorityGroup.className = 'form-group';

  const priorityLabel = document.createElement('label');
  priorityLabel.className = 'form-label';
  priorityLabel.setAttribute('for', 'task-priority');
  priorityLabel.textContent = 'Priority';
  priorityGroup.appendChild(priorityLabel);

  const prioritySelect = document.createElement('select');
  prioritySelect.id = 'task-priority';
  prioritySelect.className = 'form-select';

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  for (const opt of priorityOptions) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === 'medium') option.selected = true;
    prioritySelect.appendChild(option);
  }

  priorityGroup.appendChild(prioritySelect);
  form.appendChild(priorityGroup);

  // --- Action buttons ---
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-form-actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = isEditing ? 'Update Task' : 'Create Task';
  actionsDiv.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-outline';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    window.location.hash = '#/dashboard';
  });
  actionsDiv.appendChild(cancelBtn);

  form.appendChild(actionsDiv);
  container.appendChild(form);

  // -----------------------------------------------------------------------
  // If editing, load the existing task data
  // -----------------------------------------------------------------------

  if (isEditing) {
    loadTask();
  }

  async function loadTask() {
    try {
      const task = await getTask(taskId);
      titleInput.value = task.title;
      descInput.value = task.description || '';
      statusSelect.value = task.status;
      prioritySelect.value = task.priority;
    } catch (err) {
      errorDiv.textContent = 'Failed to load task: ' + err.message;
      errorDiv.style.display = 'block';
      saveBtn.disabled = true;
    }
  }

  // -----------------------------------------------------------------------
  // Form submission
  // -----------------------------------------------------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear errors
    errorDiv.style.display = 'none';
    titleInput.classList.remove('error');
    titleError.style.display = 'none';

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const status = statusSelect.value;
    const priority = prioritySelect.value;

    // Validate
    if (!title) {
      titleInput.classList.add('error');
      titleError.style.display = 'block';
      titleInput.focus();
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = isEditing ? 'Updating...' : 'Creating...';

    try {
      if (isEditing) {
        await updateTask(taskId, { title, description, status, priority });
      } else {
        await createTask({ title, description, status, priority });
      }
      window.location.hash = '#/dashboard';
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = 'block';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = isEditing ? 'Update Task' : 'Create Task';
    }
  });

  return container;
}
