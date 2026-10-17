# Chapter 20 — Performance

## Learning Objectives

By the end of this chapter you will be able to:

- Describe the browser rendering pipeline (JS, Style, Layout, Paint, Composite).
- Explain what reflows and repaints are and how to minimize them.
- Use `requestAnimationFrame` for smooth visual updates.
- Implement debounce and throttle from scratch and explain when to use each.
- Apply lazy loading techniques for images and code (dynamic `import()`).
- Define the Core Web Vitals (LCP, INP, CLS) and explain why they matter.
- Use the Performance API to measure real execution times.
- Explain how bundle size affects load performance and how to keep it small.

---

## 20.1 The Rendering Pipeline

When the browser displays a web page, it follows a five-stage pipeline for every frame:

```
JavaScript → Style → Layout → Paint → Composite
```

### 1. JavaScript

Your code runs — event handlers, timers, API responses. Any DOM changes happen here.

### 2. Style Calculation

The browser matches CSS rules to elements and computes the final styles. Changing a class, adding inline styles, or modifying CSS custom properties triggers this step.

### 3. Layout (Reflow)

The browser calculates the **geometry** of every element — position, size, and how they affect each other. This is the most expensive step. Changing width, height, margin, padding, font-size, or adding/removing elements triggers layout.

### 4. Paint

The browser fills in pixels — backgrounds, text, images, borders, shadows. Changing color, background-color, or visibility triggers a repaint (without layout).

### 5. Composite

The browser assembles painted layers into the final image. Transforms (`transform`) and opacity changes only trigger compositing, which is the cheapest step.

### The Performance Goal

For 60fps animations, each frame has about **16.7ms**. Your JavaScript, layout, and paint must all finish within that budget. If they do not, the frame is dropped and the user sees jank.

---

## 20.2 Reflows and Repaints

### What Triggers a Reflow (Layout)?

Any change that affects the geometry of elements:

- Changing `width`, `height`, `margin`, `padding`, `border`
- Changing `font-size`, `line-height`
- Adding or removing DOM elements
- Changing `display` (e.g., `none` to `block`)
- Reading layout properties (`offsetWidth`, `clientHeight`, `getBoundingClientRect()`)

### What Triggers a Repaint (No Layout)?

Changes that affect appearance but not geometry:

- Changing `color`, `background-color`, `border-color`
- Changing `visibility` (but not `display`)
- Changing `box-shadow`, `outline`

### What Triggers Only Compositing?

- `transform` (translate, rotate, scale)
- `opacity`

These are the cheapest changes. For animations, prefer `transform` and `opacity` over properties that trigger layout.

### Forced Synchronous Layout (Layout Thrashing)

Reading a layout property forces the browser to calculate layout immediately, even if it was planning to batch it:

```js
// BAD — layout thrashing (read-write-read-write)
for (const el of elements) {
  const height = el.offsetHeight;   // FORCES layout calculation
  el.style.height = height * 2 + "px"; // invalidates layout
}

// GOOD — batch reads, then batch writes
const heights = elements.map((el) => el.offsetHeight); // all reads
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + "px"; // all writes
});
```

---

## 20.3 requestAnimationFrame

`requestAnimationFrame` (rAF) schedules a callback to run just before the next frame is painted. It is the correct way to perform visual updates:

```js
function animate(element) {
  let position = 0;

  function step() {
    position += 2;
    element.style.transform = `translateX(${position}px)`;

    if (position < 300) {
      requestAnimationFrame(step); // Schedule next frame
    }
  }

  requestAnimationFrame(step); // Start the animation
}
```

### Why Not setTimeout?

`setTimeout` does not sync with the display refresh rate. It may fire in the middle of a frame or at irregular intervals. `requestAnimationFrame`:

- Fires at the display refresh rate (typically 60fps).
- Is automatically paused when the tab is in the background (saving CPU and battery).
- Gives you a timestamp parameter for precise animations.

### Cancelling

```js
const id = requestAnimationFrame(callback);
cancelAnimationFrame(id);
```

---

## 20.4 Debounce and Throttle

Both techniques limit how often a function runs in response to frequent events (scroll, resize, input). They solve different problems.

### Debounce

**Debounce** delays execution until a "quiet period" — the function fires only after the user stops triggering the event for a specified duration.

Use case: search-as-you-type. Wait until the user stops typing before sending the API request.

```js
function debounce(fn, delayMs) {
  let timerId;

  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log("Searching for:", query);
  // fetch(`/api/search?q=${query}`)...
}, 300);

// Fires many times, but handleSearch only executes 300ms after the last call
input.addEventListener("input", (e) => handleSearch(e.target.value));
```

### Throttle

**Throttle** limits execution to at most once per interval — the function fires at a regular pace, no matter how often the event occurs.

Use case: scroll position tracking. Update at most every 100ms, not on every pixel scrolled.

```js
function throttle(fn, intervalMs) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= intervalMs) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 100);

window.addEventListener("scroll", handleScroll);
```

### When to Use Which

| Technique | Fires When | Use For |
|---|---|---|
| **Debounce** | After quiet period | Search input, form validation, window resize |
| **Throttle** | At regular intervals | Scroll tracking, mouse move, rate limiting |

---

## 20.5 Lazy Loading

### Lazy Loading Images

The `loading="lazy"` attribute defers loading off-screen images until the user scrolls near them:

```html
<img src="photo.jpg" loading="lazy" alt="A large photo" width="800" height="600">
```

Always set `width` and `height` to prevent layout shift when the image loads.

### Lazy Loading with Intersection Observer

For more control, use `IntersectionObserver`:

```js
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  }
});

document.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img));
```

### Lazy Loading Code (Dynamic Import)

Use dynamic `import()` to split code and load it on demand:

```js
// Only load the chart library when the user opens the dashboard
button.addEventListener("click", async () => {
  const { renderChart } = await import("./chart.js");
  renderChart(data);
});
```

Bundlers like Vite automatically create separate chunks for dynamic imports.

---

## 20.6 Core Web Vitals

Google's Core Web Vitals measure the real-world user experience. They affect SEO rankings and represent what users actually feel.

### LCP — Largest Contentful Paint

**What**: The time until the largest visible content element (image, text block, video) finishes rendering.

**Target**: Under 2.5 seconds.

**How to improve**:
- Optimize and compress images (use WebP/AVIF).
- Preload critical resources (`<link rel="preload">`).
- Remove render-blocking CSS and JavaScript.
- Use a CDN for static assets.

### INP — Interaction to Next Paint

**What**: The delay between a user interaction (click, tap, key press) and the next visual update. Replaced FID (First Input Delay) in 2024.

**Target**: Under 200 milliseconds.

**How to improve**:
- Keep event handlers fast. Avoid heavy computation in click handlers.
- Break long tasks into smaller chunks using `requestAnimationFrame` or `setTimeout(fn, 0)`.
- Use web workers for CPU-intensive operations.

### CLS — Cumulative Layout Shift

**What**: Measures unexpected layout shifts — elements moving after the page has started rendering.

**Target**: Under 0.1.

**How to improve**:
- Always set `width` and `height` on images and videos.
- Reserve space for dynamically loaded content (ads, embeds).
- Avoid inserting content above existing content.
- Use `transform` animations instead of animating `top`/`left`/`width`/`height`.

---

## 20.7 The Performance API

The Performance API lets you measure execution time programmatically:

### performance.now()

Returns a high-resolution timestamp in milliseconds:

```js
const start = performance.now();

// Code to measure...
heavyComputation();

const duration = performance.now() - start;
console.log(`Took ${duration.toFixed(2)}ms`);
```

### User Timing API (mark and measure)

Create named markers and measurements:

```js
performance.mark("fetch-start");

const data = await fetch("/api/data").then((r) => r.json());

performance.mark("fetch-end");
performance.measure("fetch-duration", "fetch-start", "fetch-end");

const [measurement] = performance.getEntriesByName("fetch-duration");
console.log(`Fetch took ${measurement.duration.toFixed(2)}ms`);
```

### PerformanceObserver

Observe performance entries as they happen:

```js
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
  }
});

observer.observe({ entryTypes: ["measure", "resource", "navigation"] });
```

### Navigation Timing

Measure page load performance:

```js
window.addEventListener("load", () => {
  const timing = performance.getEntriesByType("navigation")[0];

  console.log("DNS lookup:", timing.domainLookupEnd - timing.domainLookupStart, "ms");
  console.log("TCP connect:", timing.connectEnd - timing.connectStart, "ms");
  console.log("DOM interactive:", timing.domInteractive - timing.startTime, "ms");
  console.log("DOM complete:", timing.domComplete - timing.startTime, "ms");
  console.log("Full load:", timing.loadEventEnd - timing.startTime, "ms");
});
```

---

## 20.8 Bundle Size Awareness

Every kilobyte of JavaScript has a cost:

1. **Download** — more bytes over the network.
2. **Parse** — the browser must parse the JavaScript before executing it.
3. **Execute** — the code runs on the main thread, blocking rendering.

### Strategies to Keep Bundles Small

- **Tree-shaking** — bundlers remove unused exports. Use named imports, not `import *`.
- **Code splitting** — use dynamic `import()` for routes and features. Load code only when needed.
- **Audit dependencies** — check bundle impact before adding a package. Tools: `bundlephobia.com`, `npm ls`.
- **Replace heavy libraries** — use native APIs when possible (e.g., `fetch` instead of Axios, `Intl` instead of Moment.js).
- **Compression** — enable gzip or Brotli on your server. A 100KB JavaScript file may be 30KB compressed.
- **Analyze your bundle** — use `npx vite-bundle-visualizer` or `rollup-plugin-visualizer` to see what takes up space.

---

## Tricky Things & Gotchas

1. **Layout thrashing is invisible** — you will not see an error. The page just gets slower. Use Chrome DevTools Performance tab to spot forced reflows.

2. **`requestAnimationFrame` does not guarantee 60fps** — it fires at the display refresh rate, which could be 30fps on a slow device or 120fps on a high-refresh monitor. Use the timestamp parameter for frame-rate-independent animations.

3. **Debounce vs throttle confusion** — debounce waits for silence, throttle limits the rate. Using the wrong one leads to either sluggish UIs (debounce on scroll) or wasted API calls (throttle on search).

4. **`loading="lazy"` requires dimensions** — without `width` and `height`, the browser cannot reserve space, causing layout shift when images load.

5. **`performance.now()` precision varies** — browsers may reduce precision to mitigate timing attacks (Spectre). You may get values rounded to the nearest millisecond or 100 microseconds.

6. **Small bundles can still be slow** — a 50KB JavaScript file that blocks the main thread for 500ms is worse than a 200KB file that loads asynchronously. Execution time matters as much as size.

7. **Core Web Vitals are measured on real devices** — lab scores (Lighthouse) do not always match field data (Chrome User Experience Report). Always check both.

8. **Over-optimization is a trap** — profile first, optimize second. Do not rewrite working code for a theoretical 2ms improvement. Focus on the biggest bottlenecks.

---

## Best Practices

- Prefer `transform` and `opacity` for animations. They skip layout and paint.
- Batch DOM reads and writes to avoid layout thrashing.
- Use `requestAnimationFrame` for any visual updates, never `setTimeout`.
- Apply debounce to user input events (search, resize) and throttle to continuous events (scroll, mousemove).
- Lazy-load images with `loading="lazy"` and set explicit dimensions.
- Split code with dynamic `import()` for routes and heavy features.
- Measure before optimizing. Use the Performance tab in DevTools and the Performance API.
- Monitor Core Web Vitals in production with real-user monitoring (RUM).

---

## Exercises

1. **Layout thrashing detector.** Write a function that takes a list of elements, reads all their heights, then doubles all their heights. First write the naive (thrashing) version, then the batched version. Measure both with `performance.now()`.

2. **requestAnimationFrame animation.** Animate a `<div>` moving from left to right across the screen using only `requestAnimationFrame`. Use the timestamp parameter to move at a constant speed regardless of frame rate.

3. **Debounce from scratch.** Implement `debounce(fn, ms)`. Test it by logging rapid calls and verifying only the last one executes after the delay. Add a `cancel()` method to the returned function.

4. **Throttle from scratch.** Implement `throttle(fn, ms)`. Test it by calling the returned function 100 times in a tight loop and verifying it executes at most once per interval.

5. **Lazy image loader.** Using `IntersectionObserver`, create a lazy image loader that swaps `data-src` to `src` when an image enters the viewport. Test it with a page of 50 placeholder images.

6. **Performance measurement.** Write a function that sorts an array of 100,000 random numbers using different methods (`.sort()`, bubble sort, merge sort). Use `performance.mark` and `performance.measure` to compare their execution times.

7. **Bundle analysis.** Create a small Vite project, install three npm packages of varying sizes, and use `npx vite-bundle-visualizer` to visualize the bundle. Identify the largest dependency and find a lighter alternative.

8. **Web Vitals report.** Write a script that uses the `web-vitals` npm package to measure LCP, INP, and CLS on a page. Log the results and identify which metrics need improvement.

---

## Mini-Lab

Run the Node.js examples in [`../../examples-node/phase-03/ch-20-performance/`](../../examples-node/phase-03/ch-20-performance/):

```bash
node examples-node/phase-03/ch-20-performance/debounce-throttle.js
```

The example implements debounce and throttle from scratch and demonstrates their behavior with simulated rapid calls.

---

## What's Next

With performance knowledge in hand, Chapter 21 covers web security — protecting your applications from XSS, CSRF, and other common vulnerabilities.
