import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { scopedRecoveryPlugin } from "./scripts/scoped-recovery-plugin.ts";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/babylon-lite-squaretris-multiplayer/",
  plugins: [scopedRecoveryPlugin(repositoryRoot), react()],
  root: "tetris",
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
