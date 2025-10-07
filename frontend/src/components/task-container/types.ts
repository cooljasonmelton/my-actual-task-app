import type { DragEvent } from "react";
import type { TaskType } from "../../types";

export type ApiTask = Omit<TaskType, "createdAt" | "deletedAt"> & {
  createdAt: string | Date;
  deletedAt: string | Date | null;
};

export type DerivedTask = {
  task: TaskType;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
};

export interface TaskProps {
  task: TaskType;
  onDelete: (id: TaskType["id"]) => Promise<void>;
  onTogglePriority: (
    id: TaskType["id"],
    currentPriority: TaskType["priority"]
  ) => Promise<void>;
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

export type TaskHeaderType = React.FC<{
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
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
  isPriorityUpdating: boolean;
}>;
