// dashboard.js — Dashboard page component
// TODO: Import { getTasks } from '../api.js'
// TODO: Import { TaskList } from './task-list.js'
// TODO: Import { Pagination } from './pagination.js'

/**
 * Renders the dashboard page with task list, filters, and pagination.
 *
 * @param {object} store - The app store instance
 * @returns {HTMLElement}
 */
export function DashboardPage(store) {
  const container = document.createElement('div');

  // TODO: Create the dashboard header with:
  //   - h2 "Task Dashboard"
  //   - "New Task" button that navigates to #/tasks/new

  // TODO: Create the filter controls section with:
  //   - Search input (text, placeholder "Search tasks...")
  //   - Status dropdown (All, Todo, In Progress, Done)
  //   - Priority dropdown (All, Low, Medium, High)
  //   - Sort dropdown (Created Date, Title, Priority, Status)

  // TODO: Create a container for the task list

  // TODO: Create a container for pagination

  // TODO: Write a loadTasks() function that:
  //   - Reads current filters and pagination from the store
  //   - Calls getTasks() with those params
  //   - Updates the store with the results
  //   - Renders TaskList into the task list container
  //   - Renders Pagination into the pagination container

  // TODO: Add event listeners on filter controls to update store filters and reload tasks

  // TODO: Call loadTasks() to load initial data

  return container;
}
