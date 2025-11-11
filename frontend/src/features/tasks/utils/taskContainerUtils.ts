import type { Status, Subtask, TaskType } from "@/types";
import type { ApiSubtask, ApiTask, DerivedTask } from "@/features/tasks/types";
import { parseReferenceWindowDate } from "@/features/tasks/hooks/useReferenceWindow";

const parseSubtaskFromApi = (subtask: ApiSubtask): Subtask => ({
  ...subtask,
  deletedAt: subtask.deletedAt
    ? parseReferenceWindowDate(subtask.deletedAt)
    : null,
});

export const parseTaskFromApi = (task: ApiTask): TaskType => ({
  ...task,
  createdAt: parseReferenceWindowDate(task.createdAt),
  deletedAt: task.deletedAt ? parseReferenceWindowDate(task.deletedAt) : null,
  subtasks: Array.isArray(task.subtasks)
    ? task.subtasks.map(parseSubtaskFromApi)
    : [],
});

export const createEmptyBuckets = (
  statusValues: Status[]
): Record<Status, DerivedTask[]> => {
  return statusValues.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<Status, DerivedTask[]>);
};
