// main.js — Application entry point

import { createRouter } from './modules/router.js';
import { isAuthenticated, getUser, logout, requireAuth } from './modules/auth.js';
import { createStore } from './modules/store.js';
import { LoginPage } from './modules/components/login.js';
import { DashboardPage } from './modules/components/dashboard.js';
import { TaskForm } from './modules/components/task-form.js';

// ---------------------------------------------------------------------------
// Application state
// ---------------------------------------------------------------------------

const store = createStore({
  tasks: [],
  filters: {
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  },
  user: null,
  loading: false,
  error: null,
});

// ---------------------------------------------------------------------------
// Initialize
// ---------------------------------------------------------------------------

function initApp() {
  updateHeader();

  const router = createRouter('#app');

  // Public route
  router.addRoute('#/login', () => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated()) {
      window.location.hash = '#/dashboard';
      return document.createElement('div');
    }
    return LoginPage();
  });

  // Protected routes
  router.addRoute('#/dashboard', () => DashboardPage(store), {
    guard: requireAuth,
  });

  router.addRoute('#/tasks/new', () => TaskForm(store), {
    guard: requireAuth,
  });

  router.addRoute('#/tasks/:id/edit', (params) => TaskForm(store, params.id), {
    guard: requireAuth,
  });

  router.start();

  // Listen for auth changes to update the header
  window.addEventListener('auth-change', () => {
    updateHeader();
  });

  // Also update header on hash change (covers logout/login navigation)
  window.addEventListener('hashchange', () => {
    updateHeader();
  });

  // Default route
  if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
    window.location.hash = isAuthenticated() ? '#/dashboard' : '#/login';
  }
}

// ---------------------------------------------------------------------------
// Header management
// ---------------------------------------------------------------------------

function updateHeader() {
  const headerRight = document.getElementById('header-right');
  const mainNav = document.getElementById('main-nav');

  if (!headerRight) return;

  headerRight.innerHTML = '';

  if (isAuthenticated()) {
    const user = getUser();

    // Show nav
    if (mainNav) {
      mainNav.style.display = 'flex';
    }

    // User name
    if (user) {
      const userName = document.createElement('span');
      userName.className = 'user-name';
      userName.textContent = `Hello, ${user.username}`;
      headerRight.appendChild(userName);
    }

    // Logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline btn-sm';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => {
      logout();
      updateHeader();
    });
    headerRight.appendChild(logoutBtn);
  } else {
    // Hide nav when logged out
    if (mainNav) {
      mainNav.style.display = 'none';
    }
  }
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', initApp);
