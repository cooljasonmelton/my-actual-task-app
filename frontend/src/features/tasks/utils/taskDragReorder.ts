import type { Status, TaskType } from "@/types";
import { createSortIndexMap, computeReorderedIds } from "@/features/tasks/utils/drag-drop/reorderUtils";
import type { ReorderComputationResult } from "@/features/tasks/utils/drag-drop/reorderUtils";
import { DEFAULT_REORDER_STEP } from "@/features/tasks/utils/drag-drop/constants";

export const TASK_REORDER_STEP = DEFAULT_REORDER_STEP;

export type ReorderComputation = ReorderComputationResult & {
  updatedTasks: TaskType[];
};

export type DraggingTask = { id: number; status: Status } | null;

export const computeReorderedTasks = (
  tasks: TaskType[],
  status: Status,
  sourceId: number,
  targetId: number | null,
  taskReorderStep: number = TASK_REORDER_STEP
): ReorderComputation => {
  if (status === "finished") {
    return { updatedTasks: tasks, orderedIds: [], changed: false };
  }

  const { orderedIds, changed } = computeReorderedIds({
    items: tasks,
    groupId: status,
    sourceId,
    targetId,
    getItemId: (task) => task.id,
    getItemGroupId: (task) => task.status,
    isItemEligible: (task) => task.status === status && !task.deletedAt,
  });

  if (!changed) {
    return { updatedTasks: tasks, orderedIds, changed: false };
  }

  const sortIndexMap = createSortIndexMap(orderedIds, taskReorderStep);

  const updatedTasks = tasks.map((task) => {
    if (task.status === status && sortIndexMap.has(task.id)) {
      return {
        ...task,
        sortIndex: sortIndexMap.get(task.id)!,
      };
    }
    return task;
  });

  return { updatedTasks, orderedIds, changed: true };
};
