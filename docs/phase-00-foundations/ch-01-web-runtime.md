# Chapter 1 — The Web Runtime

## Learning Objectives

By the end of this chapter you will be able to:

- Describe the step-by-step pipeline a browser follows to turn HTML, CSS, and JS into a visible, interactive page.
- Explain the event loop at a high level — call stack, task queue, and microtask queue — and predict the order simple async snippets will execute.
- Choose the correct script-loading strategy (`<script>`, `defer`, `async`) for a given use case.
- Navigate the four most-used DevTools panels (Console, Elements, Network, Sources) to inspect and debug a page.

---

## 1.1 How Browsers Render a Page

When you type a URL and press Enter, the browser performs roughly these steps:

1. **Network request** — fetch the HTML document over HTTP(S).
2. **HTML parsing → DOM** — the parser reads tokens (`<div>`, `<p>`, text nodes) and builds the **Document Object Model**, a tree of objects that represents every element on the page.
3. **CSS parsing → CSSOM** — linked stylesheets and `<style>` blocks are parsed into the **CSS Object Model**, another tree that maps selectors to computed styles.
4. **Render tree** — the browser merges the DOM and CSSOM. Elements with `display: none` are excluded; everything else gets a layout box.
5. **Layout** — the engine calculates the exact position and size of every box (also called _reflow_).
6. **Paint & Composite** — pixels are drawn to layers, then composited to the screen.

> **Key takeaway:** JavaScript can touch the DOM at any point after it executes, which means a poorly placed script can block parsing and delay the first paint.

---

## 1.2 The Event Loop (High-Level)

JavaScript is **single-threaded** — only one piece of code runs at a time. The event loop is the mechanism that lets asynchronous work (timers, network responses, user clicks) coexist with that single thread.

Three structures to remember:

| Structure | What goes here | Example |
|---|---|---|
| **Call stack** | Currently executing functions | `main()` → `greet()` → `console.log()` |
| **Task queue** (macro) | Callbacks from `setTimeout`, DOM events, I/O | `setTimeout(() => { ... }, 0)` |
| **Microtask queue** | Callbacks from `Promise.then`, `queueMicrotask` | `fetch(url).then(handler)` |

**Execution order on every tick:**

1. Run whatever is on the call stack until it is empty.
2. Drain _all_ microtasks (promises).
3. Pick _one_ task from the task queue, push it onto the stack, repeat.

```js
console.log("A");               // 1 — call stack
setTimeout(() => console.log("B"), 0); // 3 — task queue
Promise.resolve().then(() => console.log("C")); // 2 — microtask
// Output: A  C  B
```

---

## 1.3 Loading Scripts: regular, `defer`, `async`

Where and _how_ you include a `<script>` tag matters:

| Attribute | Parsing behaviour | Execution order | Best for |
|---|---|---|---|
| _(none)_ | **Blocks** HTML parsing while the script downloads and executes. | In document order | Legacy scripts, inline snippets |
| `defer` | Downloads **in parallel** with parsing; executes **after** the DOM is ready, before `DOMContentLoaded`. | In document order | App bundles that need the full DOM |
| `async` | Downloads **in parallel**; executes **as soon as** the download finishes (may interrupt parsing). | Whichever finishes first | Independent third-party scripts (analytics, ads) |

```html
<!-- blocks parsing — avoid in <head> unless necessary -->
<script src="app.js"></script>

<!-- best default for your own code -->
<script defer src="app.js"></script>

<!-- fire-and-forget, order doesn't matter -->
<script async src="analytics.js"></script>
```

> **Rule of thumb:** use `defer` for your application code and `async` only for scripts that are independent of everything else on the page.

---

## 1.4 DevTools Overview

Every modern browser ships with developer tools. Open them with **F12** or **Ctrl+Shift+I** (Cmd+Opt+I on macOS).

| Panel | What you use it for |
|---|---|
| **Console** | Run JS expressions, read `console.log` output, see errors and warnings. |
| **Elements** | Inspect and live-edit the DOM tree and computed CSS styles. |
| **Network** | See every HTTP request, its status code, size, timing, and response body. |
| **Sources** | Set breakpoints, step through code, watch variables, and inspect the call stack. |

Tips for beginners:

- Right-click any element on the page and choose **Inspect** to jump straight into the Elements panel.
- In the Console, type `$0` to reference the element currently selected in the Elements panel.
- The Network panel's **Waterfall** column shows you exactly what is blocking your page load.

---

## Tricky Things & Gotchas

1. **Scripts in `<head>` without `defer`** will block rendering. Users see a blank page until the script finishes downloading and executing. Always prefer `defer` or place scripts at the bottom of `<body>`.
2. **`setTimeout(fn, 0)` is not instant.** The callback goes into the task queue and waits for the current call stack _and_ all microtasks to finish first.
3. **DOM not ready yet?** If your script runs before the parser reaches an element, `document.getElementById("app")` returns `null`. Using `defer` or listening for `DOMContentLoaded` prevents this.
4. **Microtasks can starve the task queue.** A promise chain that endlessly queues new microtasks will block the browser from processing clicks or repaints.

---

## Best Practices

- Place `<script defer src="...">` in the `<head>` so the browser starts downloading early while still parsing HTML.
- Keep render-blocking resources (large synchronous scripts, unoptimized CSS) to a minimum.
- Use `console.log` freely while learning, but remove logging before shipping to production.
- Learn one DevTools shortcut per week — the investment compounds quickly.
- Profile _before_ you optimise: open the Network panel to find the real bottleneck instead of guessing.

---

## Exercises

> Phase 0 is theory-only — no runnable project code yet. Try these in any browser's DevTools console or a plain `.html` file.

1. **Predict the output.** Without running it, determine the log order and then verify in the console:
   ```js
   console.log("1");
   setTimeout(() => console.log("2"), 0);
   Promise.resolve().then(() => console.log("3"));
   console.log("4");
   ```

2. **Script loading experiment.** Create a minimal HTML file with three `<script>` tags — one regular, one `defer`, one `async` — each containing a single `console.log`. Reload several times and observe whether the order ever changes.

3. **DOM inspection.** Open any website, right-click a heading, choose _Inspect_, and use the Elements panel to change its text, colour, and font size. Take a screenshot of the result.

4. **Network waterfall.** Open the Network panel, navigate to a news website, and identify (a) the largest resource by file size and (b) the resource that took the longest to download. Note whether they are the same.

5. **Microtask vs. task race.** Write a snippet that queues a `setTimeout` callback and a `Promise.then` callback inside the same function. Add a `performance.now()` timestamp to each log to prove which fires first.

---

## What's Next

In [Chapter 2](./ch-02-developer-workflow.md) you will set up the tools you need for the rest of the course — VS Code, the terminal, Git, npm, and Node.js.

Once we reach Phase 1 you will start writing real code in the [`../../examples-node/phase-01/`](../../examples-node/phase-01/) directory.
