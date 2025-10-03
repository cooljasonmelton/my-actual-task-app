import { useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import "./Task.css";
import type { TaskProps } from "./types";

const Task = ({ task, onDelete, isSoftDeleted, isSoftDeletedToday }: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const taskCardClassName = `card task${isSoftDeleted ? " task--soft-deleted" : ""}`;

  return (
    <div className={taskCardClassName}>
      <TaskHeader
        taskId={task.id}
        title={task.title}
        isExpanded={isExpanded}
        toggleExpanded={() => setIsExpanded(!isExpanded)}
        onDelete={onDelete}
        isSoftDeleted={isSoftDeleted}
        isSoftDeletedToday={isSoftDeletedToday}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
