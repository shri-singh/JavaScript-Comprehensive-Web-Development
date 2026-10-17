// main.js — Application entry point
// TODO: Import router from './modules/router.js'
// TODO: Import auth module from './modules/auth.js'
// TODO: Import store from './modules/store.js'
// TODO: Import page components (login, dashboard, task-form)

/**
 * Initialize the application.
 *
 * Steps:
 * 1. Create the app store with initial state
 * 2. Check if user is authenticated
 * 3. Update the header (show/hide logout button and username)
 * 4. Create the router and register routes with guards
 * 5. Start the router
 */
function initApp() {
  // TODO: Create the store with initial state:
  //   { tasks: [], filters: { search: '', status: '', priority: '', sortBy: 'createdAt', sortOrder: 'desc' },
  //     pagination: { page: 1, limit: 6, total: 0, totalPages: 0 },
  //     user: null, loading: false, error: null }

  // TODO: Update header UI based on auth state
  // updateHeader();

  // TODO: Create router instance and register routes:
  //   '#/login'           -> renders LoginPage
  //   '#/dashboard'       -> renders DashboardPage (guarded)
  //   '#/tasks/new'       -> renders TaskForm for creation (guarded)
  //   '#/tasks/:id/edit'  -> renders TaskForm for editing (guarded)
  //   Default route: redirect to #/dashboard if authenticated, else #/login

  // TODO: Start the router
  // router.start();
}

/**
 * Update the header to show/hide user info and logout button.
 */
function updateHeader() {
  const headerRight = document.getElementById('header-right');
  const mainNav = document.getElementById('main-nav');

  // TODO: If authenticated, show username and a logout button in headerRight
  //       Also show the nav links
  // TODO: If not authenticated, clear headerRight and hide nav
}

// Boot the app when the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
