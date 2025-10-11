import type Database from "better-sqlite3";
import type { Status, Priority } from "../../../shared/types/task";
import db, { SORT_INDEX_STEP } from "./db";
import type { CreateTaskRequest, Task } from "./types";
import {
  getMinSortIndexForStatus,
  mapDbTaskToTask,
} from "./taskRepositoryUtils";

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

export type TaskStatementsType = {
  [key: string]: Database.Statement<unknown[], unknown>;
};

const statements: TaskStatementsType = {
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
  updateTaskStatus: db.prepare(
    `
      UPDATE tasks
      SET status = ?, sort_index = ?
      WHERE id = ? AND deleted_at IS NULL
    `
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
  hardDeleteTask: db.prepare(
    `
      DELETE FROM tasks
      WHERE id = ?
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

  create: (taskData: CreateTaskRequest): { id: number } => {
    const status: Status = taskData.status ?? "next";
    const shouldAssignSortIndex = status !== "finished";
    const minSortIndex = shouldAssignSortIndex
      ? getMinSortIndexForStatus(statements, status)
      : null;
    const nextSortIndex = shouldAssignSortIndex
      ? (minSortIndex ?? SORT_INDEX_STEP) - SORT_INDEX_STEP
      : null;
    const result = statements.insertTask.run(
      taskData.title,
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

  updateStatus: (id: number, status: Status): Task | undefined => {
    const existingRow = statements.selectTaskById.get(id) as
      | DbTaskRow
      | undefined;

    if (!existingRow) {
      return undefined;
    }

    const currentStatus = (existingRow.status ?? "next") as Status;
    if (currentStatus === status) {
      return mapDbTaskToTask(existingRow);
    }

    const shouldAssignSortIndex = status !== "finished";
    const minSortIndex = shouldAssignSortIndex
      ? getMinSortIndexForStatus(statements, status)
      : null;
    const nextSortIndex = shouldAssignSortIndex
      ? (minSortIndex ?? SORT_INDEX_STEP) - SORT_INDEX_STEP
      : null;

    const result = statements.updateTaskStatus.run(status, nextSortIndex, id);

    if (!result.changes) {
      return undefined;
    }

    const updatedRow = statements.selectTaskById.get(id) as
      | DbTaskRow
      | undefined;
    return updatedRow ? mapDbTaskToTask(updatedRow) : undefined;
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

  delete: (
    id: number,
    options?: {
      hard?: boolean;
    }
  ): { changes: number } => {
    if (options?.hard) {
      const hardDeleteResult = statements.hardDeleteTask.run(id);
      return { changes: hardDeleteResult.changes };
    }

    const softDeleteResult = statements.softDeleteTask.run(id);
    if (softDeleteResult.changes) {
      return { changes: softDeleteResult.changes };
    }

    const hardDeleteResult = statements.hardDeleteTask.run(id);
    return { changes: hardDeleteResult.changes };
  },
};

export type { DbTaskRow };
