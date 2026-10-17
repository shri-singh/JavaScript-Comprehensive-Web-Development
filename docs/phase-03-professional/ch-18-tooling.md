# Chapter 18 — Tooling

## Learning Objectives

By the end of this chapter you will be able to:

- Explain how npm manages dependencies, lockfiles, and semantic versioning.
- Use npm scripts and `npx` to automate common development tasks.
- Describe why Vite exists and how its dev server and build pipeline work.
- Configure Vite for a basic project with environment variables and aliases.
- Set up ESLint with flat config to catch bugs and enforce code quality.
- Set up Prettier to enforce consistent formatting across a team.
- Explain how pre-commit hooks (Husky + lint-staged) prevent bad code from reaching the repository.

---

## 18.1 npm Deep Dive

### What npm Does

npm (Node Package Manager) is three things:

1. **A registry** — a massive public database of JavaScript packages (npmjs.com).
2. **A CLI tool** — the `npm` command that installs, updates, and manages packages.
3. **A project tool** — manages your project's dependencies, scripts, and metadata via `package.json`.

### package.json

Every Node.js project starts with a `package.json`:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

- **`dependencies`** — packages your app needs at runtime.
- **`devDependencies`** — packages needed only during development (bundlers, linters, test runners).

### Semantic Versioning (semver)

Versions follow the format **MAJOR.MINOR.PATCH**:

| Part | When It Changes | Example |
|---|---|---|
| **MAJOR** | Breaking changes (incompatible API changes) | `2.0.0` |
| **MINOR** | New features (backwards-compatible) | `1.3.0` |
| **PATCH** | Bug fixes (backwards-compatible) | `1.2.5` |

### Version Ranges in package.json

| Syntax | Meaning | Example Range |
|---|---|---|
| `^1.2.3` | Compatible with 1.x.x (>=1.2.3 <2.0.0) | Most common |
| `~1.2.3` | Patch-level changes only (>=1.2.3 <1.3.0) | More conservative |
| `1.2.3` | Exact version only | Pinned |
| `>=1.2.0` | Anything at or above 1.2.0 | Broad |
| `*` | Any version | Dangerous |

The `^` (caret) is the default when you `npm install`. It allows minor and patch updates but not major version bumps.

### The Lockfile (package-lock.json)

The lockfile records the **exact** versions installed, including all transitive dependencies:

- **Without a lockfile**: `npm install` resolves `^1.2.3` to the latest compatible version, which might differ between machines or over time.
- **With a lockfile**: `npm install` installs the exact versions recorded, giving deterministic builds.

**Rules:**
- Always commit `package-lock.json` to version control.
- Use `npm ci` in CI/CD pipelines — it installs strictly from the lockfile and is faster than `npm install`.
- Never edit the lockfile by hand.

### Essential npm Commands

```bash
npm init -y                  # Create package.json with defaults
npm install lodash           # Add a dependency
npm install -D vitest        # Add a dev dependency
npm uninstall lodash         # Remove a package
npm update                   # Update packages within semver ranges
npm outdated                 # Show packages with available updates
npm ls --depth=0             # List top-level installed packages
npm ci                       # Clean install from lockfile (for CI)
npm audit                    # Check for known vulnerabilities
npm audit fix                # Auto-fix vulnerabilities where possible
```

### npm Scripts

Scripts in `package.json` are run with `npm run <name>`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

Special scripts (`start`, `test`) can be run without `run`: `npm test` instead of `npm run test`.

### npx

`npx` runs a package binary without installing it globally:

```bash
npx create-vite my-app       # Scaffolds a new Vite project
npx eslint --init             # Runs eslint init without global install
npx vitest                    # Runs vitest from local node_modules
```

If the package is in your local `node_modules`, `npx` uses it. Otherwise, it downloads it temporarily.

---

## 18.2 Vite

### Why Vite?

Traditional bundlers (like Webpack) bundle your entire application before serving it — even during development. As projects grow, this becomes painfully slow.

Vite takes a different approach:

- **Dev server**: Serves files using native ES modules. The browser requests each module individually, and Vite transforms them on the fly. No bundling step during development.
- **Build**: Uses Rollup under the hood to produce optimized, production-ready bundles.

The result: instant server start and near-instant hot module replacement (HMR), regardless of project size.

### Getting Started

```bash
npm create vite@latest my-app -- --template vanilla
cd my-app
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with HMR enabled by default.

### How the Dev Server Works

1. You save a file.
2. Vite detects the change.
3. Only the changed module (and its dependents) are invalidated.
4. The browser re-fetches just the affected modules.
5. The page updates without a full reload (HMR).

### Build for Production

```bash
npm run build    # Outputs to dist/
npm run preview  # Locally preview the production build
```

The production build:
- Bundles and minifies all JavaScript.
- Processes and optimizes CSS.
- Generates hashed file names for cache-busting.
- Tree-shakes unused code.
- Code-splits dynamic `import()` calls into separate chunks.

### Vite Configuration

Vite is configured via `vite.config.js` (or `.ts`) at the project root:

```js
import { defineConfig } from "vite";

export default defineConfig({
  // Dev server options
  server: {
    port: 3000,
    open: true,       // Open browser on start
  },

  // Build options
  build: {
    outDir: "dist",
    sourcemap: true,  // Generate source maps
  },

  // Path aliases
  resolve: {
    alias: {
      "@": "/src",    // import from "@/components/Button.js"
    },
  },
});
```

### Environment Variables

Vite exposes environment variables prefixed with `VITE_`:

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

Access them in your code:

```js
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.MODE);  // "development" or "production"
```

Files: `.env` (all modes), `.env.development` (dev only), `.env.production` (build only).

---

## 18.3 ESLint

### What ESLint Does

ESLint is a **static analysis tool** that finds and reports problems in your JavaScript code. It catches:

- **Bugs**: using undeclared variables, unreachable code, incorrect comparisons.
- **Anti-patterns**: unused variables, `var` instead of `let`/`const`, implicit globals.
- **Style issues** (optional): inconsistent spacing, quote style (though Prettier is better for formatting).

### Flat Config (eslint.config.js)

ESLint 9+ uses **flat config** — a single `eslint.config.js` file that exports an array of configuration objects:

```js
import js from "@eslint/js";
import globals from "globals";

export default [
  // Apply recommended rules to all JS files
  js.configs.recommended,

  {
    // Configuration for your source files
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "eqeqeq": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  {
    // Ignore build output
    ignores: ["dist/", "node_modules/"],
  },
];
```

### Rule Severity Levels

| Level | Meaning |
|---|---|
| `"off"` or `0` | Disable the rule |
| `"warn"` or `1` | Show a warning (does not fail the build) |
| `"error"` or `2` | Show an error (fails the lint check) |

### Running ESLint

```bash
npx eslint .              # Lint all files
npx eslint src/           # Lint specific directory
npx eslint --fix .        # Auto-fix fixable problems
```

### Key Rules to Know

| Rule | What It Catches |
|---|---|
| `no-unused-vars` | Variables declared but never used |
| `no-undef` | Variables used but never declared |
| `eqeqeq` | `==` instead of `===` |
| `no-var` | `var` declarations (prefer `let`/`const`) |
| `prefer-const` | `let` that is never reassigned |
| `no-unreachable` | Code after `return`, `throw`, `break` |
| `no-constant-condition` | `if (true)` or `while (false)` |
| `no-duplicate-imports` | Multiple import statements from the same module |

---

## 18.4 Prettier

### What Prettier Does

Prettier is an **opinionated code formatter**. Unlike ESLint (which finds problems), Prettier rewrites your code to enforce a consistent style. It handles:

- Indentation (tabs vs spaces, width).
- Semicolons (add or remove).
- Quotes (single vs double).
- Line length (wrapping long lines).
- Trailing commas.
- Bracket spacing.

### Why Use Prettier Alongside ESLint?

- **ESLint** catches bugs and enforces code quality rules.
- **Prettier** handles all formatting decisions.
- Together, they eliminate style debates. No more arguing about tabs vs spaces.

### Configuration (.prettierrc)

Create a `.prettierrc` (or `.prettierrc.json`) at the project root:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Ignoring Files (.prettierignore)

```
dist/
node_modules/
package-lock.json
*.min.js
```

### Running Prettier

```bash
npx prettier --write .              # Format all files in place
npx prettier --check .              # Check without modifying (CI-friendly)
npx prettier --write "src/**/*.js"  # Format specific files
```

### Integrating Prettier with ESLint

To prevent ESLint and Prettier from conflicting, disable ESLint's formatting rules:

```bash
npm install -D eslint-config-prettier
```

Then add it to your ESLint config:

```js
import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier, // Must be last — disables ESLint rules that conflict with Prettier
];
```

---

## 18.5 Editor Integration

### VS Code Setup

Install these extensions:

- **ESLint** (`dbaeumer.vscode-eslint`) — underlines lint errors in real time.
- **Prettier** (`esbenp.prettier-vscode`) — formats on save.

Add to your workspace `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

This setup:
1. Formats your code with Prettier every time you save.
2. Auto-fixes ESLint issues on save (like adding missing `const`).

### Other Editors

- **WebStorm**: has built-in ESLint and Prettier support (enable in Preferences > Languages > JavaScript).
- **Neovim**: use `mason.nvim` with `eslint-lsp` and `prettier` via `null-ls` or `conform.nvim`.

---

## 18.6 Pre-Commit Hooks

### The Problem

Developers forget to run the linter and formatter. Bad code gets committed and pushed, wasting CI time and causing review friction.

### The Solution: Husky + lint-staged

**Husky** installs Git hooks that run scripts before a commit (or push).
**lint-staged** runs linters and formatters only on the files that are staged for commit.

### Setup

```bash
npm install -D husky lint-staged
npx husky init
```

This creates a `.husky/` directory. Edit `.husky/pre-commit`:

```bash
npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### How It Works

1. Developer runs `git commit`.
2. Husky intercepts the commit and runs the pre-commit hook.
3. lint-staged identifies which files are staged.
4. ESLint and Prettier run only on those files.
5. If ESLint finds unfixable errors, the commit is blocked.
6. If everything passes, the commit proceeds with the formatted files.

### Benefits

- **Fast** — only checks changed files, not the entire codebase.
- **Automatic** — no relying on developers to remember.
- **Consistent** — every commit meets the same quality standard.

---

## Tricky Things & Gotchas

1. **`npm install` vs `npm ci`** — use `npm install` during development (updates the lockfile). Use `npm ci` in CI pipelines (installs from the lockfile exactly, deletes `node_modules` first, fails if the lockfile is out of sync).

2. **`^` is not "latest"** — `^1.2.3` means >=1.2.3 and <2.0.0. It does not install the absolute latest version. Run `npm outdated` to see what is available.

3. **Vite environment variables must start with `VITE_`** — any variable without this prefix is not exposed to client code (for security). Server-side secrets should never have the `VITE_` prefix.

4. **ESLint flat config vs legacy config** — ESLint 9+ defaults to flat config (`eslint.config.js`). Older `.eslintrc` files still work but are deprecated. Do not mix both formats.

5. **Prettier and ESLint can conflict** — without `eslint-config-prettier`, ESLint may report formatting issues that Prettier will fix differently. Always include it as the last config.

6. **`npx` downloads packages temporarily** — the first run of `npx some-package` may be slow because it downloads the package. Subsequent runs in the same project use the cache.

7. **Husky hooks require `npm install`** — when a new team member clones the repo, they must run `npm install` to set up the Git hooks. Husky 9+ uses a `prepare` script to automate this.

8. **lockfile conflicts during merges** — when two branches modify `package-lock.json`, you will get merge conflicts. Delete the lockfile, run `npm install`, and commit the regenerated one.

---

## Best Practices

- Always commit both `package.json` and `package-lock.json` to version control.
- Use `npm ci` in CI/CD pipelines for deterministic, fast installs.
- Start new projects with Vite — it provides the best development experience with minimal configuration.
- Use ESLint for code quality and Prettier for formatting. Do not use ESLint for formatting.
- Install `eslint-config-prettier` to prevent rule conflicts between ESLint and Prettier.
- Enable format-on-save in your editor so formatting is instant and invisible.
- Set up Husky + lint-staged early in a project. Adding it later means reformatting existing code.
- Pin major versions in `package.json` (use the default `^` range) and review major updates manually.

---

## Exercises

1. **npm init.** Create a new project from scratch with `npm init -y`. Install `lodash` as a dependency and `vitest` as a dev dependency. Examine the `node_modules` folder and `package-lock.json`. Explain what changed.

2. **Semver quiz.** Given `"^2.4.1"`, which of these versions would npm install? `2.4.1`, `2.5.0`, `2.99.0`, `3.0.0`, `2.3.9`. Explain your reasoning for each.

3. **npm scripts.** Add a `"hello"` script to `package.json` that prints "Hello from npm scripts!" using `node -e "console.log(...)"`. Add a `"prehello"` script that runs automatically before it.

4. **Vite project.** Scaffold a Vite project with `npm create vite@latest`. Explore the generated files. Modify `vite.config.js` to change the port, add a path alias, and enable source maps.

5. **ESLint setup.** Configure ESLint flat config from scratch. Add rules for `no-var`, `prefer-const`, `eqeqeq`, and `no-unused-vars`. Write a file with intentional violations and run ESLint to see the output.

6. **Prettier config.** Create a `.prettierrc` with your preferred settings. Format a messy file. Then change the settings (e.g., switch from double to single quotes) and reformat to see the difference.

7. **ESLint + Prettier integration.** Install `eslint-config-prettier` and add it to your ESLint config. Verify that ESLint no longer reports formatting issues that Prettier handles.

8. **Pre-commit hook.** Set up Husky and lint-staged in a project. Make a commit with a lint error and verify that the hook blocks it. Fix the error and commit successfully.

---

## Mini-Lab

Examine the example configuration files in [`../../examples-node/phase-03/ch-18-tooling/`](../../examples-node/phase-03/ch-18-tooling/):

```
examples-node/phase-03/ch-18-tooling/vite.config.example.js
examples-node/phase-03/ch-18-tooling/eslint.config.example.js
```

These files are annotated reference configs you can copy into your own projects and customize.

---

## What's Next

With a professional tooling setup in place, Chapter 19 introduces testing — writing automated tests with Vitest to ensure your code works correctly and stays correct as it evolves.
