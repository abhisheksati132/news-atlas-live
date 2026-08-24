import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "public/data/**", "*.cjs"]
  },
  {
    files: ["public/js/**/*.js", "src/**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
        mapboxgl: "readonly",
        topojson: "readonly",
        escapeHtml: "readonly",
        io: "readonly",
        MapboxEngine: "readonly"
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_|^err|^e$" }],
      "no-console": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "preserve-caught-error": "off"
    }
  },
  {
    files: ["api/**/*.js", "scripts/**/*.js", "server.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "preserve-caught-error": "off"
    }
  }
];
