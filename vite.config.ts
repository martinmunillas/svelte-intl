import { svelteIntl } from "./src/lib/vite/plugin";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    svelteIntl({ localesDir: "./src/translations", defaultLocale: "en-us" }),
  ],
});
