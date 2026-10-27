import { resolve } from "node:path";
import type { Plugin } from "vite";

/** Patch only recovery storage in the pinned SDK and Invaders recovery modules. */
export function scopedRecoveryPlugin(root: string): Plugin {
  const helper = JSON.stringify(resolve(root, "scripts/recovery-storage.ts").replaceAll("\\", "/"));
  return {
    name: "instance-scoped-game-recovery",
    enforce: "pre",
    transform(source, id) {
      const path = id.split("?", 1)[0]?.replaceAll("\\", "/") ?? "";
      const sdk = /\/@rmc\/multiplayer-client\/(?:index|asteroids-connection)\.js$/.test(path);
      const invaders = /\/space-invaders\/src\/content\/(?:Content\.jsx|game\/session\.js)$/.test(path);
      if (!sdk && !invaders) return;
      if (invaders && !source.includes("localStorage")) return;
      if (sdk && !source.includes("sessionStorage")) return;
      const storage = invaders ? "localStorage" : "sessionStorage";
      const patched = source.replaceAll(`globalThis.${storage}`, storage);
      return { code: `import { recoveryStorage as ${storage} } from ${helper};\n${patched}`, map: null };
    },
  };
}

