import type { DragEvent } from "react";
import type { Subtask, TaskType } from "../../types";

export type ApiSubtask = Omit<Subtask, "deletedAt"> & {
  deletedAt: string | Date | null;
};

export type ApiTask = Omit<
  TaskType,
  "createdAt" | "deletedAt" | "subtasks"
> & {
  createdAt: string | Date;
  deletedAt: string | Date | null;
  subtasks: ApiSubtask[];
};

export type DerivedTask = {
  task: TaskType;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
};

export interface TaskProps {
  task: TaskType;
  onDelete: (id: TaskType["id"]) => Promise<void>;
  onRestore: (id: TaskType["id"]) => Promise<void>;
  onTogglePriority: (
    id: TaskType["id"],
    currentPriority: TaskType["priority"]
  ) => Promise<void>;
  onUpdateTitle: (id: TaskType["id"], updatedTitle: string) => Promise<void>;
  onCreateSubtask: (
    taskId: TaskType["id"],
    title: string
  ) => Promise<void>;
  onUpdateSubtaskTitle: (
    taskId: TaskType["id"],
    subtaskId: Subtask["id"],
    updatedTitle: string
  ) => Promise<void>;
  onDeleteSubtask: (
    taskId: TaskType["id"],
    subtaskId: Subtask["id"]
  ) => Promise<void>;
  onRestoreSubtask: (
    taskId: TaskType["id"],
    subtaskId: Subtask["id"]
  ) => Promise<void>;
  isExpanded: boolean;
  onToggleExpanded: (taskId: TaskType["id"]) => void;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
  isPriorityUpdating: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  onDragEnter?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  onDragOver?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  onDragLeave?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  onDragEnd?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  onDrop?: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
}

export type TaskHeaderProps = {
  taskId: TaskType["id"];
  title: string;
  priority: TaskType["priority"];
  isExpanded: boolean;
  toggleExpanded: () => void;
  onDelete: (id: TaskType["id"]) => Promise<void>;
  onTogglePriority: (
    id: TaskType["id"],
    currentPriority: TaskType["priority"]
  ) => Promise<void>;
  onUpdateTitle: (id: TaskType["id"], updatedTitle: string) => Promise<void>;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
  isPriorityUpdating: boolean;
  onTitleEditingChange: (isEditing: boolean) => void;
  onRestoreRequest: () => void;
  hasSubtasks: boolean;
};
