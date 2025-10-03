// TODO: add tags, subtasks and joins for them to task

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { CreateTaskRequest, Task, UpdateTaskRequest } from "./types";

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
    return statement.all() as Task[];
  },

  getDeleted: (): Task[] => {
    return statements.selectDeletedTasks.all() as Task[];
  },

  getById: (id: number): Task | undefined => {
    return statements.selectTaskById.get(id) as Task | undefined;
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
