// api.js — Mock REST API with in-memory data store

// ---------------------------------------------------------------------------
// Seed data — 20 realistic tasks
// ---------------------------------------------------------------------------

let tasks = [
  {
    id: '1',
    title: 'Design homepage layout',
    description: 'Create wireframes and mockups for the new homepage redesign including hero section, feature cards, and testimonials.',
    status: 'done',
    priority: 'high',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-18T14:30:00Z',
  },
  {
    id: '2',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging environment.',
    status: 'done',
    priority: 'high',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: '3',
    title: 'Implement user authentication',
    description: 'Build login and registration forms with JWT-based authentication. Include password reset flow.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-01T09:45:00Z',
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints using OpenAPI/Swagger specification. Include request/response examples.',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-01-18T13:00:00Z',
    updatedAt: '2026-01-18T13:00:00Z',
  },
  {
    id: '5',
    title: 'Optimize database queries',
    description: 'Profile slow queries in the dashboard module and add appropriate indexes. Target: < 100ms response time.',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-02-05T16:20:00Z',
  },
  {
    id: '6',
    title: 'Add dark mode support',
    description: 'Implement a theme toggle using CSS custom properties. Persist user preference in localStorage.',
    status: 'todo',
    priority: 'low',
    createdAt: '2026-01-22T09:30:00Z',
    updatedAt: '2026-01-22T09:30:00Z',
  },
  {
    id: '7',
    title: 'Create onboarding tutorial',
    description: 'Build a step-by-step guided tour for new users highlighting key features of the dashboard.',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
  },
  {
    id: '8',
    title: 'Fix mobile navigation bug',
    description: 'The hamburger menu does not close after selecting a nav item on iOS Safari. Investigate and fix.',
    status: 'done',
    priority: 'medium',
    createdAt: '2026-01-28T10:15:00Z',
    updatedAt: '2026-02-02T08:00:00Z',
  },
  {
    id: '9',
    title: 'Integrate payment gateway',
    description: 'Connect Stripe API for subscription billing. Support monthly and annual plans with proration.',
    status: 'todo',
    priority: 'high',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: '10',
    title: 'Set up error monitoring',
    description: 'Integrate Sentry for front-end error tracking. Configure source maps and alert rules.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-03T11:00:00Z',
    updatedAt: '2026-02-10T13:30:00Z',
  },
  {
    id: '11',
    title: 'Redesign settings page',
    description: 'Update the settings page layout with tabs for Profile, Notifications, Security, and Billing.',
    status: 'todo',
    priority: 'low',
    createdAt: '2026-02-05T08:45:00Z',
    updatedAt: '2026-02-05T08:45:00Z',
  },
  {
    id: '12',
    title: 'Write unit tests for auth module',
    description: 'Achieve 90%+ coverage for the authentication module. Test login, logout, token refresh, and edge cases.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-06T10:00:00Z',
    updatedAt: '2026-02-12T15:00:00Z',
  },
  {
    id: '13',
    title: 'Implement file upload feature',
    description: 'Allow users to upload avatars and attachments. Support drag-and-drop with progress indicator. Max 5 MB.',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-02-08T14:30:00Z',
    updatedAt: '2026-02-08T14:30:00Z',
  },
  {
    id: '14',
    title: 'Accessibility audit',
    description: 'Run axe and Lighthouse audits. Fix all critical and serious issues. Ensure WCAG 2.1 AA compliance.',
    status: 'todo',
    priority: 'high',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: '15',
    title: 'Add export to CSV',
    description: 'Allow users to export their task data as a CSV file. Include all fields and respect current filters.',
    status: 'todo',
    priority: 'low',
    createdAt: '2026-02-12T11:00:00Z',
    updatedAt: '2026-02-12T11:00:00Z',
  },
  {
    id: '16',
    title: 'Performance profiling',
    description: 'Use Chrome DevTools to identify rendering bottlenecks. Optimize large list rendering with virtualization.',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-02-14T08:30:00Z',
  },
  {
    id: '17',
    title: 'Migrate to TypeScript',
    description: 'Incrementally migrate the codebase from JavaScript to TypeScript. Start with utility modules and API layer.',
    status: 'todo',
    priority: 'low',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: '18',
    title: 'Implement notification system',
    description: 'Build a real-time notification bell with badge count. Support in-app and optional email notifications.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2026-02-17T13:00:00Z',
    updatedAt: '2026-02-22T09:15:00Z',
  },
  {
    id: '19',
    title: 'Update third-party dependencies',
    description: 'Audit and update all npm packages to latest stable versions. Run full test suite after each update.',
    status: 'done',
    priority: 'low',
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-02-20T16:00:00Z',
  },
  {
    id: '20',
    title: 'Create team dashboard view',
    description: 'Build a dashboard showing team-wide task statistics, workload distribution, and upcoming deadlines.',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-20T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/**
 * Get a paginated, filtered, and sorted list of tasks.
 *
 * @param {object} params
 * @returns {Promise<{ tasks: Array, total: number, page: number, totalPages: number }>}
 */
export async function getTasks(params = {}) {
  await delay(200);

  const {
    search = '',
    status = '',
    priority = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 6,
  } = params;

  let filtered = [...tasks];

  // Search filter (title or description, case-insensitive)
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
    );
  }

  // Status filter
  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  // Priority filter
  if (priority) {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  // Sorting
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const statusOrder = { 'todo': 1, 'in-progress': 2, 'done': 3 };

  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case 'status':
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        break;
      case 'createdAt':
      default:
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const paginatedTasks = filtered.slice(start, start + limit);

  return {
    tasks: paginatedTasks,
    total,
    page: safePage,
    totalPages,
  };
}

/**
 * Get a single task by ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
export async function getTask(id) {
  await delay(150);

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new Error('Task not found');
  }

  return { ...task };
}

/**
 * Create a new task.
 *
 * @param {object} data - { title, description, status, priority }
 * @returns {Promise<object>}
 */
export async function createTask(data) {
  await delay(300);

  if (!data.title || !data.title.trim()) {
    throw new Error('Title is required');
  }

  const now = new Date().toISOString();
  const newTask = {
    id: generateId(),
    title: data.title.trim(),
    description: (data.description || '').trim(),
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);
  return { ...newTask };
}

/**
 * Update an existing task.
 *
 * @param {string} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
export async function updateTask(id, data) {
  await delay(300);

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  if (data.title !== undefined && !data.title.trim()) {
    throw new Error('Title is required');
  }

  tasks[index] = {
    ...tasks[index],
    ...data,
    title: data.title !== undefined ? data.title.trim() : tasks[index].title,
    description: data.description !== undefined ? data.description.trim() : tasks[index].description,
    updatedAt: new Date().toISOString(),
  };

  return { ...tasks[index] };
}

/**
 * Delete a task by ID.
 *
 * @param {string} id
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteTask(id) {
  await delay(200);

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  tasks.splice(index, 1);
  return { success: true };
}
