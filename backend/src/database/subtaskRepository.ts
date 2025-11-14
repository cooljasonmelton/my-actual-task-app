import type Database from "better-sqlite3";
import db, { SORT_INDEX_STEP } from "./db";
import type { Subtask } from "../../../shared/types/task";
import { parseSqliteDate } from "./taskRepositoryUtils";

type DbSubtaskRow = {
  id: number;
  task_id: number;
  title: string;
  sort_index: number | null;
  created_at: string | Date;
  deleted_at: string | Date | null;
};

type SubtaskStatements = {
  [key: string]: Database.Statement<unknown[], unknown>;
};

const statements: SubtaskStatements = {
  selectSubtaskById: db.prepare("SELECT * FROM subtasks WHERE id = ?"),
  selectActiveByTaskId: db.prepare(
    `
      SELECT *
      FROM subtasks
      WHERE task_id = ?
        AND deleted_at IS NULL
      ORDER BY
        COALESCE(sort_index, 2147483647) ASC,
        created_at ASC,
        id ASC
    `
  ),
  selectActiveByTaskIdOrderByCreation: db.prepare(
    `
      SELECT *
      FROM subtasks
      WHERE task_id = ?
        AND deleted_at IS NULL
      ORDER BY
        created_at ASC,
        id ASC
    `
  ),
  selectAllByTaskId: db.prepare(
    `
      SELECT *
      FROM subtasks
      WHERE task_id = ?
      ORDER BY
        CASE WHEN deleted_at IS NULL THEN 0 ELSE 1 END,
        COALESCE(sort_index, 2147483647) ASC,
        created_at ASC,
        id ASC
    `
  ),
  selectMinSortIndexForTask: db.prepare(
    `
      SELECT MIN(sort_index) as min_sort_index
      FROM subtasks
      WHERE task_id = ?
        AND deleted_at IS NULL
        AND sort_index IS NOT NULL
    `
  ),
  insertSubtask: db.prepare(
    `
      INSERT INTO subtasks (task_id, title, sort_index)
      VALUES (?, ?, ?)
    `
  ),
  updateSubtaskTitle: db.prepare(
    `
      UPDATE subtasks
      SET title = ?
      WHERE id = ?
        AND deleted_at IS NULL
    `
  ),
  softDeleteSubtask: db.prepare(
    `
      UPDATE subtasks
      SET deleted_at = CURRENT_TIMESTAMP,
          sort_index = NULL
      WHERE id = ?
        AND deleted_at IS NULL
    `
  ),
  restoreSubtask: db.prepare(
    `
      UPDATE subtasks
      SET deleted_at = NULL,
          sort_index = ?
      WHERE id = ?
        AND deleted_at IS NOT NULL
    `
  ),
  updateSubtaskSortIndexWithinTask: db.prepare(
    `
      UPDATE subtasks
      SET sort_index = ?
      WHERE id = ?
        AND task_id = ?
        AND deleted_at IS NULL
    `
  ),
};

const mapDbRowToSubtask = (row: DbSubtaskRow): Subtask => ({
  id: row.id,
  title: row.title,
  deletedAt: parseSqliteDate(row.deleted_at),
  sortIndex: row.sort_index ?? null,
});

const getNextSortIndexForTask = (taskId: number): number => {
  const result = statements.selectMinSortIndexForTask.get(taskId) as
    | { min_sort_index: number | null }
    | undefined;
  const minSortIndex = result?.min_sort_index ?? null;
  return (minSortIndex ?? SORT_INDEX_STEP) - SORT_INDEX_STEP;
};

const getSubtaskRowById = (id: number): DbSubtaskRow | undefined => {
  return statements.selectSubtaskById.get(id) as DbSubtaskRow | undefined;
};

const reseedSubtaskSortIndexes = db.transaction((taskId: number) => {
  const activeRows = statements.selectActiveByTaskIdOrderByCreation.all(
    taskId
  ) as DbSubtaskRow[];

  if (activeRows.length === 0) {
    return;
  }

  activeRows.forEach((row, index) => {
    const sortIndex = (index + 1) * SORT_INDEX_STEP;
    statements.updateSubtaskSortIndexWithinTask.run(sortIndex, row.id, taskId);
  });
});

export const subtaskQueries = {
  getByTaskId: (
    taskId: number,
    options?: { includeDeleted?: boolean }
  ): Subtask[] => {
    const includeDeleted = options?.includeDeleted ?? true;
    const statement = includeDeleted
      ? statements.selectAllByTaskId
      : statements.selectActiveByTaskId;
    let rows = statement.all(taskId) as DbSubtaskRow[];

    const hasActiveMissingSortIndex = rows.some(
      (row) => row.deleted_at === null && row.sort_index === null
    );

    if (hasActiveMissingSortIndex) {
      reseedSubtaskSortIndexes(taskId);
      rows = statement.all(taskId) as DbSubtaskRow[];
    }

    return rows.map(mapDbRowToSubtask);
  },

  getById: (id: number): (Subtask & { taskId: number }) | undefined => {
    const row = getSubtaskRowById(id);
    if (!row) {
      return undefined;
    }

    return {
      ...mapDbRowToSubtask(row),
      taskId: row.task_id,
    };
  },

  create: (taskId: number, title: string): Subtask => {
    const nextSortIndex = getNextSortIndexForTask(taskId);
    const result = statements.insertSubtask.run(taskId, title, nextSortIndex);
    const createdRow = getSubtaskRowById(result.lastInsertRowid as number);
    if (!createdRow) {
      throw new Error("Failed to retrieve created subtask");
    }
    return mapDbRowToSubtask(createdRow);
  },

  updateTitle: (id: number, title: string): Subtask | undefined => {
    const result = statements.updateSubtaskTitle.run(title, id);
    if (!result.changes) {
      return undefined;
    }
    const row = getSubtaskRowById(id);
    return row ? mapDbRowToSubtask(row) : undefined;
  },

  softDelete: (id: number): Subtask | undefined => {
    const result = statements.softDeleteSubtask.run(id);
    if (!result.changes) {
      return undefined;
    }
    const row = getSubtaskRowById(id);
    return row ? mapDbRowToSubtask(row) : undefined;
  },

  restore: (id: number): Subtask | undefined => {
    const existingRow = getSubtaskRowById(id);
    if (!existingRow || existingRow.deleted_at === null) {
      return undefined;
    }

    const nextSortIndex = getNextSortIndexForTask(existingRow.task_id);
    const result = statements.restoreSubtask.run(nextSortIndex, id);
    if (!result.changes) {
      return undefined;
    }
    const row = getSubtaskRowById(id);
    return row ? mapDbRowToSubtask(row) : undefined;
  },

  updateSortOrder: (
    taskId: number,
    orderedSubtaskIds: number[]
  ): { updated: number } => {
    const applySortOrder = db.transaction((ids: number[]): number => {
      let updated = 0;
      ids.forEach((subtaskId, index) => {
        const sortIndex = (index + 1) * SORT_INDEX_STEP;
        const result = statements.updateSubtaskSortIndexWithinTask.run(
          sortIndex,
          subtaskId,
          taskId
        );
        updated += result.changes ?? 0;
      });
      return updated;
    });

    const updated = applySortOrder(orderedSubtaskIds);
    return { updated };
  },
};

export type { DbSubtaskRow };
