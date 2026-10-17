/**
 * Chapter 18 — Example: vite.config.example.js
 *
 * This is an annotated Vite configuration file. Copy it to your project root
 * as `vite.config.js` and customize as needed.
 *
 * Docs: https://vitejs.dev/config/
 *
 * NOTE: This file is not meant to be run directly. It is a reference config.
 */

import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // ─────────────────────────────────────────────────────────────────────────
  // Root directory for the project (where index.html lives)
  // Default: process.cwd()
  // ─────────────────────────────────────────────────────────────────────────
  root: ".",

  // ─────────────────────────────────────────────────────────────────────────
  // Base public path (useful when deploying to a subdirectory)
  // Default: "/"
  // Example: "/my-app/" for https://example.com/my-app/
  // ─────────────────────────────────────────────────────────────────────────
  base: "/",

  // ─────────────────────────────────────────────────────────────────────────
  // Dev Server Options
  // ─────────────────────────────────────────────────────────────────────────
  server: {
    port: 3000,         // Dev server port (default: 5173)
    open: true,         // Auto-open browser on start
    strictPort: false,  // If true, fail if port is already in use

    // Proxy API requests to a backend during development
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Build Options
  // ─────────────────────────────────────────────────────────────────────────
  build: {
    outDir: "dist",       // Output directory (default: "dist")
    sourcemap: true,      // Generate source maps for debugging
    minify: "esbuild",    // Minifier: "esbuild" (fast) or "terser" (smaller)

    // Warn if a chunk exceeds this size (in kB)
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      // Customize Rollup options if needed
      output: {
        // Manual chunk splitting example:
        // manualChunks: {
        //   vendor: ["react", "react-dom"],
        // },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Path Aliases
  // ─────────────────────────────────────────────────────────────────────────
  resolve: {
    alias: {
      // Use "@" as a shortcut for the "src" directory
      // import Button from "@/components/Button.js";
      "@": resolve(import.meta.dirname, "src"),

      // Add more aliases as needed
      // "@utils": resolve(import.meta.dirname, "src/utils"),
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CSS Options
  // ─────────────────────────────────────────────────────────────────────────
  css: {
    // Enable CSS modules for .module.css files (enabled by default)
    modules: {
      localsConvention: "camelCase", // .my-class → styles.myClass
    },

    // PostCSS config can also go here
    // postcss: { plugins: [...] },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Environment Variables
  // ─────────────────────────────────────────────────────────────────────────
  // By default, only variables prefixed with VITE_ are exposed to client code.
  // Create .env files for different modes:
  //   .env                 → loaded in all cases
  //   .env.development     → loaded in dev mode
  //   .env.production      → loaded in production build
  //
  // Access in code: import.meta.env.VITE_API_URL
  //
  // To change the prefix (not recommended):
  // envPrefix: "APP_",

  // ─────────────────────────────────────────────────────────────────────────
  // Plugins
  // ─────────────────────────────────────────────────────────────────────────
  plugins: [
    // Add Vite plugins here. Examples:
    // import react from "@vitejs/plugin-react";
    // react(),
    //
    // import legacy from "@vitejs/plugin-legacy";
    // legacy({ targets: ["defaults", "not IE 11"] }),
  ],
});
