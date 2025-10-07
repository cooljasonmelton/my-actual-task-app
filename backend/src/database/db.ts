// TODO: add tags, subtasks and joins for them to task

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CreateTaskRequest, Task, UpdateTaskRequest } from "./types";
import type { Status, Priority } from "../../../shared/types/task";
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
  "backburner",
  "finished",
];

const createTasksTableSQL = `
  CREATE TABLE tasks_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority INTEGER CHECK(priority IN (1, 2, 3, 4, 5)) NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    status TEXT CHECK(status IN ('next', 'dates', 'ongoing', 'get', 'backburner', 'finished')) NOT NULL DEFAULT 'next'
  )
`;

const recreateTaskIndexesSQL = `
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
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
        WHEN status IN ('next', 'dates', 'ongoing', 'get', 'backburner', 'finished') THEN status
        ELSE 'next'
      END as status
    FROM tasks;
    DROP TABLE tasks;
    ALTER TABLE tasks_new RENAME TO tasks;
    ${recreateTaskIndexesSQL}
    COMMIT;
  `);
}

function initializeDatabase(): void {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );
  db.exec(schemaSQL);
  migrateTasksTableStatusConstraint();
}

initializeDatabase();

type DbTaskRow = {
  id: number;
  title: string;
  description: string | null;
  priority: number | null;
  created_at: string | Date;
  deleted_at: string | Date | null;
  status: string | null;
};

const SERIALIZED_DATE_TIME_REGEX = /[Tt]|Z$|[+-]\d{2}:?\d{2}$/;

const parseSqliteDate = (value: string | Date | null): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const normalized = SERIALIZED_DATE_TIME_REGEX.test(value)
    ? value
    : `${value.replace(" ", "T")}Z`;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
};

const mapDbTaskToTask = (row: DbTaskRow): Task => {
  const priorityValue =
    row.priority === null || row.priority === undefined
      ? 5
      : Number(row.priority);
  const statusValue = (row.status ?? "next") as Status;

  const createdAt = parseSqliteDate(row.created_at);
  const deletedAt = parseSqliteDate(row.deleted_at);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: priorityValue as Priority,
    createdAt: createdAt ?? new Date(row.created_at),
    deletedAt,
    status: statusValue,
    tags: [],
    subtasks: [],
  };
};

export const statements: { [k: string]: Database.Statement } = {
  insertTask: db.prepare(`
        INSERT INTO tasks (title) 
        VALUES (?)
    `),
  selectActiveTasks: db.prepare(`
        SELECT * FROM tasks 
        WHERE deleted_at IS NULL 
        ORDER BY priority ASC, created_at DESC
    `),
  selectAllTasks: db.prepare(`
        SELECT * FROM tasks 
        ORDER BY priority ASC, created_at DESC
    `),
  selectTaskById: db.prepare(
    "SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL"
  ),
  selectDeletedTasks: db.prepare(`
        SELECT * FROM tasks
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
    `),
  updateTask: db.prepare(`
        UPDATE tasks 
        SET title = ?, description = ?, priority = ?, status = ? 
        WHERE id = ? AND deleted_at IS NULL
    `),
  updateTaskPriority: db.prepare(
    "UPDATE tasks SET priority = ? WHERE id = ? AND deleted_at IS NULL"
  ),
  softDeleteTask: db.prepare(
    "UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP, priority = 5 WHERE id = ? AND deleted_at IS NULL"
  ),

};

export const taskQueries = {
  getAll: (includeDeleted = false): Task[] => {
    const statement = includeDeleted
      ? statements.selectAllTasks
      : statements.selectActiveTasks;
    return (statement.all() as DbTaskRow[]).map(mapDbTaskToTask);
  },

  getDeleted: (): Task[] => {
    return (statements.selectDeletedTasks.all() as DbTaskRow[]).map(
      mapDbTaskToTask
    );
  },

  getById: (id: number): Task | undefined => {
    const row = statements.selectTaskById.get(id) as DbTaskRow | undefined;
    return row ? mapDbTaskToTask(row) : undefined;
  },

  create: (TaskData: CreateTaskRequest): { id: number } => {
    const result = statements.insertTask.run(TaskData.title);
    return { id: result.lastInsertRowid as number };
  },

  // TODO: update so tasks can update all fields and not just title
  update: (id: number, TaskData: UpdateTaskRequest): { changes: number } => {
    const result = statements.updateTask.run(TaskData.title, id);
    return { changes: result.changes };
  },

  updatePriority: (
    id: number,
    priority: Task["priority"]
  ): { changes: number } => {
    const result = statements.updateTaskPriority.run(priority, id);
    return { changes: result.changes };
  },

  delete: (id: number): { changes: number } => {
    const result = statements.softDeleteTask.run(id);
    return { changes: result.changes };
  },
};

export default db;
