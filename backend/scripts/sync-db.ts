import '../src/config/loadEnv';
import fs from 'fs';
import path from 'path';
import { DEFAULT_ENV_DATABASES, getDatabasePath, ensureDirectoryFor } from '../src/config/databasePath';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};

  args.forEach((arg) => {
    if (!arg.startsWith('--')) {
      return;
    }
    const [rawKey, rawValue] = arg.slice(2).split('=');
    if (!rawKey) {
      return;
    }
    options[rawKey] = rawValue ?? 'true';
  });

  return options;
};

const options = parseArgs();

const sourceEnv = options.from ?? options.source ?? 'personal';
const targetEnv = options.to ?? options.target ?? 'development';
const sourcePathOverride = options['from-path'];
const targetPathOverride = options['to-path'];

const resolvePathForEnv = (envName: string, override?: string): string => {
  if (override) {
    return override === ':memory:' ? override : path.resolve(override);
  }

  const envSpecific = DEFAULT_ENV_DATABASES[envName];

  if (!envSpecific) {
    throw new Error(
      `No default database path configured for environment "${envName}". Provide --from-path/--to-path.`
    );
  }

  return getDatabasePath({
    appEnv: envName,
    nodeEnv: 'production',
    databasePath: envSpecific,
    ensureDir: true,
  });
};

const sourcePath = resolvePathForEnv(sourceEnv, sourcePathOverride);
const targetPath = resolvePathForEnv(targetEnv, targetPathOverride);

if (sourcePath === ':memory:' || targetPath === ':memory:') {
  throw new Error('Cannot sync to or from an in-memory database.');
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source database does not exist: ${sourcePath}`);
}

if (path.resolve(sourcePath) === path.resolve(targetPath)) {
  console.log('Source and target database paths are identical; nothing to do.');
  process.exit(0);
}

ensureDirectoryFor(targetPath);

const copyFileIfExists = (fromPath: string, toPath: string) => {
  if (!fs.existsSync(fromPath)) {
    return;
  }
  fs.copyFileSync(fromPath, toPath);
};

const suffixes = ['', '-wal', '-shm'];

suffixes.forEach((suffix) => {
  const sourceFile = `${sourcePath}${suffix}`;
  const targetFile = `${targetPath}${suffix}`;

  if (!fs.existsSync(sourceFile)) {
    if (suffix === '') {
      throw new Error(`Source database file missing expected component: ${sourceFile}`);
    }
    return;
  }

  copyFileIfExists(sourceFile, targetFile);
});

console.log(`Synchronized database from ${sourcePath} -> ${targetPath}`);
