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
  selectAllTasks: db.prepare(`
        SELECT * FROM tasks 
        WHERE deleted_at IS NULL 
        ORDER BY priority DESC, created_at DESC
    `),
  selectTaskById: db.prepare(
    "SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL"
  ),
  updateTask: db.prepare(`
        UPDATE tasks 
        SET title = ?, description = ?, priority = ?, status = ? 
        WHERE id = ? AND deleted_at IS NULL
    `),
  softDeleteTask: db.prepare(
    "UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL"
  ),

  // // Tag statements
  // insertTag: db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)"),
  // selectTagByName: db.prepare("SELECT * FROM tags WHERE name = ?"),
  // selectTagsByTaskId: db.prepare(`
  //       SELECT t.* FROM tags t
  //       JOIN task_tags tt ON t.id = tt.tag_id
  //       WHERE tt.task_id = ?
  //   `),
  // insertTaskTag: db.prepare(
  //   "INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)"
  // ),
  // deleteTaskTags: db.prepare("DELETE FROM task_tags WHERE task_id = ?"),

  // // Subtask statements
  // insertSubtask: db.prepare(
  //   "INSERT INTO subtasks (task_id, title) VALUES (?, ?)"
  // ),
  // selectSubtasksByTaskId: db.prepare(
  //   "SELECT * FROM subtasks WHERE task_id = ? ORDER BY created_at"
  // ),
  // deleteSubtasksByTaskId: db.prepare("DELETE FROM subtasks WHERE task_id = ?"),
};

export const taskQueries = {
  getAll: (): Task[] => {
    return statements.selectAllTasks.all() as Task[];
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
