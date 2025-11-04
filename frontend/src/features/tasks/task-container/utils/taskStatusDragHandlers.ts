import { useCallback } from "react";
import type { DragEvent } from "react";
import type { Status } from "@/types";
import type { DraggingTask } from "./taskDragReorder";

export interface TaskStatusDragHandlers {
  handleStatusDragOver: (event: DragEvent<HTMLElement>, status: Status) => void;
  handleStatusDragLeave: (
    event: DragEvent<HTMLElement>,
    status: Status
  ) => void;
  handleStatusDrop: (event: DragEvent<HTMLElement>, status: Status) => void;
}

export const useTaskStatusDragHandlers = ({
  draggingTask,
  dragOverStatus,
  setDragOverStatus,
  handleDragEnd,
  persistStatusChange,
}: {
  draggingTask: DraggingTask;
  dragOverStatus: Status | null;
  setDragOverStatus: (status: Status | null) => void;
  handleDragEnd: () => void;
  persistStatusChange: (taskId: number, status: Status) => Promise<void>;
}): TaskStatusDragHandlers => {
  const handleStatusDragOver = useCallback(
    (event: DragEvent<HTMLElement>, status: Status) => {
      if (!draggingTask) {
        return;
      }

      if (draggingTask.status === status) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        if (dragOverStatus !== null) {
          setDragOverStatus(null);
        }
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }

      if (dragOverStatus !== status) {
        setDragOverStatus(status);
      }
    },
    [dragOverStatus, draggingTask, setDragOverStatus]
  );

  const handleStatusDragLeave = useCallback(
    (event: DragEvent<HTMLElement>, status: Status) => {
      if (!draggingTask) {
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      if (dragOverStatus === status) {
        setDragOverStatus(null);
      }
    },
    [dragOverStatus, draggingTask, setDragOverStatus]
  );

  const handleStatusDrop = useCallback(
    (event: DragEvent<HTMLElement>, status: Status) => {
      event.preventDefault();
      event.stopPropagation();

      if (!draggingTask) {
        setDragOverStatus(null);
        return;
      }

      const taskId = draggingTask.id;

      setDragOverStatus(null);
      handleDragEnd();

      if (draggingTask.status === status) {
        return;
      }

      void persistStatusChange(taskId, status).catch((error) => {
        console.error("Failed to update task status", error);
      });
    },
    [draggingTask, handleDragEnd, persistStatusChange, setDragOverStatus]
  );

  return {
    handleStatusDragOver,
    handleStatusDragLeave,
    handleStatusDrop,
  };
};
