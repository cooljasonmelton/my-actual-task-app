import type { Subtask } from "@/types";
import {
  createSortIndexMap,
  computeReorderedIds,
  type ReorderComputationResult,
} from "../../drag-drop/reorderUtils";
import { DEFAULT_REORDER_STEP } from "../../drag-drop/constants";

export const SUBTASK_REORDER_STEP = DEFAULT_REORDER_STEP;

export type DraggingSubtask = { id: number; taskId: number } | null;

export type SubtaskReorderComputation = ReorderComputationResult & {
  updatedSubtasks: Subtask[];
};

export const computeReorderedSubtasks = (
  subtasks: Subtask[],
  taskId: number,
  sourceId: number,
  targetId: number | null,
  subtaskReorderStep: number = SUBTASK_REORDER_STEP
): SubtaskReorderComputation => {
  const { orderedIds, changed } = computeReorderedIds({
    items: subtasks,
    groupId: taskId,
    sourceId,
    targetId,
    getItemId: (subtask) => subtask.id,
    getItemGroupId: () => taskId,
    isItemEligible: (subtask) => !subtask.deletedAt,
  });

  if (!changed) {
    return { updatedSubtasks: subtasks, orderedIds, changed: false };
  }

  const sortIndexMap = createSortIndexMap(orderedIds, subtaskReorderStep);

  const subtaskMap = new Map<number, Subtask>();
  subtasks.forEach((subtask) => {
    if (sortIndexMap.has(subtask.id)) {
      subtaskMap.set(subtask.id, {
        ...subtask,
        sortIndex: sortIndexMap.get(subtask.id)!,
      });
    } else {
      subtaskMap.set(subtask.id, subtask);
    }
  });

  const reorderedActiveSubtasks = orderedIds.map((id) => subtaskMap.get(id)!);
  const untouchedSubtasks = subtasks.filter(
    (subtask) => !sortIndexMap.has(subtask.id)
  );

  return {
    updatedSubtasks: [...reorderedActiveSubtasks, ...untouchedSubtasks],
    orderedIds,
    changed: true,
  };
};
