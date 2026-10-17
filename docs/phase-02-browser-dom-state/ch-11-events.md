# Chapter 11 — Events

## Learning Objectives

By the end of this chapter you will be able to:

- Attach and remove event listeners using `addEventListener` and `removeEventListener`.
- Describe the three phases of event flow: capture, target, and bubble.
- Use `stopPropagation` and `stopImmediatePropagation` to control event flow.
- Implement event delegation to handle events on dynamic child elements efficiently.
- Work with common event types: `click`, `input`, `submit`, `keydown`, `focus`, `blur`, `mouseover`, `mouseout`.
- Create and dispatch custom events using `CustomEvent`.
- Use listener options: `once`, `passive`, `capture`, and `signal` for AbortController-based removal.

---

## 11.1 addEventListener

The modern way to listen for events is `addEventListener`. It allows multiple listeners per event and fine-grained control:

```js
const button = document.querySelector("#save-btn");

function handleClick(event) {
  console.log("Button clicked!", event.type);
}

button.addEventListener("click", handleClick);
```

### The Event Object

Every listener receives an `event` object with useful properties:

| Property | Description |
|---|---|
| `event.type` | The event name (e.g., `"click"`) |
| `event.target` | The element that **originated** the event |
| `event.currentTarget` | The element the listener is **attached to** |
| `event.timeStamp` | When the event was created (milliseconds) |
| `event.preventDefault()` | Cancels the default browser action |
| `event.stopPropagation()` | Stops the event from propagating further |

```js
document.querySelector("a").addEventListener("click", (event) => {
  event.preventDefault();  // prevent navigation
  console.log("Link to:", event.target.href);
});
```

---

## 11.2 Event Flow: Capture, Target, Bubble

When an event fires, it travels through the DOM in three phases:

```
                    │ CAPTURE phase (top → target)
                    ▼
    ┌─────────────────────────────┐
    │  window                     │
    │  ┌───────────────────────┐  │
    │  │  document              │  │
    │  │  ┌─────────────────┐  │  │
    │  │  │  <body>          │  │  │
    │  │  │  ┌────────────┐  │  │  │
    │  │  │  │ <div>       │  │  │  │
    │  │  │  │  ┌───────┐  │  │  │  │
    │  │  │  │  │ <btn>  │◄─┼──┼──┼── TARGET phase
    │  │  │  │  └───────┘  │  │  │  │
    │  │  │  └────────────┘  │  │  │
    │  │  └─────────────────┘  │  │
    │  └───────────────────────┘  │
    └─────────────────────────────┘
                    │ BUBBLE phase (target → top)
                    ▼
```

1. **Capture** — the event travels from `window` down to the target element.
2. **Target** — the event reaches the element that was directly interacted with.
3. **Bubble** — the event travels back up from the target to `window`.

By default, listeners fire during the **bubble** phase. To listen during capture, pass `{ capture: true }`:

```js
parent.addEventListener("click", handler, { capture: true });
// shorthand:
parent.addEventListener("click", handler, true);
```

---

## 11.3 stopPropagation and stopImmediatePropagation

### stopPropagation

Prevents the event from continuing to the next element in the propagation chain:

```js
child.addEventListener("click", (e) => {
  e.stopPropagation();  // parent's click listener will NOT fire
  console.log("Only child handles this");
});
```

### stopImmediatePropagation

Prevents both propagation **and** any remaining listeners on the same element:

```js
button.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("First listener runs");
});

button.addEventListener("click", () => {
  console.log("This will NEVER run");
});
```

Use these sparingly — they make debugging harder because other code expecting to see the event will silently miss it.

---

## 11.4 Event Delegation

Instead of attaching a listener to every child element, attach one listener to a shared parent and use `event.target` to determine which child was clicked:

```js
const list = document.querySelector("ul.todo-list");

list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;  // click was not on an <li>
  if (!list.contains(item)) return;  // safety check

  item.classList.toggle("completed");
});
```

### Why Delegation?

- **Performance** — one listener instead of hundreds.
- **Dynamic elements** — new children added later are automatically handled.
- **Simplicity** — one place to manage the logic.

### The `closest()` Pattern

`event.target` may be a nested element inside the one you care about. Use `closest()` to walk up to the intended target:

```js
// <li><span class="icon">✓</span> Buy milk</li>
// A click on the <span> gives event.target = <span>
// event.target.closest("li") gives the <li>
```

---

## 11.5 Common Event Types

### Mouse Events

| Event | Fires when... |
|---|---|
| `click` | Element is clicked (mousedown + mouseup) |
| `dblclick` | Element is double-clicked |
| `mousedown` / `mouseup` | Mouse button is pressed / released |
| `mouseover` / `mouseout` | Pointer enters / leaves element (bubbles) |
| `mouseenter` / `mouseleave` | Pointer enters / leaves element (does NOT bubble) |
| `mousemove` | Pointer moves over element |
| `contextmenu` | Right-click (or context menu key) |

### Keyboard Events

| Event | Fires when... |
|---|---|
| `keydown` | Any key is pressed (repeats if held) |
| `keyup` | A key is released |

```js
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    save();
  }
});
```

### Form Events

| Event | Fires when... |
|---|---|
| `submit` | Form is submitted |
| `input` | Value of `<input>`, `<textarea>`, or `<select>` changes |
| `change` | Value changes AND element loses focus |
| `focus` / `blur` | Element gains / loses focus |

### Other Useful Events

| Event | Fires when... |
|---|---|
| `DOMContentLoaded` | HTML is parsed; DOM is ready (no images/CSS yet) |
| `load` | Everything (images, CSS, iframes) has loaded |
| `scroll` | Element or window is scrolled |
| `resize` | Window is resized |
| `transitionend` | CSS transition completes |
| `animationend` | CSS animation completes |

---

## 11.6 Custom Events

Create and dispatch your own events to decouple components:

```js
// Creating a custom event
const event = new CustomEvent("todo:added", {
  detail: { id: 1, text: "Buy groceries" },
  bubbles: true,     // allow it to bubble up
  cancelable: true,  // allow preventDefault
});

// Dispatching
todoList.dispatchEvent(event);

// Listening
document.addEventListener("todo:added", (e) => {
  console.log("New todo:", e.detail.text);
});
```

### Naming Convention

Use a namespace prefix (e.g., `app:`, `todo:`, `ui:`) to distinguish custom events from native events.

---

## 11.7 Listener Options

### once

The listener fires at most once, then removes itself automatically:

```js
button.addEventListener("click", handleFirstClick, { once: true });
```

### passive

Tells the browser the listener will **never** call `preventDefault()`, allowing scroll performance optimizations:

```js
window.addEventListener("scroll", handleScroll, { passive: true });
```

If you call `preventDefault()` inside a passive listener, the browser ignores it and logs a console warning.

### signal (AbortController)

Use an `AbortController` to remove multiple listeners at once:

```js
const controller = new AbortController();

element.addEventListener("click", onClick, { signal: controller.signal });
element.addEventListener("keydown", onKey, { signal: controller.signal });
window.addEventListener("resize", onResize, { signal: controller.signal });

// Later — remove all three listeners at once:
controller.abort();
```

---

## 11.8 removeEventListener

To remove a listener, you must pass the **exact same function reference** and matching options:

```js
function handleClick(e) { /* ... */ }

button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);  // works

// This does NOT work — anonymous functions have no shared reference:
button.addEventListener("click", (e) => { /* ... */ });
button.removeEventListener("click", (e) => { /* ... */ });  // different function!
```

For modern code, prefer `AbortController` (see above) over manual `removeEventListener`.

---

## Tricky Things & Gotchas

1. **`event.target` vs `event.currentTarget`** — `target` is the element that was actually clicked (could be a deeply nested child). `currentTarget` is the element the listener is attached to. They are only the same when the event has reached the element it was registered on.

2. **Lost `this` in arrow functions** — arrow function listeners do not have their own `this`. If you need `this` to refer to the element, use a regular function: `element.addEventListener("click", function() { this.classList.toggle("active"); })`.

3. **Passive scroll listeners** — Chrome and other browsers default `touchstart` and `touchmove` listeners on `document` to passive. If you need `preventDefault()` for these events (e.g., to prevent pull-to-refresh), you must explicitly pass `{ passive: false }`.

4. **Event listener leaks** — adding listeners without removing them (e.g., in a component that mounts and unmounts) causes memory leaks. Use `AbortController` or track references for cleanup.

5. **`submit` event and Enter key** — pressing Enter inside a single text input triggers `submit` on the form. If you have a button with `type="button"` it will NOT trigger submit, but `type="submit"` (or no type attribute) will.

6. **`focus` and `blur` do not bubble** — use `focusin` and `focusout` instead if you need delegation.

---

## Best Practices

- Use `addEventListener` instead of inline `onclick` attributes.
- Prefer event delegation for lists, tables, and other repeated elements.
- Always call `event.preventDefault()` when you handle a default action yourself (e.g., form submission, link navigation).
- Use named functions for listeners you need to remove later.
- Use `AbortController` for clean, centralized listener cleanup.
- Add `{ passive: true }` to scroll and touch listeners when you do not need `preventDefault`.
- Use `{ once: true }` for one-shot listeners instead of manually removing them.
- Namespace custom events (e.g., `cart:updated`) to avoid collisions.

---

## Exercises

1. **Click counter.** Create a button that displays the number of times it has been clicked. Update the button text on each click.

2. **Event flow logger.** Build a set of nested `<div>` elements. Attach click listeners in both capture and bubble phases on each. Log the phase and element name to visualize the full event flow.

3. **Delegated list.** Create a `<ul>` with several `<li>` items. Attach a single click listener on the `<ul>` that highlights the clicked `<li>` with a CSS class. Add a button that dynamically adds new `<li>` items and verify they work without extra listeners.

4. **Keyboard shortcuts.** Implement three keyboard shortcuts: `Ctrl+B` to toggle bold on a text area, `Escape` to close a modal, and `Ctrl+Enter` to submit. Prevent default browser behavior.

5. **Custom event bus.** Create a simple event bus using a hidden `<div>` element and `CustomEvent`. Implement `emit(name, data)` and `on(name, callback)` functions. Use it to communicate between two independent UI modules.

6. **Drag tracker.** Listen for `mousedown`, `mousemove`, and `mouseup` on a box element. Track the drag distance and direction. Display the offset in real time. Clean up `mousemove` and `mouseup` listeners when the drag ends.

7. **Debounced input.** Attach an `input` listener to a text field that logs the value, but debounce it so it only fires 300ms after the user stops typing. Use a named function and clearTimeout.

8. **Listener cleanup.** Create a component that adds three different event listeners when "Mount" is clicked and removes all of them when "Unmount" is clicked. Use `AbortController` for cleanup.

---

## Mini-Lab

Open the interactive example in [`../../examples-web/phase-02/ch-11-events/`](../../examples-web/phase-02/ch-11-events/) to see every concept from this chapter in action. Run it with:

```bash
npm run dev:events
```

The example page provides:
- A visual event flow diagram that highlights capture and bubble phases in real time
- An event delegation demo with a dynamic list
- A custom events communication panel
- A log panel showing every event as it fires

---

## What's Next

With DOM manipulation and events under your belt, Chapter 12 will show you how to build accessible, validated HTML forms — the primary way users send data to your application.
