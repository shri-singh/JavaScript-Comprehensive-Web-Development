# Chapter 2 — Developer Workflow

## Learning Objectives

By the end of this chapter you will be able to:

- Configure VS Code with the essential extensions and settings for JavaScript development.
- Navigate the terminal confidently using `cd`, `ls`, `mkdir`, `node`, and `npm`.
- Initialise a Git repository, make commits on branches, merge them, and push to a remote.
- Explain the anatomy of `package.json` and use npm to install dependencies and run scripts.
- Run JavaScript outside the browser using Node.js.

---

## 2.1 Code Editor Setup

**VS Code** is the recommended editor for this course. Install it from [code.visualstudio.com](https://code.visualstudio.com).

### Recommended Extensions

| Extension | Why |
|---|---|
| **ESLint** | Highlights code-quality issues in real time. |
| **Prettier — Code formatter** | Auto-formats on save so you never argue about semicolons. |
| **Live Server** | Launches a local dev server with hot-reload for HTML files. |
| **GitLens** | Shows inline blame annotations and branch history. |
| **Error Lens** | Surfaces ESLint/TS errors directly on the offending line. |

### Key Settings (add to `.vscode/settings.json`)

```jsonc
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "files.eol": "\n"
}
```

> **Tip:** Open the command palette with **Ctrl+Shift+P** (Cmd+Shift+P on macOS) — it is the fastest way to reach any VS Code feature.

---

## 2.2 Terminal Basics

You will live in the terminal throughout this course. On Windows use **Git Bash** or the VS Code integrated terminal; on macOS/Linux the default shell works fine.

| Command | What it does | Example |
|---|---|---|
| `pwd` | Print current directory | `pwd` → `/Users/you/projects` |
| `cd` | Change directory | `cd my-app` |
| `ls` | List files | `ls -la` (shows hidden files too) |
| `mkdir` | Create a directory | `mkdir src` |
| `touch` | Create an empty file | `touch index.js` |
| `node` | Run a JS file in Node.js | `node index.js` |
| `npm` | Node package manager CLI | `npm install lodash` |

```bash
# Typical workflow: create a project folder and open it
mkdir my-first-project
cd my-first-project
code .          # opens VS Code in the current folder
```

---

## 2.3 Git Fundamentals

Git tracks every change you make so you can rewind, branch, and collaborate.

### Core commands

```bash
git init                    # create a new repo in the current folder
git status                  # see what has changed
git add index.js            # stage a specific file
git add .                   # stage everything
git commit -m "feat: add greeting function"  # save a snapshot
```

### Branching & Merging

```bash
git branch feature/login    # create a branch
git checkout feature/login  # switch to it  (or: git switch feature/login)
# ... make commits ...
git checkout main           # switch back
git merge feature/login     # bring changes into main
```

### Working with a Remote

```bash
git remote add origin https://github.com/you/repo.git
git push -u origin main     # first push — sets upstream
git push                    # subsequent pushes
git pull                    # fetch + merge remote changes
```

> **Commit message convention:** this course uses the `type(scope): message` format — for example `fix(ch-02): correct npm install example`. Keep messages short and in the imperative mood ("add", not "added").

---

## 2.4 npm Basics

npm ships with Node.js. It installs third-party packages and runs project scripts.

### Initialising a project

```bash
npm init -y                 # creates package.json with defaults
```

### `package.json` anatomy

```jsonc
{
  "name": "my-app",             // project name (lowercase, no spaces)
  "version": "1.0.0",           // semver version
  "type": "module",             // enable ES module import/export
  "scripts": {                  // custom commands you run with `npm run <name>`
    "start": "node src/index.js",
    "test": "node --test"
  },
  "dependencies": {},           // packages your app needs at runtime
  "devDependencies": {}         // packages needed only during development
}
```

### Installing packages

```bash
npm install chalk            # adds to dependencies
npm install --save-dev vitest  # adds to devDependencies
npm install                  # installs everything listed in package.json
```

### Running scripts

```bash
npm run start                # runs the "start" script
npm test                     # shortcut — "test" and "start" don't need `run`
```

---

## 2.5 Node.js as a JS Runtime

Node.js lets you execute JavaScript outside the browser. It uses the same V8 engine that powers Chrome, but replaces browser APIs (`document`, `window`) with server-side APIs (`fs`, `path`, `http`).

```js
// hello.js — run with: node hello.js
const name = "World";
console.log(`Hello, ${name}!`);
```

You can also start a **REPL** (Read-Eval-Print Loop) by typing `node` with no arguments — great for quick experiments:

```
$ node
> 2 ** 10
1024
> [1, 2, 3].map(n => n * 2)
[ 2, 4, 6 ]
```

---

## Tricky Things & Gotchas

1. **`node_modules` should never be committed.** Add it to `.gitignore` immediately after `npm init`. The folder can contain thousands of files and will bloat your repo.
2. **`npm install` vs `npm ci`** — `npm install` may update `package-lock.json`; `npm ci` installs the exact versions from the lockfile. Use `ci` in CI/CD pipelines.
3. **Forgetting `"type": "module"`** — without it, Node defaults to CommonJS (`require`/`module.exports`). This course uses ES modules (`import`/`export`), so always set `"type": "module"` in `package.json`.
4. **Git staging confusion** — `git add .` stages _everything_ in the current directory, including files you may not want. Prefer staging specific files by name until you have a solid `.gitignore` in place.
5. **Line endings on Windows** — Git may convert `LF` to `CRLF`. Set `git config --global core.autocrlf input` and add `"files.eol": "\n"` in VS Code to keep things consistent across platforms.

---

## Best Practices

- Make **small, frequent commits** — each commit should represent one logical change.
- Write a `.gitignore` before your first commit. At minimum include `node_modules/`, `dist/`, and `.env`.
- Use `npm scripts` instead of memorising long CLI commands — it documents your workflow inside `package.json`.
- Keep your Node.js version up to date. Use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage multiple versions.
- Read error messages from top to bottom — the first line usually tells you exactly what went wrong.

---

## Exercises

1. **Terminal navigation.** Using only the terminal, create the folder structure `workshop/src/utils` and an empty file `workshop/src/index.js`. Verify with `ls -R workshop`.

2. **First Node script.** Create a file `greet.js` that accepts a name from the command line and logs a greeting:
   ```bash
   node greet.js Alice
   # → Hello, Alice!
   ```
   _Hint:_ command-line arguments live in `process.argv`.

3. **Three-commit repo.** Initialise a Git repo, create a `.gitignore` (commit 1), add an `index.js` that logs `"v1"` (commit 2), then update it to log `"v2"` (commit 3). Run `git log --oneline` and paste the output.

4. **Branch and merge.** From exercise 3, create a branch called `feature/add-greet`, add a `greet.js` file, commit it, switch back to `main`, and merge. Confirm `greet.js` exists on `main`.

5. **npm scripts.** Run `npm init -y`, add a `"start"` script that runs `node index.js`, and a `"greet"` script that runs `node greet.js World`. Execute both with `npm run` and capture the output.

---

## Mini-Lab

Explore the [`../../scripts/`](../../scripts/) folder in this repository to see helper scripts that automate common tasks. Read through at least one script and identify which npm or Node.js concepts from this chapter it uses.

---

## What's Next

You now have a fully configured development environment. In **Phase 1** you will start writing real JavaScript — variables, functions, control flow, and more — using the [`../../examples-node/phase-01/`](../../examples-node/phase-01/) directory.
