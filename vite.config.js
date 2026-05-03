import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(resolve(currentDirectory, "package.json"), "utf8"));

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
  },
  build: {
    outDir: "dist",
  },
});
