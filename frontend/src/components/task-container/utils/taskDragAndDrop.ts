import { useCallback, useEffect, useState } from "react";
import { sortTasks } from "./taskSorting";
import type { TaskSortOption } from "./taskSorting";
import type { Status, TaskType } from "../../../types";
import {
  computeReorderedTasks,
  TASK_REORDER_STEP,
  type DraggingTask,
} from "./taskDragReorder";
import {
  useTaskDragHandlers,
  type TaskDragHandlers,
} from "./taskDragHandlers";

export interface UseTaskDragAndDropOptions {
  sortOption: TaskSortOption;
  selectedStatus: Status;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  persistReorder: (status: Status, orderedTaskIds: number[]) => Promise<void>;
  persistStatusChange: (taskId: number, status: Status) => Promise<void>;
  taskReorderStep?: number;
}

export interface UseTaskDragAndDropResult extends TaskDragHandlers {
  draggingTask: DraggingTask;
  dragOverTaskId: number | null;
  dragOverStatus: Status | null;
  handleDragEnd: () => void;
}

export const useTaskDragAndDrop = ({
  sortOption,
  selectedStatus,
  setTasks,
  persistReorder,
  persistStatusChange,
  taskReorderStep = TASK_REORDER_STEP,
}: UseTaskDragAndDropOptions): UseTaskDragAndDropResult => {
  const [draggingTask, setDraggingTask] = useState<DraggingTask>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);

  const applyReorder = useCallback<
    (
      status: Status,
      sourceId: number,
      targetId: number | null
    ) => number[] | null
  >(
    (status, sourceId, targetId) => {
      let updatedOrder: number[] | null = null;
      let didChange = false;

      setTasks((previousTasks) => {
        const result = computeReorderedTasks(
          previousTasks,
          status,
          sourceId,
          targetId,
          taskReorderStep
        );
        const { updatedTasks, orderedIds, changed } = result;

        if (!changed) {
          return previousTasks;
        }

        updatedOrder = orderedIds;
        didChange = true;
        return sortTasks(updatedTasks, sortOption);
      });

      if (didChange && updatedOrder) {
        return updatedOrder;
      }

      return null;
    },
    [setTasks, sortOption, taskReorderStep]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingTask(null);
    setDragOverTaskId(null);
    setDragOverStatus(null);
  }, []);

  const handlers = useTaskDragHandlers({
    draggingTask,
    dragOverTaskId,
    dragOverStatus,
    setDraggingTask,
    setDragOverTaskId,
    setDragOverStatus,
    applyReorder,
    handleDragEnd,
    persistReorder,
    persistStatusChange,
    selectedStatus,
  });

  useEffect(() => {
    setDragOverTaskId(null);
    setDraggingTask(null);
    setDragOverStatus(null);
  }, [selectedStatus]);

  return {
    draggingTask,
    dragOverTaskId,
    dragOverStatus,
    handleDragEnd,
    ...handlers,
  };
};

export { computeReorderedTasks, TASK_REORDER_STEP };
