/// <reference types="vite/client" />

import type { UserConfig as VitestUserConfig } from "vitest/config";

declare module "vite" {
  interface UserConfig {
    test?: VitestUserConfig["test"];
  }
  interface UserConfigExport {
    test?: VitestUserConfig["test"];
  }
}
