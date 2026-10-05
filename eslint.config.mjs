import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next-production/**",
      "node_modules/**",
      ".node_modules.install-backup-20260913/**",
      "__ai_factory__/**",
      "next-env.d.ts",
      "test-results/**",
      ".ai_factory/tests/*.cjs",
      ".ai_factory/tests/reports/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
