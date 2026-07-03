import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // asm/ is AssemblyScript — TypeScript syntax, but compiled by asc, not tsc.
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "asm/**"] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
