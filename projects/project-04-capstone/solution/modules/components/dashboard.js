// dashboard.js — Dashboard page component

import { getTasks } from '../api.js';
import { TaskList } from './task-list.js';
import { Pagination } from './pagination.js';

/**
 * Renders the dashboard page with task list, filters, and pagination.
 *
 * @param {object} store - The app store instance
 * @returns {HTMLElement}
 */
export function DashboardPage(store) {
  const container = document.createElement('div');

  // -----------------------------------------------------------------------
  // Dashboard header
  // -----------------------------------------------------------------------

  const header = document.createElement('div');
  header.className = 'dashboard-header';

  const heading = document.createElement('h2');
  heading.textContent = 'Task Dashboard';
  header.appendChild(heading);

  const newTaskBtn = document.createElement('button');
  newTaskBtn.className = 'btn btn-primary';
  newTaskBtn.textContent = '+ New Task';
  newTaskBtn.addEventListener('click', () => {
    window.location.hash = '#/tasks/new';
  });
  header.appendChild(newTaskBtn);

  container.appendChild(header);

  // -----------------------------------------------------------------------
  // Filter controls
  // -----------------------------------------------------------------------

  const filters = document.createElement('div');
  filters.className = 'dashboard-filters';

  // Search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'form-input search-input';
  searchInput.placeholder = 'Search tasks...';
  searchInput.value = store.getState().filters.search || '';
  filters.appendChild(searchInput);

  // Status filter
  const statusSelect = document.createElement('select');
  statusSelect.className = 'form-select';
  const statusOptions = [
    { value: '', label: 'All Statuses' },
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
  statusSelect.value = store.getState().filters.status || '';
  filters.appendChild(statusSelect);

  // Priority filter
  const prioritySelect = document.createElement('select');
  prioritySelect.className = 'form-select';
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  for (const opt of priorityOptions) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    prioritySelect.appendChild(option);
  }
  prioritySelect.value = store.getState().filters.priority || '';
  filters.appendChild(prioritySelect);

  // Sort select
  const sortSelect = document.createElement('select');
  sortSelect.className = 'form-select';
  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ];
  for (const opt of sortOptions) {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    sortSelect.appendChild(option);
  }
  sortSelect.value = store.getState().filters.sortBy || 'createdAt';
  filters.appendChild(sortSelect);

  // Sort order toggle button
  const sortOrderBtn = document.createElement('button');
  sortOrderBtn.className = 'btn btn-outline btn-sm';
  sortOrderBtn.textContent = store.getState().filters.sortOrder === 'asc' ? 'Asc' : 'Desc';
  sortOrderBtn.title = 'Toggle sort order';
  filters.appendChild(sortOrderBtn);

  container.appendChild(filters);

  // -----------------------------------------------------------------------
  // Stats cards
  // -----------------------------------------------------------------------

  const statsContainer = document.createElement('div');
  statsContainer.className = 'dashboard-stats';
  container.appendChild(statsContainer);

  // -----------------------------------------------------------------------
  // Task list and pagination containers
  // -----------------------------------------------------------------------

  const taskListContainer = document.createElement('div');
  taskListContainer.id = 'task-list-container';
  container.appendChild(taskListContainer);

  const paginationContainer = document.createElement('div');
  paginationContainer.id = 'pagination-container';
  container.appendChild(paginationContainer);

  // -----------------------------------------------------------------------
  // Load and render tasks
  // -----------------------------------------------------------------------

  let debounceTimer = null;

  async function loadTasks() {
    const state = store.getState();

    // Show loading
    taskListContainer.innerHTML = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loadingDiv.appendChild(spinner);
    taskListContainer.appendChild(loadingDiv);

    paginationContainer.innerHTML = '';

    try {
      const result = await getTasks({
        search: state.filters.search,
        status: state.filters.status,
        priority: state.filters.priority,
        sortBy: state.filters.sortBy,
        sortOrder: state.filters.sortOrder,
        page: state.pagination.page,
        limit: state.pagination.limit,
      });

      // Update store with results (without triggering re-render loop)
      store.setState({
        tasks: result.tasks,
        pagination: {
          ...state.pagination,
          page: result.page,
          total: result.total,
          totalPages: result.totalPages,
        },
        loading: false,
        error: null,
      });

      // Render task list
      taskListContainer.innerHTML = '';
      const taskList = TaskList(result.tasks, () => loadTasks());
      taskListContainer.appendChild(taskList);

      // Render stats
      renderStats(result.total);

      // Render pagination
      paginationContainer.innerHTML = '';
      const pagination = Pagination(result.page, result.totalPages, (newPage) => {
        const currentState = store.getState();
        store.setState({
          pagination: { ...currentState.pagination, page: newPage },
        });
        loadTasks();
      });
      paginationContainer.appendChild(pagination);
    } catch (err) {
      taskListContainer.innerHTML = '';
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-error';
      errorDiv.textContent = 'Failed to load tasks: ' + err.message;
      taskListContainer.appendChild(errorDiv);
    }
  }

  function renderStats(total) {
    statsContainer.innerHTML = '';
    const state = store.getState();

    const stats = [
      { label: 'Total Tasks', value: total },
      { label: 'Current Page', value: `${state.pagination.page} / ${state.pagination.totalPages}` },
    ];

    for (const stat of stats) {
      const card = document.createElement('div');
      card.className = 'stat-card';

      const value = document.createElement('div');
      value.className = 'stat-value';
      value.textContent = stat.value;
      card.appendChild(value);

      const label = document.createElement('div');
      label.className = 'stat-label';
      label.textContent = stat.label;
      card.appendChild(label);

      statsContainer.appendChild(card);
    }
  }

  // -----------------------------------------------------------------------
  // Event listeners for filters
  // -----------------------------------------------------------------------

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const state = store.getState();
      store.setState({
        filters: { ...state.filters, search: searchInput.value.trim() },
        pagination: { ...state.pagination, page: 1 },
      });
      loadTasks();
    }, 300);
  });

  statusSelect.addEventListener('change', () => {
    const state = store.getState();
    store.setState({
      filters: { ...state.filters, status: statusSelect.value },
      pagination: { ...state.pagination, page: 1 },
    });
    loadTasks();
  });

  prioritySelect.addEventListener('change', () => {
    const state = store.getState();
    store.setState({
      filters: { ...state.filters, priority: prioritySelect.value },
      pagination: { ...state.pagination, page: 1 },
    });
    loadTasks();
  });

  sortSelect.addEventListener('change', () => {
    const state = store.getState();
    store.setState({
      filters: { ...state.filters, sortBy: sortSelect.value },
      pagination: { ...state.pagination, page: 1 },
    });
    loadTasks();
  });

  sortOrderBtn.addEventListener('click', () => {
    const state = store.getState();
    const newOrder = state.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    sortOrderBtn.textContent = newOrder === 'asc' ? 'Asc' : 'Desc';
    store.setState({
      filters: { ...state.filters, sortOrder: newOrder },
      pagination: { ...state.pagination, page: 1 },
    });
    loadTasks();
  });

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------

  loadTasks();

  return container;
}
