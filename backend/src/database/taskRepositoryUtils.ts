import type { Status, Priority, Task } from "../../../shared/types/task";
import { DbTaskRow, TaskStatementsType } from "./taskRepository";

const SERIALIZED_DATE_TIME_REGEX = /[Tt]|Z$|[+-]\d{2}:?\d{2}$/;

export const getMinSortIndexForStatus = (
  statements: TaskStatementsType,
  status: Status
): number | null => {
  const result = statements.selectMinSortIndexForStatus.get(status) as
    | { min_sort_index: number | null }
    | undefined;
  return result?.min_sort_index ?? null;
};

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

export const mapDbTaskToTask = (row: DbTaskRow): Task => {
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
