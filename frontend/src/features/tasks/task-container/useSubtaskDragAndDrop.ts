import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import type { Subtask, TaskType } from "@/types";
import {
  computeReorderedSubtasks,
  SUBTASK_REORDER_STEP,
  type DraggingSubtask,
} from "./utils/subtaskDragReorder";
import { useReorderableDragAndDrop } from "../drag-drop/useReorderableDragAndDrop";

type SubtaskDragItem = {
  subtask: Subtask;
  taskId: number;
  isTaskSoftDeleted: boolean;
};

export interface UseSubtaskDragAndDropOptions {
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  persistReorder: (
    taskId: number,
    orderedSubtaskIds: number[]
  ) => Promise<void>;
  reorderStep?: number;
}

export interface UseSubtaskDragAndDropResult {
  draggingSubtask: DraggingSubtask;
  dragOverSubtaskId: number | null;
  handleDragStart: (
    event: DragEvent<HTMLLIElement>,
    context: { taskId: number; subtask: Subtask; isTaskSoftDeleted: boolean }
  ) => void;
  handleDragEnter: (
    event: DragEvent<HTMLLIElement>,
    context: { taskId: number; subtask: Subtask }
  ) => void;
  handleDragOver: (
    event: DragEvent<HTMLLIElement>,
    context: { taskId: number; subtask: Subtask }
  ) => void;
  handleDragLeave: (
    event: DragEvent<HTMLLIElement>,
    context: { taskId: number; subtask: Subtask }
  ) => void;
  handleDropOnSubtask: (
    event: DragEvent<HTMLLIElement>,
    context: { taskId: number; subtask: Subtask }
  ) => void;
  handleListDragOver: (
    event: DragEvent<HTMLUListElement>,
    context: { taskId: number }
  ) => void;
  handleDropOnList: (
    event: DragEvent<HTMLUListElement>,
    context: { taskId: number }
  ) => void;
  handleDragEnd: () => void;
}

export const useSubtaskDragAndDrop = ({
  setTasks,
  persistReorder,
  reorderStep = SUBTASK_REORDER_STEP,
}: UseSubtaskDragAndDropOptions): UseSubtaskDragAndDropResult => {
  const [dragOverSubtaskId, setDragOverSubtaskId] = useState<number | null>(
    null
  );

  const applyReorder = useCallback(
    (taskId: number, sourceId: number, targetId: number | null) => {
      let updatedOrder: number[] | null = null;
      let didChange = false;

      setTasks((previousTasks) => {
        let hasChanged = false;
        const nextTasks = previousTasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const result = computeReorderedSubtasks(
            task.subtasks,
            taskId,
            sourceId,
            targetId,
            reorderStep
          );
          const { updatedSubtasks, orderedIds, changed } = result;

          if (!changed) {
            return task;
          }

          hasChanged = true;
          updatedOrder = orderedIds;
          return {
            ...task,
            subtasks: updatedSubtasks,
          };
        });

        if (hasChanged) {
          didChange = true;
          return nextTasks;
        }

        return previousTasks;
      });

      if (didChange && updatedOrder) {
        return updatedOrder;
      }

      return null;
    },
    [reorderStep, setTasks]
  );

  const {
    draggingItem,
    dragOverItemId,
    handleDragStart: handleRawDragStart,
    handleDragEnter: handleRawDragEnter,
    handleDragOver: handleRawDragOver,
    handleDragLeave: handleRawDragLeave,
    handleDropOnItem: handleRawDropOnItem,
    handleContainerDragOver: handleRawContainerDragOver,
    handleContainerDrop: handleRawContainerDrop,
    handleDragEnd: resetReorderDrag,
  } = useReorderableDragAndDrop<SubtaskDragItem, number>({
    getItemId: (item) => item.subtask.id,
    getItemGroupId: (item) => item.taskId,
    isItemDraggable: (item) =>
      !item.isTaskSoftDeleted && !item.subtask.deletedAt,
    applyReorder,
    persistReorder,
  });

  const draggingSubtask = useMemo<DraggingSubtask>(() => {
    if (!draggingItem) {
      return null;
    }
    return { id: draggingItem.id, taskId: draggingItem.groupId };
  }, [draggingItem]);

  useEffect(() => {
    setDragOverSubtaskId(dragOverItemId);
  }, [dragOverItemId]);

  const handleDragEnd = useCallback(() => {
    resetReorderDrag();
    setDragOverSubtaskId(null);
  }, [resetReorderDrag]);

  const wrapItem =
    <T,>(
      handler: (
        event: DragEvent<HTMLElement>,
        item: SubtaskDragItem
      ) => void
    ) =>
    (
      event: DragEvent<HTMLElement>,
      context: {
        taskId: number;
        subtask: Subtask;
        isTaskSoftDeleted?: boolean;
      }
    ) => {
      handler(event, {
        subtask: context.subtask,
        taskId: context.taskId,
        isTaskSoftDeleted: Boolean(context.isTaskSoftDeleted),
      });
    };

  const handleDragStart = wrapItem(handleRawDragStart);
  const handleDragEnter = wrapItem(handleRawDragEnter);
  const handleDragOver = wrapItem(handleRawDragOver);
  const handleDragLeave = wrapItem(handleRawDragLeave);
  const handleDropOnSubtask = wrapItem(handleRawDropOnItem);

  const handleListDragOver = useCallback(
    (event: DragEvent<HTMLUListElement>, { taskId }: { taskId: number }) => {
      handleRawContainerDragOver(event, taskId);
    },
    [handleRawContainerDragOver]
  );

  const handleDropOnList = useCallback(
    (event: DragEvent<HTMLUListElement>, { taskId }: { taskId: number }) => {
      handleRawContainerDrop(event, taskId);
    },
    [handleRawContainerDrop]
  );

  return {
    draggingSubtask,
    dragOverSubtaskId,
    handleDragStart: handleDragStart as UseSubtaskDragAndDropResult["handleDragStart"],
    handleDragEnter: handleDragEnter as UseSubtaskDragAndDropResult["handleDragEnter"],
    handleDragOver: handleDragOver as UseSubtaskDragAndDropResult["handleDragOver"],
    handleDragLeave: handleDragLeave as UseSubtaskDragAndDropResult["handleDragLeave"],
    handleDropOnSubtask:
      handleDropOnSubtask as UseSubtaskDragAndDropResult["handleDropOnSubtask"],
    handleListDragOver,
    handleDropOnList,
    handleDragEnd,
  };
};
