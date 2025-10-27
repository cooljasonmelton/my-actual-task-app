import type { Status, TaskType } from "../../../types";

export const TASK_REORDER_STEP = 10;

export type ReorderComputation = {
  updatedTasks: TaskType[];
  orderedIds: number[];
  changed: boolean;
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

  const statusTasks = tasks.filter(
    (task) => task.status === status && !task.deletedAt
  );

  if (statusTasks.length <= 1) {
    return {
      updatedTasks: tasks,
      orderedIds: statusTasks.map((task) => task.id),
      changed: false,
    };
  }

  const originalIds = statusTasks.map((task) => task.id);
  const sourceIndex = originalIds.indexOf(sourceId);

  if (sourceIndex === -1) {
    return { updatedTasks: tasks, orderedIds: originalIds, changed: false };
  }

  const reorderedIds = originalIds.slice();
  reorderedIds.splice(sourceIndex, 1);

  const targetIndex =
    targetId === null ? reorderedIds.length : reorderedIds.indexOf(targetId);
  const insertionIndex = targetIndex < 0 ? reorderedIds.length : targetIndex;
  reorderedIds.splice(insertionIndex, 0, sourceId);

  const changed =
    reorderedIds.length === originalIds.length &&
    reorderedIds.some((id, index) => id !== originalIds[index]);

  if (!changed) {
    return { updatedTasks: tasks, orderedIds: originalIds, changed: false };
  }

  const sortIndexMap = new Map<number, number>();
  reorderedIds.forEach((id, index) => {
    sortIndexMap.set(id, (index + 1) * taskReorderStep);
  });

  const updatedTasks = tasks.map((task) => {
    if (task.status === status && sortIndexMap.has(task.id)) {
      return {
        ...task,
        sortIndex: sortIndexMap.get(task.id)!,
      };
    }
    return task;
  });

  return { updatedTasks, orderedIds: reorderedIds, changed: true };
};
