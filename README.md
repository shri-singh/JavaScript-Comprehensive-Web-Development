# JavaScript: Comprehensive Web Development

A complete, hands-on JavaScript course — from language fundamentals to building production-style web applications. Clone the repo, follow chapter by chapter, and build real projects along the way.

---

## Start Here

### Prerequisites

- Basic HTML & CSS knowledge
- A code editor ([VS Code](https://code.visualstudio.com/) recommended)
- [Node.js](https://nodejs.org/) v18 or later (includes npm)
- A terminal (VS Code's built-in terminal works great)
- Git basics (or learn them in Chapter 2)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/JavaScript-Comprehensive-Web-Development.git
cd JavaScript-Comprehensive-Web-Development

# 2. Install dependencies
npm install

# 3. Start reading Chapter 1
# Open docs/phase-00-foundations/ch-01-web-runtime.md
```

### How to Use This Course

1. **Read the lesson** — each chapter in `docs/` has a short explanation, code snippets, gotchas, and best practices
2. **Run the examples** — every chapter links to runnable code in `examples-node/` or `examples-web/`
3. **Do the exercises** — each lesson ends with 5-8 exercises to solidify the concepts
4. **Build the projects** — Phase 4 has four progressively harder projects with starter code and solutions

---

## Course Structure

| Phase | Chapters | Focus |
|-------|----------|-------|
| **Phase 0** — Foundations | 1-2 | How the web works, dev tools, Git, npm |
| **Phase 1** — JS Mastery | 3-9 | Types, scope, functions, objects, arrays, modern syntax, errors |
| **Phase 2** — Browser & DOM | 10-16 | DOM, events, forms, state, reactivity, async, fetch |
| **Phase 3** — Professional | 17-21 | Modules, tooling, testing, performance, security |
| **Phase 4** — Projects | 22-25 | Four real-world projects building on everything above |

See the full **[Course Map](COURSE_MAP.md)** for links to every chapter, example, and project.

---

## Running Examples

### Node examples (Phases 1-3)

```bash
# Run any example directly with Node
node examples-node/phase-01/ch-04-scope/01-var-let-const.js
node examples-node/phase-01/ch-07-arrays-iteration/02-sort-gotchas.js
node examples-node/phase-02/ch-15-async/01-promises.js
```

### Browser examples (Phase 2)

```bash
# Start a Vite dev server for any browser chapter
npm run dev:dom          # Chapter 10 — DOM
npm run dev:events       # Chapter 11 — Events
npm run dev:forms-ex     # Chapter 12 — Forms
npm run dev:state        # Chapter 13 — State
npm run dev:reactivity   # Chapter 14 — Reactivity
```

Then open `http://localhost:5173` in your browser.

### Projects (Phase 4)

Each project has a `starter/` folder (your starting point) and a `solution/` folder (reference implementation).

```bash
# Run a project's solution
npm run dev:forms        # Project 1 — Multi-step Form
npm run dev:search       # Project 2 — Reactive Search
npm run dev:spa          # Project 3 — Mini SPA
npm run dev:capstone     # Project 4 — CRUD Dashboard

# Run a project's starter (for students to work on)
cd projects/project-01-forms && npm run dev:starter
```

---

## Repository Layout

```
/
├── README.md                    # You are here
├── COURSE_MAP.md                # Full table of contents with links
├── package.json                 # Workspace root — scripts & dev deps
│
├── docs/                        # Lesson content (Markdown)
│   ├── phase-00-foundations/    #   Ch 1-2
│   ├── phase-01-js-mastery/    #   Ch 3-9
│   ├── phase-02-browser-dom-state/ # Ch 10-16
│   ├── phase-03-professional/  #   Ch 17-21
│   └── phase-04-projects/      #   Ch 22-25 (project guides)
│
├── examples-node/               # Node.js runnable examples
│   ├── phase-01/               #   Language chapters (3-9)
│   ├── phase-02/               #   Async & Fetch (15-16)
│   └── phase-03/               #   Modules, testing, etc. (17-21)
│
├── examples-web/                # Browser examples (served via Vite)
│   └── phase-02/               #   DOM, events, forms, state, reactivity (10-14)
│
├── projects/                    # Hands-on projects
│   ├── project-01-forms/       #   Multi-step form + validation
│   ├── project-02-reactive-search/ # Search UI + debounce + abort
│   ├── project-03-mini-spa/    #   Hash router + components
│   └── project-04-capstone/    #   Auth + CRUD dashboard
│
├── tooling/                     # ESLint & Prettier docs
├── scripts/                     # Helper scripts
│
├── eslint.config.js             # ESLint flat config
├── .prettierrc                  # Prettier config
├── .editorconfig                # Editor settings
├── .gitignore
├── LICENSE                      # MIT
└── CONTRIBUTING.md
```

---

## Tooling

```bash
npm run lint            # Lint all JS files with ESLint
npm run format          # Format all files with Prettier
npm run format:check    # Check formatting without writing
```

---

## Tech Stack

- **Language**: JavaScript (ES2020+)
- **Runtime**: Node.js 18+ (for examples), Browser (for web examples & projects)
- **Build tool**: [Vite](https://vitejs.dev/) 6
- **Linting**: ESLint 9 (flat config)
- **Formatting**: Prettier 3
- **No frameworks** — everything is vanilla JS to teach the fundamentals

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT](LICENSE)
