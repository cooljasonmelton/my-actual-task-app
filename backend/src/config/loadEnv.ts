import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __MY_ACTUAL_TASK_APP_ENV_LOADED__: boolean | undefined;
}

const parseValue = (value: string): string => {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const loadEnvFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    let key = trimmedLine.slice(0, separatorIndex).trim();

    if (key.startsWith("export ")) {
      key = key.slice("export ".length).trim();
    }

    if (!key || process.env[key] !== undefined) {
      return;
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1);
    process.env[key] = parseValue(rawValue);
  });
};

const loadEnvironment = () => {
  if (globalThis.__MY_ACTUAL_TASK_APP_ENV_LOADED__) {
    return;
  }

  const backendRoot = path.resolve(__dirname, "..", "..");
  const baseEnvPath = path.join(backendRoot, ".env");

  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "development";
  const envSpecificPath = path.join(backendRoot, `.env.${appEnv}`);

  [baseEnvPath, envSpecificPath].forEach(loadEnvFile);

  globalThis.__MY_ACTUAL_TASK_APP_ENV_LOADED__ = true;
};

loadEnvironment();

export {}; // ensure this module is treated as a module
