import type { TaskType } from "../types";

export type TaskSortOption = "priority" | "createdAt";

const sortByPriority = (a: TaskType, b: TaskType) => {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }

  const aSortIndex =
    typeof a.sortIndex === "number" ? a.sortIndex : Number.MAX_SAFE_INTEGER;
  const bSortIndex =
    typeof b.sortIndex === "number" ? b.sortIndex : Number.MAX_SAFE_INTEGER;

  if (aSortIndex !== bSortIndex) {
    return aSortIndex - bSortIndex;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
};

const sortByCreatedAt = (a: TaskType, b: TaskType) =>
  b.createdAt.getTime() - a.createdAt.getTime();

const sorters: Record<TaskSortOption, (a: TaskType, b: TaskType) => number> = {
  priority: sortByPriority,
  createdAt: sortByCreatedAt,
};

export const DEFAULT_TASK_SORT_OPTION: TaskSortOption = "priority";

export const sortTasks = (
  tasks: TaskType[],
  sortOption: TaskSortOption
): TaskType[] => {
  const sorter = sorters[sortOption] ?? sorters.priority;
  return tasks.sort(sorter);
};

export const getNextPriority = (
  currentPriority: TaskType["priority"]
): TaskType["priority"] => {
  return currentPriority === 1 ? 5 : 1;
};
