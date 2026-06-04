import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Env vars are declared in turbo.json globalEnv — the plugin lookup can be inconsistent.
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];