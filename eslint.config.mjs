import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "node_modules/**",
    "next-env.d.ts",
    "cloudflare-env.d.ts",
    "migrations/**",
    "marketing/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // The Aback mark is a 6 KB static PNG; next/image adds nothing on Workers with unoptimized images.
      "@next/next/no-img-element": "off",
    },
  },
]);
