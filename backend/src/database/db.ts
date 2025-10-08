// TODO: add tags, subtasks and joins for them to task
// TODO: refactor for smaller file size
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CreateTaskRequest, Task } from "./types";
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

const SORT_INDEX_STEP = 10;

const createTasksTableSQL = `
  CREATE TABLE tasks_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority INTEGER CHECK(priority IN (1, 2, 3, 4, 5)) NOT NULL DEFAULT 5,
    sort_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    status TEXT CHECK(status IN ('next', 'dates', 'ongoing', 'get', 'backburner', 'finished')) NOT NULL DEFAULT 'next'
  )
`;

const recreateTaskIndexesSQL = `
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_status_sort_index ON tasks(status, sort_index);
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

function initializeDatabase(): void {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );
  db.exec(schemaSQL);
  migrateTasksTableStatusConstraint();
  ensureTaskSortIndexColumn();
}

initializeDatabase();

type DbTaskRow = {
  id: number;
  title: string;
  description: string | null;
  priority: number | null;
  sort_index: number | null;
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
    sortIndex: row.sort_index ?? null,
    tags: [],
    subtasks: [],
  };
};

export const statements: { [k: string]: Database.Statement } = {
  insertTask: db.prepare(`
        INSERT INTO tasks (title, status, sort_index) 
        VALUES (?, ?, ?)
    `),
  selectActiveTasks: db.prepare(`
        SELECT * FROM tasks 
        WHERE deleted_at IS NULL 
        ORDER BY 
          priority ASC,
          CASE WHEN status = 'finished' THEN 1 ELSE 0 END,
          COALESCE(sort_index, 0) ASC,
          created_at DESC
    `),
  selectAllTasks: db.prepare(`
        SELECT * FROM tasks 
        ORDER BY 
          priority ASC,
          CASE WHEN status = 'finished' THEN 1 ELSE 0 END,
          COALESCE(sort_index, 0) ASC,
          created_at DESC
    `),
  selectTaskById: db.prepare(
    "SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL"
  ),
  selectDeletedTasks: db.prepare(`
        SELECT * FROM tasks
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
    `),
  updateTaskTitle: db.prepare(
    `
        UPDATE tasks 
        SET title = ?
        WHERE id = ? AND deleted_at IS NULL
    `
  ),
  updateTaskPriority: db.prepare(
    "UPDATE tasks SET priority = ? WHERE id = ? AND deleted_at IS NULL"
  ),
  updateTaskSortIndexWithinStatus: db.prepare(
    `
      UPDATE tasks
      SET sort_index = ?
      WHERE id = ?
        AND status = ?
        AND deleted_at IS NULL
    `
  ),
  clearTaskSortIndex: db.prepare(
    "UPDATE tasks SET sort_index = NULL WHERE id = ?"
  ),
  selectMinSortIndexForStatus: db.prepare(
    `
      SELECT MIN(sort_index) as min_sort_index
      FROM tasks
      WHERE status = ?
        AND deleted_at IS NULL
        AND sort_index IS NOT NULL
    `
  ),
  softDeleteTask: db.prepare(
    `
      UPDATE tasks
      SET deleted_at = CURRENT_TIMESTAMP,
          priority = 5,
          sort_index = NULL
      WHERE id = ? AND deleted_at IS NULL
    `
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

  getMinSortIndexForStatus: (status: Status): number | null => {
    const result = statements.selectMinSortIndexForStatus.get(status) as
      | { min_sort_index: number | null }
      | undefined;
    return result?.min_sort_index ?? null;
  },

  create: (TaskData: CreateTaskRequest): { id: number } => {
    const status: Status = TaskData.status ?? "next";
    const shouldAssignSortIndex = status !== "finished";
    const minSortIndex = shouldAssignSortIndex
      ? taskQueries.getMinSortIndexForStatus(status)
      : null;
    const nextSortIndex = shouldAssignSortIndex
      ? (minSortIndex ?? SORT_INDEX_STEP) - SORT_INDEX_STEP
      : null;
    const result = statements.insertTask.run(
      TaskData.title,
      status,
      nextSortIndex
    );
    return { id: result.lastInsertRowid as number };
  },

  updateTitle: (id: number, title: string): { changes: number } => {
    const result = statements.updateTaskTitle.run(title, id);
    return { changes: result.changes };
  },

  updatePriority: (
    id: number,
    priority: Task["priority"]
  ): { changes: number } => {
    const result = statements.updateTaskPriority.run(priority, id);
    return { changes: result.changes };
  },

  updateSortOrder: (
    status: Status,
    orderedTaskIds: number[]
  ): { updated: number } => {
    if (status === "finished") {
      return { updated: 0 };
    }

    const applySortOrder = db.transaction((ids: number[]): number => {
      let updated = 0;
      ids.forEach((taskId, index) => {
        const sortIndex = (index + 1) * SORT_INDEX_STEP;
        const result = statements.updateTaskSortIndexWithinStatus.run(
          sortIndex,
          taskId,
          status
        );
        updated += result.changes ?? 0;
      });
      return updated;
    });

    const updated = applySortOrder(orderedTaskIds);
    return { updated };
  },

  clearSortIndex: (taskId: number): void => {
    statements.clearTaskSortIndex.run(taskId);
  },

  delete: (id: number): { changes: number } => {
    const result = statements.softDeleteTask.run(id);
    return { changes: result.changes };
  },
};

export default db;
