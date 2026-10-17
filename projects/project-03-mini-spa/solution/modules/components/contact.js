/**
 * contact.js — Contact Page Component
 *
 * Exports: ContactPage(store)
 *
 * Displays a contact form and a list of previously submitted messages.
 * Messages are saved into the central store so they persist across
 * in-session page navigations.
 */

/**
 * Creates the contact page DOM element.
 *
 * @param {Object} store - The application store.
 * @returns {HTMLElement}
 */
export function ContactPage(store) {
  const page = document.createElement('div');
  page.className = 'page';

  // --- Build the static shell ---
  page.innerHTML = `
    <h1>Contact</h1>
    <p class="subtitle">
      Send us a message using the form below. Messages are stored in the
      central store and will remain visible as long as the page is open.
    </p>

    <form id="contact-form" novalidate>
      <div class="form-group">
        <label for="contact-name">Name</label>
        <input type="text" id="contact-name" placeholder="Your name" required />
      </div>
      <div class="form-group">
        <label for="contact-email">Email</label>
        <input type="email" id="contact-email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label for="contact-message">Message</label>
        <textarea id="contact-message" placeholder="Write your message here..." required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Send Message</button>
    </form>

    <div class="messages-list" id="messages-section"></div>
  `;

  // --- References ---
  const form = page.querySelector('#contact-form');
  const messagesSection = page.querySelector('#messages-section');

  // --- Render the messages list ---
  function renderMessages() {
    const { messages } = store.getState();

    if (messages.length === 0) {
      messagesSection.innerHTML = '';
      return;
    }

    const items = messages
      .slice()
      .reverse()
      .map(
        (msg) => `
        <div class="message-item">
          <div class="message-meta">
            <strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt;
            &mdash; ${msg.timestamp}
          </div>
          <div class="message-body">${escapeHtml(msg.message)}</div>
        </div>`
      )
      .join('');

    messagesSection.innerHTML = `
      <h2>Submitted Messages (${messages.length})</h2>
      ${items}
    `;
  }

  // --- Form submission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const message = form.querySelector('#contact-message').value.trim();

    // Basic validation
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }

    // Build the message object
    const newMessage = {
      name,
      email,
      message,
      timestamp: new Date().toLocaleString(),
    };

    // Save to store
    const currentMessages = store.getState().messages;
    store.setState({ messages: [...currentMessages, newMessage] });

    // Reset the form
    form.reset();

    // Re-render the messages list
    renderMessages();
  });

  // Initial render of existing messages
  renderMessages();

  return page;
}

/* ---------- Helpers ---------- */

/**
 * Escapes HTML special characters to prevent XSS when inserting user input.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
