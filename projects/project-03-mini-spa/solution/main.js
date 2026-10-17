/**
 * main.js — Application Entry Point
 *
 * Wires together the store, router, and page components, then starts
 * the application.
 */

import { createRouter } from './modules/router.js';
import { createStore } from './modules/store.js';

import { HomePage } from './modules/components/home.js';
import { AboutPage } from './modules/components/about.js';
import { ContactPage } from './modules/components/contact.js';
import { NotFoundPage } from './modules/components/not-found.js';

// ---- 1. Create the central store ----------------------------------------
const store = createStore({
  currentPage: 'home',
  visits: 0,
  messages: [],
});

// ---- 2. Create the router -----------------------------------------------
const router = createRouter('#app');

// ---- 3. Register routes --------------------------------------------------
// Each component receives the store so it can read/write shared state.
router.addRoute('/', () => HomePage(store));
router.addRoute('/about', () => AboutPage(store));
router.addRoute('/contact', () => ContactPage(store));
router.addRoute('*', () => NotFoundPage());

// ---- 4. Start the router -------------------------------------------------
router.start();

// ---- 5. Track page visits ------------------------------------------------
// Increment the visit counter every time the page loads.
store.setState({ visits: store.getState().visits + 1 });

// Also increment on every hash change (i.e., every navigation).
window.addEventListener('hashchange', () => {
  store.setState({ visits: store.getState().visits + 1 });
});
