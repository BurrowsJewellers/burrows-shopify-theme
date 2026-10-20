import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Builds the designer into two theme assets: assets/wedding-ring-builder.js (one ES module, loaded with
// type="module" by sections/wedding-ring-builder.liquid) and assets/wedding-ring-builder.css.
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: fileURLToPath(new URL("../assets", import.meta.url)),
    emptyOutDir: false,
    assetsDir: "",
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: fileURLToPath(new URL("./src/main.tsx", import.meta.url)),
      output: {
        format: "es",
        inlineDynamicImports: true,
        entryFileNames: "wedding-ring-builder.js",
        assetFileNames: "wedding-ring-builder.[ext]",
      },
    },
  },
});
