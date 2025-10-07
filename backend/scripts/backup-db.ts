import '../src/config/loadEnv';
import fs from 'fs';
import path from 'path';

const resolveDatabasePath = () => {
  const configuredPath = process.env.DATABASE_PATH;
  if (configuredPath && configuredPath.trim().length > 0 && configuredPath !== ':memory:') {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath);
  }
  return path.resolve(__dirname, '..', 'database.db');
};

const sourcePath = resolveDatabasePath();

if (!fs.existsSync(sourcePath)) {
  console.error(`No database found at ${sourcePath}`);
  process.exit(1);
}

const backupDir = path.resolve(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-');

const extension = path.extname(sourcePath) || '.db';
const baseName = path.basename(sourcePath, extension);
const backupPath = path.join(backupDir, `${baseName}-${timestamp}${extension}`);

fs.copyFileSync(sourcePath, backupPath);
console.log(`Database backup created at ${backupPath}`);

const walPath = `${sourcePath}-wal`;
const shmPath = `${sourcePath}-shm`;

const copyIfExists = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    const backupFile = path.join(
      backupDir,
      `${path.basename(filePath)}-${timestamp}`
    );
    fs.copyFileSync(filePath, backupFile);
    console.log(`Checkpoint file backed up at ${backupFile}`);
  }
};

copyIfExists(walPath);
copyIfExists(shmPath);
