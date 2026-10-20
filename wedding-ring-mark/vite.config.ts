// Builds Mark's wedding ring designer (mark/src, his repo unchanged) for the Shopify section, into
// ../assets/wedding-ring-builder.js (one ES module; his stylesheet is inlined and attached inside a shadow root).
// The adapter (shop/) stands in for what his Lovable app got elsewhere:
//   @tanstack/react-router  -> shop/router.tsx   (no router on Shopify; links go to the website's pages)
//   lib/shopify-cart        -> shop/cart.ts      (the shop's own cart, /cart/add.js; staff: back to the dashboard)
//   lib/pricing/use-ring-price -> shop/price.ts  (the wedding ring API on the droplet, same request and reply)
//   @radix-ui/react-dialog  -> shop/dialog.tsx   (dialogs open inside the shadow root)
//   photos (*.asset.json, *.jpg, "/images/...") and models (/models/*.glb) -> the Shopify CDN copies (shop/cdn-manifest.json)
//   RingDesigner.tsx        -> the patches in shop/patches.mjs
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RING_DESIGNER_PATCHES, applyPatches } from "./shop/patches.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const MARK = path.join(here, "mark", "src");
const SHOP = path.join(here, "shop");
const manifest = JSON.parse(readFileSync(path.join(SHOP, "cdn-manifest.json"), "utf8")) as {
  images: Record<string, { url: string }>;
  models: Record<string, { url: string }>;
};
const direct = JSON.parse(readFileSync(path.join(SHOP, "cdn-direct.json"), "utf8")) as Record<string, string>;
const inMark = (id?: string) => !!id && path.resolve(id.split("?")[0]).startsWith(MARK);
const fail = (msg: string): never => { throw new Error(`[wedding-ring-mark] ${msg}`); };

function shopAdapter(): Plugin {
  const realDialog = path.join(here, "node_modules", "@radix-ui", "react-dialog", "dist", "index.mjs");
  return {
    name: "wedding-ring-shop-adapter",
    enforce: "pre",
    async resolveId(source, importer) {
      if (source === "@tanstack/react-router") return path.join(SHOP, "router.tsx");
      if (source === "radix-dialog-real") return realDialog;
      if (source === "@radix-ui/react-dialog") return path.join(SHOP, "dialog.tsx");
      if (source.startsWith("@/")) return this.resolve(path.join(MARK, source.slice(2)), importer, { skipSelf: true });
      if (inMark(importer)) {
        if (/(^|\/)lib\/shopify-cart$/.test(source)) return path.join(SHOP, "cart.ts");
        if (/(^|\/)pricing\/use-ring-price$/.test(source) || source === "./use-ring-price") return path.join(SHOP, "price.ts");
        if (source.endsWith(".asset.json")) return "\0wr-asset:" + path.resolve(path.dirname(importer!), source) + ".js"; // not *.json, or vite:json claims it
        if (/\.(jpe?g|png|webp)$/i.test(source)) return "\0wr-img:" + path.basename(source);
      }
      return null;
    },
    load(id) {
      if (id.startsWith("\0wr-asset:")) {
        const j = JSON.parse(readFileSync(id.slice("\0wr-asset:".length, -".js".length), "utf8"));
        const key = String(j.url || "").replace(/^\/images\//, "");
        const url = manifest.images[key]?.url ?? fail(`no Shopify CDN copy of ${j.url} (${j.original_filename}) in shop/cdn-manifest.json`);
        return `export default ${JSON.stringify({ ...j, url })};`;
      }
      if (id.startsWith("\0wr-img:")) {
        const name = id.slice("\0wr-img:".length);
        return `export default ${JSON.stringify(direct[name] ?? fail(`no Shopify CDN copy of ${name} in shop/cdn-direct.json`))};`;
      }
      return null;
    },
    transform(code, id) {
      const file = id.split("?")[0];
      if (file === path.join(MARK, "data", "ring-models.ts")) {
        return code.replace(/"\/models\/[0-9a-f]+-([a-z0-9]+)\.glb"/g, (_m, ring: string) =>
          JSON.stringify(manifest.models[ring]?.url ?? fail(`no Shopify CDN copy of the ${ring} model`)));
      }
      if (file === path.join(MARK, "data", "rings.ts")) {
        // His signature photos are plain "/images/<file>" paths (Lovable served them); point them at the CDN copies.
        // His list has "ea" twice (a slip; his published preview shows it once): keep the first of each id.
        return code.replace(/"\/images\/([^"]+)"/g, (_m, key: string) =>
          JSON.stringify(manifest.images[key]?.url ?? fail(`no Shopify CDN copy of /images/${key}`)))
          + "\nRINGS.splice(0, RINGS.length, ...RINGS.filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i));\n";
      }
      if (file === path.join(MARK, "components", "RingDesigner.tsx")) {
        const patched = applyPatches(code, RING_DESIGNER_PATCHES, "RingDesigner.tsx");
        return `import * as __shop from ${JSON.stringify(path.join(SHOP, "shop.ts"))};\n${patched}`;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [shopAdapter(), react(), tailwindcss()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: path.join(here, "..", "assets"),
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: false,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: path.join(SHOP, "main.tsx"),
      preserveEntrySignatures: false,
      output: { format: "es", entryFileNames: "wedding-ring-builder.js", inlineDynamicImports: true },
    },
    chunkSizeWarningLimit: 4000,
  },
});
