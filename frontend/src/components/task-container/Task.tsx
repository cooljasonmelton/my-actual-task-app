import { useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import "./Task.css";
import type { TaskProps } from "./types";

const Task = ({
  task,
  onDelete,
  onTogglePriority,
  isSoftDeleted,
  isSoftDeletedToday,
  isPriorityUpdating,
}: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const taskCardClassName = `card task${isSoftDeleted ? " task--soft-deleted" : ""}`;

  return (
    <div className={taskCardClassName}>
      <TaskHeader
        taskId={task.id}
        title={task.title}
        priority={task.priority}
        isExpanded={isExpanded}
        toggleExpanded={() => setIsExpanded(!isExpanded)}
        onDelete={onDelete}
        onTogglePriority={onTogglePriority}
        isSoftDeleted={isSoftDeleted}
        isSoftDeletedToday={isSoftDeletedToday}
        isPriorityUpdating={isPriorityUpdating}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
