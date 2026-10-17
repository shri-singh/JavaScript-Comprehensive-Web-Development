/**
 * contact.js — Contact Page Component
 *
 * Exports: ContactPage(store)
 *
 * This component creates and returns a DOM element for the contact page.
 * It should display:
 *  - A page heading
 *  - A contact form with name, email, and message fields
 *  - A submit handler that saves the message to the store
 *  - A list of previously submitted messages (read from the store)
 *
 * @param {Object} store - The application store.
 * @returns {HTMLElement} The contact page DOM element.
 */
export function ContactPage(store) {
  // TODO: Create a container element (e.g., <div class="page">)

  // TODO: Add a heading (e.g., <h1>Contact</h1>)

  // TODO: Add a subtitle paragraph

  // TODO: Create a <form> element with:
  //   - A "Name" text input      (form-group)
  //   - An "Email" email input   (form-group)
  //   - A "Message" textarea     (form-group)
  //   - A submit button          (btn btn-primary)

  // TODO: Add a submit event listener to the form:
  //   1. Prevent the default form submission.
  //   2. Read the input values.
  //   3. Validate that all fields are filled in.
  //   4. Create a message object with name, email, message, and timestamp.
  //   5. Get the current messages array from the store.
  //   6. Call store.setState() with the updated messages array.
  //   7. Reset the form fields.
  //   8. Re-render the messages list below the form.

  // TODO: Create a section to display submitted messages.
  //   - Read store.getState().messages
  //   - For each message, create a message-item element showing
  //     the sender name, timestamp, and message body.

  // TODO: Return the container element
}
