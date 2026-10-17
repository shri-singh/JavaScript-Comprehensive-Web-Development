// ──────────────────────────────────────────────
// Chapter 10 — DOM Fundamentals: Interactive Demo
// ──────────────────────────────────────────────

// ── Logging Utility ──────────────────────────
const logPanel = document.querySelector("#log");

function log(label, message) {
  const entry = document.createElement("div");
  entry.classList.add("log-entry");
  entry.innerHTML = `<span class="log-label">[${label}]</span> ${escapeHtml(String(message))}`;
  logPanel.prepend(entry);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── 1. Selecting Elements ────────────────────

function demoSelectById() {
  const el = document.getElementById("intro-text");
  log("getElementById", `Found: <${el.tagName.toLowerCase()}> — "${el.textContent.trim()}"`);
  el.style.background = "#fff3cd";
  setTimeout(() => (el.style.background = ""), 1500);
}

function demoQuerySelector() {
  const el = document.querySelector(".fruit-list .fruit[data-color='purple']");
  log("querySelector", `Found: "${el.textContent}" with data-color="${el.dataset.color}"`);
  el.style.background = "#d4edda";
  setTimeout(() => (el.style.background = ""), 1500);
}

function demoQuerySelectorAll() {
  const items = document.querySelectorAll(".fruit");
  const names = [...items].map((el) => el.textContent);
  log("querySelectorAll", `Found ${items.length} items: ${names.join(", ")}`);

  items.forEach((el, i) => {
    setTimeout(() => {
      el.style.background = "#cce5ff";
      setTimeout(() => (el.style.background = ""), 800);
    }, i * 200);
  });
}

function demoGetElementsByClassName() {
  const collection = document.getElementsByClassName("fruit");
  log("getElementsByClassName", `Live HTMLCollection with ${collection.length} items (updates if DOM changes)`);

  // Show that it is live
  const tempLi = document.createElement("li");
  tempLi.className = "fruit";
  tempLi.textContent = "Temporary (live collection demo)";
  tempLi.dataset.color = "green";
  document.querySelector(".fruit-list").append(tempLi);
  log("getElementsByClassName", `After adding element: collection now has ${collection.length} items`);

  setTimeout(() => {
    tempLi.remove();
    log("getElementsByClassName", `After removing element: collection now has ${collection.length} items`);
  }, 2000);
}

// ── 2. Traversing the DOM ────────────────────

let currentNode = document.querySelector(".fruit-list");

function renderTree() {
  const tree = document.querySelector("#tree-display");
  const section = document.querySelector("#traversal-demo");

  function buildTree(node, depth = 0) {
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const indent = "  ".repeat(depth);
    const tag = node.tagName.toLowerCase();
    const id = node.id ? `#${node.id}` : "";
    const cls = node.className ? `.${[...node.classList].join(".")}` : "";
    const label = `${tag}${id}${cls}`;
    const isActive = node === currentNode;
    const openTag = isActive ? `<span class="active-node">&lt;${label}&gt;</span>` : `&lt;${label}&gt;`;

    let html = `${indent}${openTag}\n`;
    for (const child of node.children) {
      html += buildTree(child, depth + 1);
    }
    return html;
  }

  tree.innerHTML = buildTree(section);
  log("Traverse", `Current node: <${currentNode.tagName.toLowerCase()}> ${currentNode.id ? "#" + currentNode.id : ""} ${currentNode.className ? "." + [...currentNode.classList].join(".") : ""}`.trim());
}

function traverseTo(node, method) {
  if (node) {
    currentNode = node;
    renderTree();
  } else {
    log("Traverse", `${method} returned null — no element in that direction`);
  }
}

// Initial render
renderTree();

// ── 3. Creating & Removing Elements ──────────

let cardCount = 0;

function createCard() {
  cardCount++;
  const card = document.createElement("div");
  card.classList.add("card");

  const title = document.createElement("strong");
  title.textContent = `Card #${cardCount}`;

  const text = document.createElement("p");
  text.textContent = `Created at ${new Date().toLocaleTimeString()} using createElement + append.`;
  text.style.margin = "0.25rem 0 0";

  card.append(title, text);
  return card;
}

function demoCreateCard() {
  const card = createCard();
  document.querySelector("#playground").append(card);
  log("Create", `Appended Card #${cardCount} to playground`);
}

function demoPrependCard() {
  const card = createCard();
  document.querySelector("#playground").prepend(card);
  log("Create", `Prepended Card #${cardCount} to playground`);
}

function demoInsertAdjacentHTML() {
  cardCount++;
  const playground = document.querySelector("#playground");
  playground.insertAdjacentHTML(
    "beforeend",
    `<div class="card highlight"><strong>Card #${cardCount}</strong><p style="margin:0.25rem 0 0">Inserted via insertAdjacentHTML (highlighted).</p></div>`
  );
  log("Create", `Inserted Card #${cardCount} via insertAdjacentHTML`);
}

function demoFragmentBatch() {
  const fragment = document.createDocumentFragment();
  const start = cardCount + 1;

  for (let i = 0; i < 20; i++) {
    cardCount++;
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `<strong>Card #${cardCount}</strong><p style="margin:0.25rem 0 0">Batch-created via DocumentFragment.</p>`;
    fragment.append(card);
  }

  document.querySelector("#playground").append(fragment);
  log("Fragment", `Batch-appended 20 cards (#${start} – #${cardCount}) in one DOM operation`);
}

function demoRemoveLast() {
  const playground = document.querySelector("#playground");
  const last = playground.lastElementChild;
  if (last) {
    last.remove();
    log("Remove", "Removed the last card from playground");
  } else {
    log("Remove", "Playground is empty — nothing to remove");
  }
}

function demoClearAll() {
  const playground = document.querySelector("#playground");
  const count = playground.childElementCount;
  playground.replaceChildren();
  log("Remove", `Cleared all ${count} children using replaceChildren()`);
}

// ── 4. Attributes, Classes & Styles ──────────

const styleTarget = document.querySelector("#style-target");

function demoToggleClass() {
  const toggled = styleTarget.classList.toggle("badge-warning");
  log("classList", `toggle("badge-warning") → now ${toggled ? "added" : "removed"}`);
}

function demoAddClass() {
  styleTarget.classList.add("badge-danger");
  log("classList", `add("badge-danger") — classes: ${[...styleTarget.classList].join(", ")}`);
}

function demoRemoveClass() {
  styleTarget.classList.remove("badge-danger");
  log("classList", `remove("badge-danger") — classes: ${[...styleTarget.classList].join(", ")}`);
}

function demoSetAttr() {
  styleTarget.setAttribute("data-level", "99");
  log("Attribute", `setAttribute("data-level", "99") — now: ${styleTarget.getAttribute("data-level")}`);
}

function demoReadDataset() {
  const entries = Object.entries(styleTarget.dataset);
  const str = entries.map(([k, v]) => `${k}="${v}"`).join(", ");
  log("dataset", `dataset: { ${str} }`);
}

function demoChangeStyle() {
  const hue = Math.floor(Math.random() * 360);
  styleTarget.style.backgroundColor = `hsl(${hue}, 70%, 80%)`;
  styleTarget.style.color = `hsl(${hue}, 70%, 20%)`;
  styleTarget.style.padding = "0.5rem 1rem";
  styleTarget.style.fontSize = "1.1rem";
  log("style", `Set background to hsl(${hue}, 70%, 80%)`);
}

function demoComputedStyle() {
  const cs = getComputedStyle(styleTarget);
  log("computedStyle", `color: ${cs.color} | bg: ${cs.backgroundColor} | font-size: ${cs.fontSize} | display: ${cs.display}`);
}

// ── 5. innerHTML vs textContent vs innerText ─

const contentTarget = document.querySelector("#content-target");

function demoReadInnerHTML() {
  log("innerHTML", contentTarget.innerHTML.trim().replace(/\n\s+/g, " "));
}

function demoReadTextContent() {
  log("textContent", `"${contentTarget.textContent.trim().replace(/\s+/g, " ")}"`);
  log("textContent", "Note: includes text from display:none elements");
}

function demoReadInnerText() {
  log("innerText", `"${contentTarget.innerText.trim().replace(/\s+/g, " ")}"`);
  log("innerText", "Note: respects CSS — hidden text is excluded");
}

function demoSafeSet() {
  const demo = document.createElement("div");
  demo.style.marginTop = "0.5rem";
  demo.style.padding = "0.5rem";
  demo.style.background = "#d4edda";
  demo.style.borderRadius = "4px";

  // textContent is safe — HTML tags are escaped
  demo.textContent = 'Safe: <script>alert("xss")</script> — displayed as plain text';
  contentTarget.append(demo);
  log("textContent", "Set text with HTML tags — they are rendered as plain text (safe)");

  setTimeout(() => demo.remove(), 4000);
}

function demoXssSafe() {
  const userInput = '<img src=x onerror="alert(1)"> <b>Bold attempt</b>';

  // DANGEROUS way (do NOT do this with user input)
  log("XSS", `User input: ${escapeHtml(userInput)}`);

  // SAFE way
  const safe = document.createElement("div");
  safe.style.marginTop = "0.5rem";
  safe.style.padding = "0.5rem";
  safe.style.background = "#f8d7da";
  safe.style.borderRadius = "4px";
  safe.textContent = `textContent safely renders: ${userInput}`;
  contentTarget.append(safe);
  log("XSS", "textContent escapes all HTML — the img/script tags are harmless text");

  setTimeout(() => safe.remove(), 5000);
}

// ── 6. Performance Test ──────────────────────

function demoPerfTest() {
  const results = document.querySelector("#perf-results");
  const target = document.querySelector("#perf-target");
  const COUNT = 2000;

  // Method 1: append one at a time
  target.replaceChildren();
  const t1Start = performance.now();
  for (let i = 0; i < COUNT; i++) {
    const li = document.createElement("li");
    li.textContent = `Item ${i}`;
    target.append(li);
  }
  const t1 = (performance.now() - t1Start).toFixed(2);

  // Method 2: innerHTML
  target.replaceChildren();
  const t2Start = performance.now();
  let html = "";
  for (let i = 0; i < COUNT; i++) {
    html += `<li>Item ${i}</li>`;
  }
  target.innerHTML = html;
  const t2 = (performance.now() - t2Start).toFixed(2);

  // Method 3: DocumentFragment
  target.replaceChildren();
  const t3Start = performance.now();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < COUNT; i++) {
    const li = document.createElement("li");
    li.textContent = `Item ${i}`;
    fragment.append(li);
  }
  target.append(fragment);
  const t3 = (performance.now() - t3Start).toFixed(2);

  target.replaceChildren();

  results.innerHTML = `
    <span>Individual append:   ${t1} ms</span>
    <span>innerHTML:           ${t2} ms</span>
    <span>DocumentFragment:    ${t3} ms</span>
  `;

  log("Perf", `${COUNT} items — append: ${t1}ms | innerHTML: ${t2}ms | fragment: ${t3}ms`);
}

// ── Event Delegation for All Buttons ─────────

document.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;

  switch (action) {
    // Selection
    case "select-id":
      demoSelectById();
      break;
    case "select-qs":
      demoQuerySelector();
      break;
    case "select-qsa":
      demoQuerySelectorAll();
      break;
    case "select-class":
      demoGetElementsByClassName();
      break;

    // Traversal
    case "trav-parent":
      traverseTo(currentNode.parentElement, "parentElement");
      break;
    case "trav-first":
      traverseTo(currentNode.firstElementChild, "firstElementChild");
      break;
    case "trav-last":
      traverseTo(currentNode.lastElementChild, "lastElementChild");
      break;
    case "trav-next":
      traverseTo(currentNode.nextElementSibling, "nextElementSibling");
      break;
    case "trav-prev":
      traverseTo(currentNode.previousElementSibling, "previousElementSibling");
      break;
    case "trav-closest":
      traverseTo(currentNode.closest(".demo-section"), 'closest(".demo-section")');
      break;
    case "trav-reset":
      currentNode = document.querySelector(".fruit-list");
      renderTree();
      break;

    // Create & Remove
    case "create-card":
      demoCreateCard();
      break;
    case "prepend-card":
      demoPrependCard();
      break;
    case "insert-html":
      demoInsertAdjacentHTML();
      break;
    case "fragment-batch":
      demoFragmentBatch();
      break;
    case "remove-last":
      demoRemoveLast();
      break;
    case "clear-all":
      demoClearAll();
      break;

    // Attributes & Styles
    case "toggle-class":
      demoToggleClass();
      break;
    case "add-class":
      demoAddClass();
      break;
    case "remove-class":
      demoRemoveClass();
      break;
    case "set-attr":
      demoSetAttr();
      break;
    case "read-dataset":
      demoReadDataset();
      break;
    case "change-style":
      demoChangeStyle();
      break;
    case "computed-style":
      demoComputedStyle();
      break;

    // Content
    case "read-inner-html":
      demoReadInnerHTML();
      break;
    case "read-text-content":
      demoReadTextContent();
      break;
    case "read-inner-text":
      demoReadInnerText();
      break;
    case "safe-set":
      demoSafeSet();
      break;
    case "xss-demo":
      demoXssSafe();
      break;

    // Performance
    case "perf-test":
      demoPerfTest();
      break;
  }
});

// ── Initial Log ──────────────────────────────
log("Ready", "DOM Fundamentals demo loaded. Click any button to begin.");
