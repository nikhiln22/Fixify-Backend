import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);



// import { defineConfig } from "eslint/config";
// import globals from "globals";
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";


// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,ts}"] },
//   { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
//   { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
//   tseslint.configs.recommended,
// ]);
