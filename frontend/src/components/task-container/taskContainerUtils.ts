import type { Status, TaskType } from "../../types";
import type { ApiTask, DerivedTask } from "./types";
import { parseReferenceWindowDate } from "../../hooks/useReferenceWindow";

export const parseTaskFromApi = (task: ApiTask): TaskType => ({
  ...task,
  createdAt: parseReferenceWindowDate(task.createdAt),
  deletedAt: task.deletedAt ? parseReferenceWindowDate(task.deletedAt) : null,
});

export const createEmptyBuckets = (
  statusValues: Status[]
): Record<Status, DerivedTask[]> => {
  return statusValues.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<Status, DerivedTask[]>);
};
