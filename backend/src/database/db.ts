import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Status } from "../../../shared/types/task";
import { getDatabasePath } from "../config/databasePath";

// Create or open database using configurable path
const dbPath = getDatabasePath({ ensureDir: true, warnOnTestFile: true });
const db: Database.Database = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

const REQUIRED_STATUS_VALUES = [
  "next",
  "dates",
  "ongoing",
  "get",
  "watch",
  "backburner",
  "finished",
];

export const SORT_INDEX_STEP = 10;

const createTasksTableSQL = `
  CREATE TABLE tasks_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority INTEGER CHECK(priority IN (1, 2, 3, 4, 5)) NOT NULL DEFAULT 5,
    sort_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    status TEXT CHECK(status IN ('next', 'dates', 'ongoing', 'get', 'watch', 'backburner', 'finished')) NOT NULL DEFAULT 'next'
  )
`;

const recreateTaskIndexesSQL = `
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_status_sort_index ON tasks(status, sort_index);
  CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
`;

const recreateSubtaskIndexesSQL = `
  CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
  CREATE INDEX IF NOT EXISTS idx_subtasks_task_id_sort_index ON subtasks(task_id, sort_index);
  CREATE INDEX IF NOT EXISTS idx_subtasks_deleted_at ON subtasks(deleted_at);
`;

const createSubtasksTempTableSQL = `
  CREATE TABLE subtasks_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    sort_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`;

function migrateTasksTableStatusConstraint(): void {
  const tableDefinition = db
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'tasks'"
    )
    .get() as { sql: string } | undefined;

  if (!tableDefinition?.sql) {
    return;
  }

  const hasAllStatuses = REQUIRED_STATUS_VALUES.every((status) =>
    tableDefinition.sql.includes(`'${status}'`)
  );

  if (hasAllStatuses) {
    return;
  }

  db.exec(`
    BEGIN TRANSACTION;
    ${createTasksTableSQL};
    INSERT INTO tasks_new (id, title, description, priority, created_at, deleted_at, status)
    SELECT
      id,
      title,
      description,
      priority,
      created_at,
      deleted_at,
      CASE
        WHEN status IN ('next', 'dates', 'ongoing', 'get', 'watch', 'backburner', 'finished') THEN status
        ELSE 'next'
      END as status
    FROM tasks;
    DROP TABLE tasks;
    ALTER TABLE tasks_new RENAME TO tasks;
    ${recreateTaskIndexesSQL}
    COMMIT;
  `);
}

const initializeSortIndexForStatus = db.transaction((status: Status) => {
  if (status === "finished") {
    db.prepare("UPDATE tasks SET sort_index = NULL WHERE status = ?").run(
      status
    );
    return;
  }

  const selectTaskIds = db.prepare(
    `
      SELECT id
      FROM tasks
      WHERE status = ?
        AND deleted_at IS NULL
      ORDER BY priority ASC, created_at DESC
    `
  );

  const updateSortIndex = db.prepare(
    "UPDATE tasks SET sort_index = ? WHERE id = ?"
  );

  const rows = selectTaskIds.all(status) as { id: number }[];
  rows.forEach((row, index) => {
    updateSortIndex.run((index + 1) * SORT_INDEX_STEP, row.id);
  });

  db.prepare(
    "UPDATE tasks SET sort_index = NULL WHERE status = ? AND deleted_at IS NOT NULL"
  ).run(status);
});

function ensureTaskSortIndexColumn(): void {
  const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
    name: string;
  }>;

  const hasSortIndex = columns.some((column) => column.name === "sort_index");
  let columnWasAdded = false;

  if (!hasSortIndex) {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN sort_index INTEGER;
      CREATE INDEX IF NOT EXISTS idx_tasks_status_sort_index ON tasks(status, sort_index);
    `);
    columnWasAdded = true;
  } else {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status_sort_index ON tasks(status, sort_index);
    `);
  }

  const statusesNeedingSortInitialization = columnWasAdded
    ? REQUIRED_STATUS_VALUES
    : (
        db
          .prepare(
            `
            SELECT DISTINCT status
            FROM tasks
            WHERE sort_index IS NULL
              AND status IS NOT NULL
              AND status <> 'finished'
              AND deleted_at IS NULL
          `
          )
          .all() as Array<{ status: string }>
      ).map((row) => row.status);

  statusesNeedingSortInitialization.forEach((status) => {
    initializeSortIndexForStatus(status as Status);
  });

  db.exec("UPDATE tasks SET sort_index = NULL WHERE deleted_at IS NOT NULL");
}

function migrateSubtasksTable(): void {
  const columns = db.prepare("PRAGMA table_info(subtasks)").all() as Array<{
    name: string;
  }>;

  if (columns.length === 0) {
    db.exec(recreateSubtaskIndexesSQL);
    return;
  }

  const hasSortIndex = columns.some((column) => column.name === "sort_index");
  const hasDeletedAt = columns.some((column) => column.name === "deleted_at");
  const hasCompletedColumn = columns.some(
    (column) => column.name === "completed" || column.name === "completed_at"
  );

  if (hasSortIndex && hasDeletedAt && !hasCompletedColumn) {
    db.exec(recreateSubtaskIndexesSQL);
    db.exec(
      "UPDATE subtasks SET sort_index = NULL WHERE deleted_at IS NOT NULL"
    );
    return;
  }

  const selectSortIndex = hasSortIndex ? "sort_index" : "NULL";
  const selectDeletedAt = hasDeletedAt ? "deleted_at" : "NULL";
  const hasCreatedAt = columns.some((column) => column.name === "created_at");
  const selectCreatedAt = hasCreatedAt ? "created_at" : "CURRENT_TIMESTAMP";

  db.exec(`
    BEGIN TRANSACTION;
    ${createSubtasksTempTableSQL};
    INSERT INTO subtasks_new (id, task_id, title, sort_index, created_at, deleted_at)
    SELECT id, task_id, title, ${selectSortIndex}, ${selectCreatedAt}, ${selectDeletedAt}
    FROM subtasks;
    DROP TABLE subtasks;
    ALTER TABLE subtasks_new RENAME TO subtasks;
    ${recreateSubtaskIndexesSQL}
    COMMIT;
  `);

  db.exec("UPDATE subtasks SET sort_index = NULL WHERE deleted_at IS NOT NULL");
}

function initializeDatabase(): void {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );
  db.exec(schemaSQL);
  migrateTasksTableStatusConstraint();
  ensureTaskSortIndexColumn();
  migrateSubtasksTable();
}

initializeDatabase();

export default db;
