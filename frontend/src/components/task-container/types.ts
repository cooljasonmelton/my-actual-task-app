import type { TaskType } from "../../types";

export interface TaskProps {
  task: TaskType;
  onDelete: (id: TaskType["id"]) => Promise<void>;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
}

export type TaskHeaderType = React.FC<{
  taskId: TaskType["id"];
  title: string;
  isExpanded: boolean;
  toggleExpanded: () => void;
  onDelete: (id: TaskType["id"]) => Promise<void>;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
}>;
