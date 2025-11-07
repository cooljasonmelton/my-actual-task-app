import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { sortTasks } from "./taskSorting";
import type { TaskSortOption } from "./taskSorting";
import type { Status, TaskType } from "@/types";
import {
  computeReorderedTasks,
  TASK_REORDER_STEP,
  type DraggingTask,
} from "./taskDragReorder";
import { useReorderableDragAndDrop } from "../../drag-drop/useReorderableDragAndDrop";
import { useTaskStatusDragHandlers } from "./taskStatusDragHandlers";
import { useTasksActions, useTasksState } from "../state/TasksContext";

export interface UseTaskDragAndDropOptions {
  sortOption: TaskSortOption;
  selectedStatus: Status;
  persistReorder: (status: Status, orderedTaskIds: number[]) => Promise<void>;
  persistStatusChange: (taskId: number, status: Status) => Promise<void>;
  taskReorderStep?: number;
}

export interface UseTaskDragAndDropResult {
  draggingTask: DraggingTask;
  dragOverTaskId: number | null;
  dragOverStatus: Status | null;
  handleDragStart: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragEnter: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragLeave: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDropOnTask: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleContainerDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDropOnContainer: (event: DragEvent<HTMLDivElement>) => void;
  handleStatusDragOver: (event: DragEvent<HTMLElement>, status: Status) => void;
  handleStatusDragLeave: (
    event: DragEvent<HTMLElement>,
    status: Status
  ) => void;
  handleStatusDrop: (event: DragEvent<HTMLElement>, status: Status) => void;
  handleDragEnd: () => void;
}

export const useTaskDragAndDrop = ({
  sortOption,
  selectedStatus,
  persistReorder,
  persistStatusChange,
  taskReorderStep = TASK_REORDER_STEP,
}: UseTaskDragAndDropOptions): UseTaskDragAndDropResult => {
  const { tasks } = useTasksState();
  const { setTasks } = useTasksActions();
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);
  const tasksRef = useRef<TaskType[]>(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const applyReorder = useCallback<
    (
      status: Status,
      sourceId: number,
      targetId: number | null
    ) => number[] | null
  >(
    (status, sourceId, targetId) => {
      const currentTasks = tasksRef.current;
      const {
        updatedTasks,
        orderedIds,
        changed,
      } = computeReorderedTasks(
        currentTasks,
        status,
        sourceId,
        targetId,
        taskReorderStep
      );

      if (!changed) {
        return null;
      }

      const sortedTasks = sortTasks([...updatedTasks], sortOption);

      setTasks((previousTasks) => {
        if (previousTasks === currentTasks) {
          return sortedTasks;
        }

        const nextResult = computeReorderedTasks(
          previousTasks,
          status,
          sourceId,
          targetId,
          taskReorderStep
        );

        if (!nextResult.changed) {
          return previousTasks;
        }

        return sortTasks(nextResult.updatedTasks, sortOption);
      });

      return orderedIds;
    },
    [setTasks, sortOption, taskReorderStep]
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
  } = useReorderableDragAndDrop<TaskType, Status>({
    getItemId: (task) => task.id,
    getItemGroupId: (task) => task.status,
    isItemDraggable: (task) => task.status !== "finished" && !task.deletedAt,
    applyReorder,
    persistReorder,
  });

  const draggingTask = useMemo<DraggingTask>(() => {
    if (!draggingItem) {
      return null;
    }
    return { id: draggingItem.id, status: draggingItem.groupId };
  }, [draggingItem]);

  useEffect(() => {
    setDragOverTaskId(dragOverItemId);
  }, [dragOverItemId]);

  const handleDragEnd = useCallback(() => {
    resetReorderDrag();
    setDragOverTaskId(null);
    setDragOverStatus(null);
  }, [resetReorderDrag]);

  const handleContainerDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      handleRawContainerDragOver(event, selectedStatus);
    },
    [handleRawContainerDragOver, selectedStatus]
  );

  const handleDropOnContainer = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      handleRawContainerDrop(event, selectedStatus);
    },
    [handleRawContainerDrop, selectedStatus]
  );

  const statusHandlers = useTaskStatusDragHandlers({
    draggingTask,
    dragOverStatus,
    setDragOverStatus,
    handleDragEnd,
    persistStatusChange,
  });

  useEffect(() => {
    handleDragEnd();
  }, [handleDragEnd, selectedStatus]);

  return {
    draggingTask,
    dragOverTaskId,
    dragOverStatus,
    handleDragStart: handleRawDragStart,
    handleDragEnter: handleRawDragEnter,
    handleDragOver: handleRawDragOver,
    handleDragLeave: handleRawDragLeave,
    handleDropOnTask: handleRawDropOnItem,
    handleContainerDragOver,
    handleDropOnContainer,
    handleStatusDragOver: statusHandlers.handleStatusDragOver,
    handleStatusDragLeave: statusHandlers.handleStatusDragLeave,
    handleStatusDrop: statusHandlers.handleStatusDrop,
    handleDragEnd,
  };
};

export { computeReorderedTasks, TASK_REORDER_STEP };
