import "../src/config/loadEnv";
import { getDatabasePath } from "../src/config/databasePath";
import "../src/database/db";

const dbPath = getDatabasePath({ ensureDir: true });
console.log(`Database initialized at ${dbPath}`);
