/**
 * Chapter 21 — Example: sanitize.js
 *
 * Run:  node examples-node/phase-03/ch-21-security/sanitize.js
 *
 * Implements a simple HTML sanitizer and demonstrates escaping techniques
 * for preventing XSS. Shows both basic escaping and a tag-allowlist approach.
 *
 * IMPORTANT: For production applications, use a battle-tested library like
 * DOMPurify. This example is educational — it illustrates the concepts but
 * does not cover all possible bypass techniques.
 *
 * Requires Node.js 18+.
 */

const header = (title) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(70)}\n`);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HTML Entity Escaping
// ═══════════════════════════════════════════════════════════════════════════════
header("1. escapeHTML — Entity Escaping");

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * This is the simplest and most effective defense when you want to display
 * user input as plain text. It replaces characters that have special meaning
 * in HTML with their entity equivalents.
 *
 * @param {string} str - The untrusted string to escape.
 * @returns {string} The escaped string, safe for insertion into HTML.
 */
function escapeHTML(str) {
  const escapeMap = {
    "&": "&amp;",   // Must be first to avoid double-escaping
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",  // Helps prevent closing tags in some contexts
    "`": "&#96;",   // Prevents template literal injection
  };

  return str.replace(/[&<>"'/`]/g, (char) => escapeMap[char]);
}

// Demonstrate with various XSS payloads
const testCases = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<div onmouseover="alert(\'XSS\')">hover me</div>',
  '<svg/onload=alert("XSS")>',
  'Hello, <b>world</b>!',
  'Normal text with no HTML',
  '"><script>alert(document.cookie)</script>',
  "javascript:alert('XSS')",
];

for (const input of testCases) {
  console.log(`  Input:   ${input}`);
  console.log(`  Escaped: ${escapeHTML(input)}`);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Tag-Based Sanitizer (Allowlist Approach)
// ═══════════════════════════════════════════════════════════════════════════════
header("2. sanitizeHTML — Allowlist Approach");

/**
 * Sanitizes HTML by allowing only specific safe tags and removing everything else.
 *
 * This is a simplified sanitizer for educational purposes. It:
 * - Allows a configurable set of safe tags (e.g., <b>, <i>, <em>, <strong>, <p>).
 * - Removes all attributes from allowed tags (preventing event handler injection).
 * - Strips all other tags entirely.
 *
 * WARNING: This is NOT production-ready. Use DOMPurify for real applications.
 *
 * @param {string} html - The untrusted HTML string.
 * @param {string[]} allowedTags - Array of allowed tag names.
 * @returns {string} The sanitized HTML string.
 */
function sanitizeHTML(html, allowedTags = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"]) {
  const allowedSet = new Set(allowedTags.map((t) => t.toLowerCase()));

  // Step 1: Remove all attributes from tags (event handlers, style, etc.)
  // This regex matches opening tags with attributes
  let sanitized = html.replace(/<(\w+)([^>]*)>/g, (match, tagName, attributes) => {
    const tag = tagName.toLowerCase();
    if (allowedSet.has(tag)) {
      // Keep the tag but strip ALL attributes
      return `<${tag}>`;
    }
    // Not in allowlist — remove the tag entirely
    return "";
  });

  // Step 2: Remove disallowed closing tags
  sanitized = sanitized.replace(/<\/(\w+)>/g, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (allowedSet.has(tag)) {
      return `</${tag}>`;
    }
    return "";
  });

  return sanitized;
}

console.log("  Allowed tags: <b>, <i>, <em>, <strong>, <p>, <br>, <ul>, <ol>, <li>\n");

const sanitizeTests = [
  {
    label: "Script tag (removed)",
    input: '<p>Hello</p><script>alert("XSS")</script><p>World</p>',
  },
  {
    label: "Safe formatting (kept, attributes stripped)",
    input: '<b style="color:red" onclick="alert()">Bold</b> and <i>italic</i>',
  },
  {
    label: "Image with onerror (removed)",
    input: 'Check this: <img src=x onerror=alert("XSS")> cool right?',
  },
  {
    label: "Nested list (safe tags kept)",
    input: '<ul><li>Item 1</li><li>Item 2</li></ul>',
  },
  {
    label: "Div with event handler (removed)",
    input: '<div onmouseover="alert()">Content</div>',
  },
  {
    label: "Mixed safe and unsafe",
    input: '<p>Paragraph</p><iframe src="evil.com"></iframe><em>emphasis</em>',
  },
];

for (const { label, input } of sanitizeTests) {
  console.log(`  ${label}:`);
  console.log(`    Input:     ${input}`);
  console.log(`    Sanitized: ${sanitizeHTML(input)}`);
  console.log();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. URL Sanitization
// ═══════════════════════════════════════════════════════════════════════════════
header("3. sanitizeURL — Preventing javascript: URLs");

/**
 * Validates and sanitizes a URL to prevent javascript: and data: protocol attacks.
 *
 * @param {string} url - The URL to validate.
 * @returns {string|null} The safe URL, or null if the URL is dangerous.
 */
function sanitizeURL(url) {
  try {
    const parsed = new URL(url, "https://example.com");

    // Only allow http and https protocols
    const safeProtocols = new Set(["http:", "https:", "mailto:"]);
    if (!safeProtocols.has(parsed.protocol)) {
      return null; // Blocked — dangerous protocol
    }

    return parsed.href;
  } catch {
    return null; // Invalid URL
  }
}

const urlTests = [
  "https://example.com/page",
  "http://example.com/page",
  "javascript:alert('XSS')",
  "data:text/html,<script>alert('XSS')</script>",
  "mailto:user@example.com",
  "vbscript:alert('XSS')",
  "/relative/path",
  "ftp://files.example.com/doc.pdf",
];

for (const url of urlTests) {
  const result = sanitizeURL(url);
  const status = result !== null ? "ALLOWED" : "BLOCKED";
  console.log(`  ${status.padEnd(8)} ${url}`);
  if (result !== null && result !== url) {
    console.log(`           -> ${result}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CSP Header Builder
// ═══════════════════════════════════════════════════════════════════════════════
header("4. buildCSP — Content Security Policy Header Builder");

/**
 * Builds a Content-Security-Policy header string from a policy object.
 *
 * @param {Record<string, string[]>} policy - Directive name to source values.
 * @returns {string} The CSP header value.
 */
function buildCSP(policy) {
  return Object.entries(policy)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

const strictPolicy = buildCSP({
  "default-src": ["'self'"],
  "script-src": ["'self'"],
  "style-src": ["'self'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "img-src": ["'self'", "https:", "data:"],
  "connect-src": ["'self'", "https://api.example.com"],
  "frame-src": ["'none'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
});

console.log("  Example strict CSP header:\n");
console.log(`  Content-Security-Policy: ${strictPolicy}\n`);

console.log("  Broken down by directive:\n");
const directives = strictPolicy.split("; ");
for (const directive of directives) {
  console.log(`    ${directive}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Cookie Security Flags
// ═══════════════════════════════════════════════════════════════════════════════
header("5. Cookie Security Comparison");

{
  const cookies = [
    {
      header: "Set-Cookie: session=abc123",
      flags: ["No flags"],
      risk: "HIGH — accessible to JS, sent over HTTP, sent cross-site",
    },
    {
      header: "Set-Cookie: session=abc123; HttpOnly",
      flags: ["HttpOnly"],
      risk: "MEDIUM — not accessible to JS, but sent over HTTP and cross-site",
    },
    {
      header: "Set-Cookie: session=abc123; HttpOnly; Secure",
      flags: ["HttpOnly", "Secure"],
      risk: "LOW — not accessible to JS, HTTPS only, but still sent cross-site",
    },
    {
      header: "Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict",
      flags: ["HttpOnly", "Secure", "SameSite=Strict"],
      risk: "LOWEST — not accessible to JS, HTTPS only, never sent cross-site",
    },
  ];

  for (const { header: cookieHeader, flags, risk } of cookies) {
    console.log(`  ${cookieHeader}`);
    console.log(`    Flags: ${flags.join(", ")}`);
    console.log(`    Risk:  ${risk}\n`);
  }

  console.log("  Always use all three flags (HttpOnly, Secure, SameSite) for session cookies.");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. npm audit Reminder
// ═══════════════════════════════════════════════════════════════════════════════
header("6. Dependency Security Quick Reference");

{
  const commands = [
    ["npm audit", "Check for known vulnerabilities"],
    ["npm audit fix", "Auto-fix vulnerabilities where possible"],
    ["npm audit fix --force", "Force-fix (may introduce breaking changes)"],
    ["npm audit --production", "Audit only production dependencies"],
    ["npm outdated", "Show packages with available updates"],
    ["npm ls --depth=0", "List top-level dependencies"],
  ];

  for (const [cmd, desc] of commands) {
    console.log(`  ${cmd.padEnd(30)} ${desc}`);
  }

  console.log("\n  Run 'npm audit' regularly. Fix vulnerabilities promptly.");
  console.log("  Minimize dependencies — every package is a potential attack surface.");
}

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n--- End of sanitize.js ---\n");
