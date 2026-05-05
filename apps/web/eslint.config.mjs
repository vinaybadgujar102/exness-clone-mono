import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", ".next/**"],
  },
  ...nextJsConfig,
];
