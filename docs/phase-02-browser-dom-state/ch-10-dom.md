# Chapter 10 — DOM Fundamentals

## Learning Objectives

By the end of this chapter you will be able to:

- Explain what the DOM is and how it relates to HTML source code.
- Select single and multiple elements using `getElementById`, `querySelector`, and `querySelectorAll`.
- Traverse the DOM tree using `parentElement`, `children`, `nextElementSibling`, and other traversal properties.
- Create, append, insert, replace, and remove elements programmatically.
- Modify element attributes, CSS classes, and inline styles through the DOM API.
- Distinguish between `innerHTML`, `textContent`, and `innerText` and choose the right one for each situation.
- Use `DocumentFragment` for efficient batch DOM operations.

---

## 10.1 What Is the DOM?

When the browser loads an HTML document, it parses the markup and builds an in-memory tree of objects called the **Document Object Model** (DOM). Every HTML tag becomes a **node** in this tree. The root is the `document` object, which gives you access to the entire tree.

The DOM is **not** the same as your HTML source code. The browser normalizes the markup (adds missing `<tbody>`, fixes nesting), and JavaScript can modify the tree at any time without changing the original file.

```
document
└── html
    ├── head
    │   └── title
    └── body
        ├── h1
        ├── p
        └── ul
            ├── li
            ├── li
            └── li
```

### Node Types

| Type | Constant | Example |
|---|---|---|
| Element | `Node.ELEMENT_NODE` (1) | `<div>`, `<p>`, `<span>` |
| Text | `Node.TEXT_NODE` (3) | Whitespace between tags, text inside elements |
| Comment | `Node.COMMENT_NODE` (8) | `<!-- comment -->` |
| Document | `Node.DOCUMENT_NODE` (9) | `document` |

Most of your work targets **element nodes**. Text nodes and comment nodes exist in the tree but are usually accessed indirectly through their parent element.

---

## 10.2 Selecting Elements

### getElementById

Returns a single element by its `id` attribute. Returns `null` if no match is found:

```js
const header = document.getElementById("main-header");
```

### querySelector

Returns the **first** element matching a CSS selector. Returns `null` if no match:

```js
const firstButton = document.querySelector("button.primary");
const nav = document.querySelector("#sidebar nav");
```

### querySelectorAll

Returns a **NodeList** of all matching elements. The list is **static** — it does not update when the DOM changes:

```js
const allItems = document.querySelectorAll("ul.todo-list > li");

// Iterate with for...of
for (const item of allItems) {
  console.log(item.textContent);
}

// Convert to array for array methods
const itemsArray = [...allItems];
```

### Older Methods (Still Useful)

| Method | Returns | Live? |
|---|---|---|
| `getElementsByClassName("foo")` | HTMLCollection | Yes |
| `getElementsByTagName("li")` | HTMLCollection | Yes |
| `getElementsByName("email")` | NodeList | Yes |

**Live** collections update automatically when the DOM changes. This can be useful but also surprising — modifying the DOM during iteration over a live collection can cause skipped or duplicated items.

---

## 10.3 Traversing the DOM

Once you have a reference to an element, you can navigate to its relatives:

### Parent

```js
const child = document.querySelector(".child");
const parent = child.parentElement;      // nearest parent element
const parentNode = child.parentNode;     // could be a non-element node (rare)
```

### Children

```js
const list = document.querySelector("ul");
const children = list.children;              // HTMLCollection of element children
const firstChild = list.firstElementChild;   // first element child
const lastChild = list.lastElementChild;     // last element child
const count = list.childElementCount;        // number of element children
```

### Siblings

```js
const second = list.children[1];
const next = second.nextElementSibling;      // next element sibling
const prev = second.previousElementSibling;  // previous element sibling
```

### closest()

Walks **up** the tree and returns the first ancestor (or the element itself) matching a selector:

```js
const button = document.querySelector("button");
const card = button.closest(".card");  // nearest ancestor with class "card"
```

---

## 10.4 Creating and Adding Elements

### createElement and append

```js
const p = document.createElement("p");
p.textContent = "Hello, DOM!";
p.classList.add("greeting");

document.body.append(p);   // adds as last child of <body>
```

### append vs appendChild

| Feature | `append()` | `appendChild()` |
|---|---|---|
| Accepts strings | Yes | No |
| Accepts multiple args | Yes | No |
| Returns | `undefined` | The appended node |

```js
const container = document.querySelector("#container");
container.append("Some text", document.createElement("br"), "More text");
```

### prepend, before, after, replaceWith

```js
const heading = document.querySelector("h1");

heading.before(newBanner);          // insert before h1
heading.after(subtitle);            // insert after h1
heading.replaceWith(newHeading);    // replace h1 entirely

const list = document.querySelector("ul");
list.prepend(newFirstItem);         // insert as first child
```

### insertAdjacentHTML

Parses an HTML string and inserts it at a specific position without affecting existing children:

```js
element.insertAdjacentHTML("beforebegin", "<p>Before</p>");  // before element
element.insertAdjacentHTML("afterbegin", "<p>First child</p>");
element.insertAdjacentHTML("beforeend", "<p>Last child</p>");
element.insertAdjacentHTML("afterend", "<p>After</p>");
```

---

## 10.5 Removing Elements

```js
const item = document.querySelector(".remove-me");
item.remove();  // removes from the DOM
```

The older pattern uses the parent:

```js
item.parentElement.removeChild(item);
```

### Clearing All Children

```js
const container = document.querySelector("#container");

// Option 1: replaceChildren with no arguments
container.replaceChildren();

// Option 2: set innerHTML to empty string
container.innerHTML = "";
```

---

## 10.6 Modifying Attributes

### getAttribute / setAttribute / removeAttribute

```js
const link = document.querySelector("a");
link.getAttribute("href");           // read
link.setAttribute("target", "_blank"); // write
link.removeAttribute("title");       // remove
link.hasAttribute("rel");            // boolean check
```

### Direct Property Access

Many HTML attributes map directly to element properties:

```js
const img = document.querySelector("img");
img.src = "/new-image.png";
img.alt = "A descriptive alt text";
```

### data-* Attributes (dataset)

```js
// <div data-user-id="42" data-role="admin">
const div = document.querySelector("div");
div.dataset.userId;   // "42"   (camelCased)
div.dataset.role;     // "admin"
div.dataset.active = "true";  // sets data-active="true"
```

---

## 10.7 Modifying Classes

The `classList` API is the modern way to manipulate CSS classes:

```js
const box = document.querySelector(".box");

box.classList.add("highlight", "animate");
box.classList.remove("hidden");
box.classList.toggle("active");        // add if absent, remove if present
box.classList.toggle("dark", isDark);  // force add/remove based on boolean
box.classList.contains("highlight");   // true
box.classList.replace("old", "new");   // swap one class for another
```

Avoid using `className` for manipulation — it replaces the entire class string:

```js
// Dangerous: wipes out all existing classes
box.className = "only-this-class";
```

---

## 10.8 Modifying Styles

### Inline Styles

The `style` property sets inline styles. Property names are camelCased:

```js
const box = document.querySelector(".box");
box.style.backgroundColor = "coral";
box.style.padding = "1rem";
box.style.borderRadius = "8px";
```

### Reading Computed Styles

Inline styles only reflect what is set directly on the element. To read the final computed value (including CSS stylesheet rules), use `getComputedStyle`:

```js
const styles = getComputedStyle(box);
console.log(styles.color);         // "rgb(0, 0, 0)"
console.log(styles.fontSize);      // "16px"
```

### CSS Custom Properties

```js
document.documentElement.style.setProperty("--primary", "#3b82f6");
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue("--primary");
```

---

## 10.9 innerHTML vs textContent vs innerText

| Property | Parses HTML? | Includes hidden text? | Performance |
|---|---|---|---|
| `innerHTML` | Yes — returns/sets markup | N/A (returns HTML string) | Slower (parser runs) |
| `textContent` | No — treats everything as text | Yes (includes `display:none`) | Fast |
| `innerText` | No — treats everything as text | No (respects CSS visibility) | Slow (triggers reflow) |

### Security Warning

Setting `innerHTML` with user-supplied content is a **cross-site scripting (XSS)** vulnerability:

```js
// DANGEROUS — never do this with untrusted input
container.innerHTML = userInput;

// SAFE — textContent escapes HTML automatically
container.textContent = userInput;
```

Use `textContent` when you need to display plain text. Use `innerHTML` only with trusted, sanitized content.

---

## 10.10 DocumentFragment for Batch Operations

Every time you append an element to the live DOM, the browser may recalculate layout. For bulk insertions, build elements in a `DocumentFragment` first, then append the fragment in a single operation:

```js
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i + 1}`;
  fragment.append(li);
}

document.querySelector("ul").append(fragment);  // one DOM update
```

When the fragment is appended, its children are moved into the DOM and the fragment becomes empty. Fragments themselves never appear in the rendered page.

### Modern Alternative: replaceChildren

```js
const items = data.map((text) => {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
});

list.replaceChildren(...items);  // clears old children and adds new ones
```

---

## Tricky Things & Gotchas

1. **`querySelectorAll` returns a static NodeList** — if you add or remove elements after the query, the list does not change. `getElementsByClassName` returns a live HTMLCollection that does update, which can cause infinite loops if you modify the DOM during iteration.

2. **`innerHTML` destroys and recreates all child nodes** — even setting `container.innerHTML += '<p>new</p>'` rebuilds every existing child, removing event listeners and resetting form state. Use `append` or `insertAdjacentHTML` instead.

3. **`innerText` triggers a reflow** — it computes CSS visibility to determine which text to return. In performance-sensitive code, prefer `textContent`.

4. **Whitespace text nodes** — `childNodes` includes text nodes created by whitespace between tags. Use `children` (element-only) to avoid them.

5. **`id` as a global variable** — browsers create global variables for elements with `id` attributes (e.g., `<div id="app">` creates `window.app`). Never rely on this — it conflicts with other globals and is not guaranteed across browsers.

6. **`style` only reads inline styles** — `element.style.color` returns an empty string if the color is set via a stylesheet. Use `getComputedStyle()` to read the resolved value.

---

## Best Practices

- Prefer `querySelector` / `querySelectorAll` for their CSS selector flexibility.
- Cache DOM references in variables rather than querying the DOM repeatedly inside loops.
- Use `textContent` instead of `innerHTML` for plain text to avoid XSS vulnerabilities.
- Build DOM subtrees in a `DocumentFragment` or off-DOM element, then attach in one operation.
- Use `classList` methods instead of manipulating `className` directly.
- Keep DOM manipulation minimal — batch reads and writes to avoid layout thrashing.
- Use `data-*` attributes and `dataset` for embedding custom data rather than inventing non-standard attributes.
- Prefer `append` / `prepend` / `before` / `after` / `replaceWith` over older `appendChild` / `insertBefore`.

---

## Exercises

1. **Element inspector.** Write a function `inspectElement(selector)` that takes a CSS selector, finds the element, and logs: its tag name, number of children, list of classes, and all `data-*` attribute values.

2. **List builder.** Create a function `buildList(items)` that takes an array of strings and returns a `<ul>` element with `<li>` children. Use a `DocumentFragment` for efficiency. Append the result to the page.

3. **DOM navigator.** Given a deeply nested element, write a function `getAncestorChain(element)` that returns an array of tag names from the element up to `<html>`. Example: `["SPAN", "P", "DIV", "BODY", "HTML"]`.

4. **Class toggler.** Build a function `toggleTheme()` that toggles a `dark` class on `<body>` and updates a `<button>` label between "Switch to Dark" and "Switch to Light".

5. **Safe HTML renderer.** Write a `renderUserComment(container, comment)` function that safely renders a comment object `{ author, text, timestamp }` without using `innerHTML`. Create elements programmatically and use `textContent` for user content.

6. **Table generator.** Write a function `createTable(headers, rows)` that takes an array of header strings and a 2D array of row data, builds an HTML `<table>` with `<thead>` and `<tbody>`, and returns it. Do not use `innerHTML`.

7. **Attribute copier.** Write a function `copyAttributes(source, target)` that copies all attributes from one element to another using `getAttributeNames()` and `getAttribute()`.

8. **Performance comparison.** Write code that inserts 5000 list items using three methods: (a) appending one at a time to the live DOM, (b) using `innerHTML` with string concatenation, (c) using a `DocumentFragment`. Measure each with `performance.now()` and log the results.

---

## Mini-Lab

Open the interactive example in [`../../examples-web/phase-02/ch-10-dom/`](../../examples-web/phase-02/ch-10-dom/) to see every concept from this chapter in action. Run it with:

```bash
npm run dev:dom
```

The example page provides:
- A panel of elements you can select, traverse, and inspect
- Buttons to create, append, modify, and remove elements in real time
- A live output log showing every DOM operation and its result

---

## What's Next

Now that you can find, create, and modify elements in the DOM, Chapter 11 will teach you how to respond to user interactions through the event system — `addEventListener`, event propagation, delegation, and custom events.
