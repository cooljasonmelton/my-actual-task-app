import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Subtask, TaskType } from "@/types";
import {
  computeReorderedSubtasks,
  SUBTASK_REORDER_STEP,
  type DraggingSubtask,
} from "@/features/tasks/utils/subtaskDragReorder";
import { useReorderableDragAndDrop } from "@/features/tasks/utils/drag-drop/useReorderableDragAndDrop";
import type {
  UseSubtaskDragAndDropOptions,
  UseSubtaskDragAndDropResult,
  SubtaskDragItem,
} from "./useSubtaskDragAndDrop.types";
import { useTasksActions, useTasksState } from "@/features/tasks/context/TasksContext";

export const useSubtaskDragAndDrop = ({
  persistReorder,
  reorderStep = SUBTASK_REORDER_STEP,
}: UseSubtaskDragAndDropOptions): UseSubtaskDragAndDropResult => {
  const { tasks } = useTasksState();
  const { setTasks } = useTasksActions();
  const [dragOverSubtaskId, setDragOverSubtaskId] = useState<number | null>(
    null
  );
  const tasksRef = useRef<TaskType[]>(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const applyReorder = useCallback(
    (taskId: number, sourceId: number, targetId: number | null) => {
      const currentTasks = tasksRef.current;
      const currentTask = currentTasks.find((task) => task.id === taskId);

      if (!currentTask) {
        return null;
      }

      const result = computeReorderedSubtasks(
        currentTask.subtasks,
        taskId,
        sourceId,
        targetId,
        reorderStep
      );
      const { updatedSubtasks, orderedIds, changed } = result;

      if (!changed) {
        return null;
      }

      setTasks((previousTasks) => {
        if (previousTasks === currentTasks) {
          return previousTasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              subtasks: updatedSubtasks,
            };
          });
        }

        let didUpdate = false;
        const nextTasks = previousTasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const nextResult = computeReorderedSubtasks(
            task.subtasks,
            taskId,
            sourceId,
            targetId,
            reorderStep
          );

          if (!nextResult.changed) {
            return task;
          }

          didUpdate = true;
          return {
            ...task,
            subtasks: nextResult.updatedSubtasks,
          };
        });

        return didUpdate ? nextTasks : previousTasks;
      });

      return orderedIds;
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
    (
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

export type {
  UseSubtaskDragAndDropOptions,
  UseSubtaskDragAndDropResult,
  SubtaskDragItem,
} from "./useSubtaskDragAndDrop.types";
