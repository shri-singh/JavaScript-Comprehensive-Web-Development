/**
 * Chapter 18 — Example: eslint.config.example.js
 *
 * This is an annotated ESLint flat config file. Copy it to your project root
 * as `eslint.config.js` and customize as needed.
 *
 * Flat config is the default format for ESLint 9+.
 * Docs: https://eslint.org/docs/latest/use/configure/configuration-files
 *
 * NOTE: This file is not meant to be run directly. It is a reference config.
 *
 * Install required packages:
 *   npm install -D eslint @eslint/js globals eslint-config-prettier
 */

import js from "@eslint/js";
import globals from "globals";
// import prettier from "eslint-config-prettier";

// Flat config exports an ARRAY of configuration objects.
// Each object can target specific files and set rules, plugins, etc.
// Later objects override earlier ones (like CSS specificity).

export default [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. ESLint Recommended Rules
  //    Applies to all .js files by default.
  //    Catches common bugs like undeclared variables and unreachable code.
  // ─────────────────────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Custom Configuration for Source Files
  // ─────────────────────────────────────────────────────────────────────────
  {
    // Target only source files (not config files, tests, etc.)
    files: ["src/**/*.js"],

    languageOptions: {
      // Use the latest ECMAScript version
      ecmaVersion: "latest",

      // "module" for ES modules, "script" for classic scripts
      sourceType: "module",

      // Define global variables available in your environment
      globals: {
        ...globals.browser,     // window, document, fetch, etc.
        // ...globals.node,     // Uncomment for Node.js projects
      },
    },

    rules: {
      // ── Bug Prevention ──────────────────────────────────────────────
      "eqeqeq": "error",                   // Require === instead of ==
      "no-unreachable": "error",            // Code after return/throw
      "no-constant-condition": "warn",      // if (true) { ... }
      "no-duplicate-imports": "error",      // Two imports from same module
      "no-self-compare": "error",           // x === x (always true)
      "no-template-curly-in-string": "warn", // "${x}" in regular string

      // ── Modern JS ──────────────────────────────────────────────────
      "no-var": "error",                    // Use let/const instead
      "prefer-const": "error",              // const when never reassigned
      "prefer-arrow-callback": "warn",      // () => {} over function() {}
      "prefer-template": "warn",            // Template literals over +
      "object-shorthand": "warn",           // { x } instead of { x: x }

      // ── Code Quality ───────────────────────────────────────────────
      "no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",            // Allow _unused params
        varsIgnorePattern: "^_",
      }],
      "no-console": "off",                  // Allow console (turn on for prod)
      "curly": ["error", "multi-line"],     // Require {} for multi-line blocks
      "no-throw-literal": "error",          // throw new Error(), not throw "msg"
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Test File Overrides
  // ─────────────────────────────────────────────────────────────────────────
  {
    files: ["**/*.test.js", "**/*.spec.js"],

    languageOptions: {
      globals: {
        // Vitest globals (describe, it, expect, vi, etc.)
        ...globals.browser,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },

    rules: {
      // Relax rules for test files
      "no-unused-vars": "off",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Prettier Integration (must be LAST)
  //    Disables ESLint rules that conflict with Prettier's formatting.
  //    Uncomment after installing: npm install -D eslint-config-prettier
  // ─────────────────────────────────────────────────────────────────────────
  // prettier,

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Ignored Paths
  // ─────────────────────────────────────────────────────────────────────────
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "*.min.js",
      "coverage/",
    ],
  },
];
