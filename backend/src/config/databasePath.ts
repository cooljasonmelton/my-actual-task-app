import fs from "fs";
import path from "path";

const BACKEND_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_DB_FILENAME = "database.db";

export const DEFAULT_ENV_DATABASES: Record<string, string> = {
  personal: path.join("data", "tasks.personal.sqlite"),
  development: path.join("data", "tasks.dev.sqlite"),
};

export const ensureDirectoryFor = (filePath: string) => {
  if (filePath === ":memory:") {
    return;
  }

  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const resolveRelativeToBackend = (filePath: string): string => {
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(BACKEND_ROOT, filePath);
};

const getFallbackDatabasePath = (): string => {
  return resolveRelativeToBackend(DEFAULT_DB_FILENAME);
};

interface GetDatabasePathOptions {
  databasePath?: string | null;
  appEnv?: string | null;
  nodeEnv?: string | null;
  ensureDir?: boolean;
  warnOnTestFile?: boolean;
}

export const getDatabasePath = (
  options: GetDatabasePathOptions = {}
): string => {
  const {
    databasePath = process.env.DATABASE_PATH,
    appEnv = process.env.APP_ENV,
    nodeEnv = process.env.NODE_ENV,
    ensureDir = false,
    warnOnTestFile = false,
  } = options;

  if (databasePath && databasePath.trim().length > 0) {
    if (databasePath === ":memory:") {
      return databasePath;
    }

    const absolutePath = resolveRelativeToBackend(databasePath);

    if (ensureDir) {
      ensureDirectoryFor(absolutePath);
    }

    if (warnOnTestFile && nodeEnv === "test") {
      console.warn(
        "DATABASE_PATH points to a file while NODE_ENV=test; tests may mutate persistent data.",
        absolutePath
      );
    }

    return absolutePath;
  }

  if (nodeEnv === "test") {
    return ":memory:";
  }

  const envKey = appEnv ?? "";
  const envSpecificPath = DEFAULT_ENV_DATABASES[envKey];

  const resolvedPath = envSpecificPath
    ? resolveRelativeToBackend(envSpecificPath)
    : getFallbackDatabasePath();

  if (ensureDir) {
    ensureDirectoryFor(resolvedPath);
  }

  return resolvedPath;
};
