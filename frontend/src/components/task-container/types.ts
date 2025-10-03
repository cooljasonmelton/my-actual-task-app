import type { TaskType } from "../../types";

export interface TaskProps {
  task: TaskType;
  onDelete: (id: TaskType["id"]) => Promise<void>;
}

export type TaskHeaderType = React.FC<
  {
    taskId: TaskType["id"];
    title: string;
    isExpanded: boolean;
    setIsExpanded: () => void;
    onDelete: (id: TaskType["id"]) => Promise<void>;
  }
>;
