import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "convex/**",
      "actions/**",
      "scratch/**",
    ],
  },
  {
    rules: {
      // Allow unescaped entities in JSX (pre-existing in original files)
      "react/no-unescaped-entities": "off",
      // Allow unused vars as warnings only
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
