import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { UserConfig as VitestUserConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // @ts-expect-error Vitest augments Vite config with `test`
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    globals: true,
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "dist/", "src/**/*.d.ts"],
    },
  } satisfies VitestUserConfig["test"],
});
