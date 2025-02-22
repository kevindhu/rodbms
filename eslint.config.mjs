import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1) Pull in default Next + TypeScript config
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2) Override or disable rules here
  {
    rules: {
      // Example: disable the no-unused-vars rule from @typescript-eslint
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
