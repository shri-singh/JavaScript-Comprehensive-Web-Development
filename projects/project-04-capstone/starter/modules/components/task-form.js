// task-form.js — Create / Edit task form component
// TODO: Import { createTask, updateTask, getTask } from '../api.js'

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

  // TODO: Create the form with:
  //   - h2 title: "Edit Task" or "Create New Task"
  //   - Title input (required)
  //   - Description textarea
  //   - Status select (Todo, In Progress, Done)
  //   - Priority select (Low, Medium, High)
  //   - Error message area
  //   - Action buttons: "Save" (btn-primary), "Cancel" (btn-outline, navigates back)

  // TODO: If editing, fetch the task by ID and populate the form fields
  //   async function loadTask() {
  //     const task = await getTask(taskId);
  //     // Set form field values
  //   }
  //   if (isEditing) loadTask();

  // TODO: Add submit event listener:
  //   - Prevent default
  //   - Validate that title is not empty
  //   - Gather form data: { title, description, status, priority }
  //   - If editing: call updateTask(taskId, data)
  //   - If creating: call createTask(data)
  //   - On success: navigate to #/dashboard
  //   - On error: show error message

  return container;
}
