// TODO: add tags, subtasks and joins for them to task

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CreateTaskRequest, Task, UpdateTaskRequest } from "./types";
import type { Status, Priority } from "../../../shared/types/task";

// Create or open database
const db: Database.Database = new Database("database.db");

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

function initializeDatabase(): void {
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, "schema.sql"),
    "utf-8"
  );
  db.exec(schemaSQL);
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

const mapDbTaskToTask = (row: DbTaskRow): Task => {
  const priorityValue =
    row.priority === null || row.priority === undefined
      ? 5
      : Number(row.priority);
  const statusValue = (row.status ?? "next") as Status;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: priorityValue as Priority,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at
        : new Date(row.created_at),
    deletedAt: row.deleted_at
      ? row.deleted_at instanceof Date
        ? row.deleted_at
        : new Date(row.deleted_at)
      : null,
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
        ORDER BY priority DESC, created_at DESC
    `),
  selectAllTasks: db.prepare(`
        SELECT * FROM tasks 
        ORDER BY priority DESC, created_at DESC
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
  softDeleteTask: db.prepare(
    "UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL"
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

  delete: (id: number): { changes: number } => {
    const result = statements.softDeleteTask.run(id);
    return { changes: result.changes };
  },
};

export default db;
