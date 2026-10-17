# ESLint & Prettier Configuration

This course uses **ESLint v9** (flat config) and **Prettier v3** for consistent code style.

## Files

| File | Purpose |
|------|---------|
| `/eslint.config.js` | ESLint flat config — rules for bugs, modern JS, code quality |
| `/.prettierrc` | Prettier formatting options |
| `/.prettierignore` | Files Prettier should skip |

## Key Rules

### ESLint

- `eqeqeq` — always use `===` instead of `==`
- `no-var` — use `let`/`const` instead
- `prefer-const` — use `const` when a variable is never reassigned
- `prefer-template` — use template literals instead of string concatenation
- `no-unused-vars` — warn on unused variables (ignores args starting with `_`)

### Prettier

- Semicolons: **yes**
- Quotes: **single**
- Trailing commas: **all**
- Print width: **90**
- Indent: **2 spaces**

## Usage

```bash
# From the repository root:
npm run lint          # Check for lint errors
npm run format        # Auto-format all files
npm run format:check  # Check formatting without writing
```

## VS Code Integration

Install these extensions for automatic linting and formatting:

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Add to your `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.useFlatConfig": true
}
```
