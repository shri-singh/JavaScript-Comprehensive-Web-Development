/**
 * about.js — About Page Component
 *
 * Exports: AboutPage(store)
 *
 * Displays information about the app and lists the techniques it demonstrates.
 */

/**
 * Creates the about page DOM element.
 *
 * @param {Object} store - The application store.
 * @returns {HTMLElement}
 */
export function AboutPage(store) {
  const page = document.createElement('div');
  page.className = 'page';

  const features = [
    {
      number: '1',
      title: 'Hash-Based Routing',
      description:
        'The app listens for <code>hashchange</code> events and swaps page content without a full reload.',
    },
    {
      number: '2',
      title: 'Component Architecture',
      description:
        'Each page is a plain function that returns a DOM element, making the code modular and easy to test.',
    },
    {
      number: '3',
      title: 'Central State Store',
      description:
        'A lightweight <code>getState</code> / <code>setState</code> / <code>subscribe</code> store keeps data in one place.',
    },
    {
      number: '4',
      title: 'Active Nav Highlighting',
      description:
        'The router automatically adds an <code>active</code> class to the nav link that matches the current route.',
    },
    {
      number: '5',
      title: '404 Handling',
      description:
        'Unrecognised routes are caught by a wildcard route and display a friendly "Not Found" page.',
    },
  ];

  const featureItems = features
    .map(
      (f) => `
      <li>
        <span class="feature-icon">${f.number}</span>
        <div>
          <strong>${f.title}</strong><br />
          <span style="color: var(--color-text-muted); font-size: 0.9rem;">
            ${f.description}
          </span>
        </div>
      </li>`
    )
    .join('');

  page.innerHTML = `
    <h1>About This Project</h1>
    <p class="subtitle">
      This Mini SPA is part of a comprehensive JavaScript web-development course.
      It demonstrates how modern single-page applications work at the lowest level
      &mdash; before frameworks like React or Vue add their abstractions.
    </p>

    <h2>What You Will Learn</h2>
    <ul class="feature-list">
      ${featureItems}
    </ul>
  `;

  return page;
}
