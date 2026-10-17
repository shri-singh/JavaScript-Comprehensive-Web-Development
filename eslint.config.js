import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // ── Bug prevention ──
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      eqeqeq: ["error", "always"],
      "no-implicit-coercion": "warn",

      // ── Modern JS ──
      "no-var": "error",
      "prefer-const": "warn",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",

      // ── Code quality ──
      "no-console": "off",
      curly: ["warn", "multi-line"],
      "no-throw-literal": "error",
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "**/solution/",
      "examples-node/phase-03/ch-18-tooling/",
    ],
  },
];
