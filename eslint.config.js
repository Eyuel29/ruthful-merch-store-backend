import { defineConfig } from "eslint/config";
import * as tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
  {
    files: ["**/*.{ts,js}"],
    ignores: ["dist", "node_modules", "tests"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier,
    },
    rules: {
      semi: "error",
      eqeqeq: ["error", "always"],
      curly: "error",
      camelcase: ["error", { properties: "always" }],
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prettier/prettier": "error",
    },
  },
]);
