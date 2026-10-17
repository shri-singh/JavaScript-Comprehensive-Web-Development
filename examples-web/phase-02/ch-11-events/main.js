// ──────────────────────────────────────────────
// Chapter 11 — Events: Interactive Demo
// ──────────────────────────────────────────────

// ── Logging Utility ──────────────────────────
const logPanel = document.querySelector("#log");

function log(label, message) {
  const entry = document.createElement("div");
  entry.classList.add("log-entry");

  const labelSpan = document.createElement("span");
  labelSpan.classList.add("log-label");
  labelSpan.textContent = `[${label}]`;

  entry.append(labelSpan, ` ${message}`);
  logPanel.prepend(entry);
}

// ── 1. Event Flow Visualization ──────────────

const flowLog = document.querySelector("#flow-log");
const flowBoxes = ["flow-outer", "flow-middle", "flow-inner"];

function flowLogEntry(phase, elementId, eventPhase) {
  const phaseNames = { 1: "capture", 2: "target", 3: "bubble" };
  const phaseName = phaseNames[eventPhase];
  const cssClass = `phase-${phaseName}`;

  const entry = document.createElement("div");
  entry.innerHTML = `<span class="${cssClass}">[${phaseName.toUpperCase()}]</span> ${elementId}`;
  flowLog.append(entry);
  flowLog.scrollTop = flowLog.scrollHeight;

  // Visual flash
  const el = document.getElementById(elementId);
  const flashClass = `flash-${phaseName}`;
  el.classList.add(flashClass);
  setTimeout(() => el.classList.remove(flashClass), 600);
}

// Attach capture and bubble listeners on each box
for (const id of flowBoxes) {
  const el = document.getElementById(id);

  // Capture phase
  el.addEventListener(
    "click",
    (e) => {
      if (e.target.closest("button")) return; // ignore button clicks
      flowLogEntry("capture", id, e.eventPhase);
    },
    { capture: true }
  );

  // Bubble phase
  el.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    flowLogEntry("bubble", id, e.eventPhase);
  });
}

document.querySelector("#clear-flow-log").addEventListener("click", () => {
  flowLog.innerHTML = "";
  log("Flow", "Flow log cleared");
});

// ── 2. Event Delegation ──────────────────────

const delegationList = document.querySelector("#delegation-list");
let nextItemId = 5;

// Single listener on the parent <ul>
delegationList.addEventListener("click", (event) => {
  // Handle delete button
  const deleteBtn = event.target.closest(".delete-btn");
  if (deleteBtn) {
    const li = deleteBtn.closest("li");
    const id = li.dataset.id;
    li.remove();
    log("Delegation", `Deleted item #${id}`);
    return;
  }

  // Handle item selection
  const li = event.target.closest("li");
  if (!li || !delegationList.contains(li)) return;

  // Deselect all, then select clicked
  for (const item of delegationList.children) {
    item.classList.remove("selected");
  }
  li.classList.toggle("selected");
  log("Delegation", `Selected item #${li.dataset.id}: "${li.firstChild.textContent.trim()}"`);
});

// Add new items
document.querySelector("#add-item-btn").addEventListener("click", () => {
  const li = document.createElement("li");
  li.dataset.id = nextItemId;

  const text = document.createTextNode(`New item #${nextItemId} (added dynamically) `);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "Delete";

  li.append(text, deleteBtn);
  delegationList.append(li);
  log("Delegation", `Added item #${nextItemId} — no new listener needed!`);
  nextItemId++;
});

// ── 3. Keyboard Events ──────────────────────

const keyDisplay = document.querySelector("#key-display");

document.addEventListener("keydown", (e) => {
  const parts = [];
  if (e.ctrlKey) parts.push('<span class="key-badge">Ctrl</span>');
  if (e.altKey) parts.push('<span class="key-badge">Alt</span>');
  if (e.shiftKey) parts.push('<span class="key-badge">Shift</span>');
  if (e.metaKey) parts.push('<span class="key-badge">Meta</span>');

  // Do not show modifier key alone as a badge duplicate
  if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
    parts.push(`<span class="key-badge">${e.key === " " ? "Space" : e.key}</span>`);
  }

  keyDisplay.innerHTML = parts.join(" + ") || '<span class="key-badge">Modifier</span>';
  log("Keyboard", `key: "${e.key}" | code: "${e.code}" | repeat: ${e.repeat}`);
});

document.addEventListener("keyup", () => {
  setTimeout(() => {
    keyDisplay.innerHTML = "Press any key...";
  }, 1500);
});

// ── 4. Custom Events ────────────────────────

const customInput = document.querySelector("#custom-event-input");
const dispatchBtn = document.querySelector("#dispatch-custom");
const moduleBMessages = document.querySelector("#module-b-messages");

// Module A: Dispatch custom event
dispatchBtn.addEventListener("click", () => {
  const message = customInput.value.trim();
  if (!message) {
    log("CustomEvent", "Cannot send empty message");
    return;
  }

  const event = new CustomEvent("app:message", {
    detail: {
      text: message,
      sender: "Module A",
      timestamp: Date.now(),
    },
    bubbles: true,
  });

  document.dispatchEvent(event);
  log("CustomEvent", `Module A dispatched "app:message" with: "${message}"`);
  customInput.value = "";
});

// Module B: Listen for custom event (no reference to Module A)
document.addEventListener("app:message", (e) => {
  const { text, sender, timestamp } = e.detail;
  const time = new Date(timestamp).toLocaleTimeString();

  const msg = document.createElement("div");
  msg.classList.add("notification");
  msg.innerHTML = `<strong>${sender}</strong> at ${time}: ${text}`;
  msg.style.padding = "0.3rem 0";
  msg.style.borderBottom = "1px solid #eee";

  // Clear the "waiting" message on first receive
  if (moduleBMessages.textContent === "Waiting for messages...") {
    moduleBMessages.textContent = "";
  }

  moduleBMessages.prepend(msg);
  log("CustomEvent", `Module B received: "${text}" from ${sender}`);
});

// Allow Enter key to send
customInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    dispatchBtn.click();
  }
});

// ── 5. Listener Options & AbortController ────

let controller = null;
const abortStatus = document.querySelector("#abort-status");
const abortArea = document.querySelector("#abort-area");

function mountListeners() {
  if (controller) {
    log("Abort", "Already mounted — unmount first");
    return;
  }

  controller = new AbortController();
  const { signal } = controller;

  // Click listener
  abortArea.addEventListener(
    "click",
    () => {
      abortArea.textContent = `Clicked at ${new Date().toLocaleTimeString()}`;
      log("Abort", "Click detected in monitored area");
    },
    { signal }
  );

  // Mousemove listener
  abortArea.addEventListener(
    "mousemove",
    (e) => {
      abortArea.textContent = `Mouse: (${e.offsetX}, ${e.offsetY})`;
    },
    { signal }
  );

  // Keydown listener
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        abortArea.textContent = "Escape pressed while mounted!";
        log("Abort", "Escape key detected by mounted keydown listener");
      }
    },
    { signal }
  );

  abortStatus.textContent = "Status: Mounted (3 listeners active)";
  abortStatus.className = "status-mounted";
  log("Abort", "Mounted 3 listeners (click, mousemove, keydown) with AbortController");
}

function unmountListeners() {
  if (!controller) {
    log("Abort", "Nothing to unmount");
    return;
  }

  controller.abort();
  controller = null;

  abortStatus.textContent = "Status: Unmounted";
  abortStatus.className = "status-unmounted";
  abortArea.textContent = "Mount listeners, then interact here";
  log("Abort", "Aborted controller — all 3 listeners removed at once");
}

document.querySelector("#mount-btn").addEventListener("click", mountListeners);
document.querySelector("#unmount-btn").addEventListener("click", unmountListeners);

// Once listener
const onceBtn = document.querySelector("#once-btn");

onceBtn.addEventListener(
  "click",
  () => {
    log("Once", "This listener fires exactly once, then auto-removes.");
    onceBtn.textContent = "Already fired (click again — nothing happens)";
    onceBtn.style.opacity = "0.5";
  },
  { once: true }
);

// ── Initial Log ──────────────────────────────
log("Ready", "Events demo loaded. Interact with each section to see events in action.");
