import { useCallback } from "react";
import type { DragEvent } from "react";
import type { TaskType } from "../../../types";
import type { TaskDragHandlerParams } from "./taskDragHandlerTypes";

export interface TaskItemDragHandlers {
  handleDragStart: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragEnter: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragLeave: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDropOnTask: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleContainerDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDropOnContainer: (event: DragEvent<HTMLDivElement>) => void;
}

export const useTaskItemDragHandlers = ({
  draggingTask,
  dragOverTaskId,
  setDraggingTask,
  setDragOverTaskId,
  applyReorder,
  handleDragEnd,
  persistReorder,
  selectedStatus,
}: TaskDragHandlerParams): TaskItemDragHandlers => {
  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (task.status === "finished" || task.deletedAt) {
        return;
      }

      setDraggingTask({ id: task.id, status: task.status });
      setDragOverTaskId(null);

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
      }
    },
    [setDragOverTaskId, setDraggingTask]
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      event.preventDefault();

      if (!draggingTask || draggingTask.id === task.id) {
        return;
      }

      if (draggingTask.status !== task.status) {
        setDragOverTaskId(null);
        return;
      }

      setDragOverTaskId(task.id);
    },
    [draggingTask, setDragOverTaskId]
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (!draggingTask) {
        return;
      }

      if (draggingTask.status !== task.status) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }

      if (dragOverTaskId !== task.id) {
        setDragOverTaskId(task.id);
      }
    },
    [dragOverTaskId, draggingTask, setDragOverTaskId]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (!draggingTask) {
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      if (dragOverTaskId === task.id) {
        setDragOverTaskId(null);
      }
    },
    [dragOverTaskId, draggingTask, setDragOverTaskId]
  );

  const handleDropOnTask = useCallback(
    (event: DragEvent<HTMLDivElement>, targetTask: TaskType) => {
      event.preventDefault();
      event.stopPropagation();

      if (!draggingTask || draggingTask.id === targetTask.id) {
        handleDragEnd();
        return;
      }

      if (draggingTask.status !== targetTask.status) {
        handleDragEnd();
        return;
      }

      const reorderedIds = applyReorder(
        targetTask.status,
        draggingTask.id,
        targetTask.id
      );

      handleDragEnd();

      if (reorderedIds && reorderedIds.length > 0) {
        void persistReorder(targetTask.status, reorderedIds);
      }
    },
    [applyReorder, draggingTask, handleDragEnd, persistReorder]
  );

  const handleContainerDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!draggingTask || draggingTask.status !== selectedStatus) {
        return;
      }

      event.preventDefault();
    },
    [draggingTask, selectedStatus]
  );

  const handleDropOnContainer = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!draggingTask || draggingTask.status !== selectedStatus) {
        handleDragEnd();
        return;
      }

      const reorderedIds = applyReorder(selectedStatus, draggingTask.id, null);

      handleDragEnd();

      if (reorderedIds && reorderedIds.length > 0) {
        void persistReorder(selectedStatus, reorderedIds);
      }
    },
    [applyReorder, draggingTask, handleDragEnd, persistReorder, selectedStatus]
  );

  return {
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDropOnTask,
    handleContainerDragOver,
    handleDropOnContainer,
  };
};
