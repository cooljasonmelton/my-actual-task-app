import type { Dispatch, DragEvent, SetStateAction } from "react";
import type { Subtask, TaskType } from "@/types";
import type { DraggingSubtask } from "./utils/subtaskDragReorder";

export type SubtaskDragItem = {
  subtask: Subtask;
  taskId: number;
  isTaskSoftDeleted: boolean;
};

export interface UseSubtaskDragAndDropOptions {
  setTasks: Dispatch<SetStateAction<TaskType[]>>;
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
