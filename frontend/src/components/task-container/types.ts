import type { TaskType } from "../../types";

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
