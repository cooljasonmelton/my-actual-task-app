import { useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import "./Task.css";
import type { TaskProps } from "../types";

const Task = ({
  task,
  onDelete,
  onTogglePriority,
  onUpdateTitle,
  isSoftDeleted,
  isSoftDeletedToday,
  isPriorityUpdating,
  draggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const taskCardClassName = `card task${
    isSoftDeleted ? " task--soft-deleted" : ""
  }${draggable ? " task--draggable" : ""}${
    isDragging ? " task--dragging" : ""
  }${isDragOver ? " task--drag-over" : ""}`;

  return (
    <div
      className={taskCardClassName}
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, task)}
      onDragEnter={(event) => onDragEnter?.(event, task)}
      onDragOver={(event) => onDragOver?.(event, task)}
      onDragLeave={(event) => onDragLeave?.(event, task)}
      onDragEnd={(event) => onDragEnd?.(event, task)}
      onDrop={(event) => onDrop?.(event, task)}
    >
      <TaskHeader
        taskId={task.id}
        title={task.title}
        priority={task.priority}
        isExpanded={isExpanded}
        toggleExpanded={() => setIsExpanded(!isExpanded)}
        onDelete={onDelete}
        onTogglePriority={onTogglePriority}
        onUpdateTitle={onUpdateTitle}
        isSoftDeleted={isSoftDeleted}
        isSoftDeletedToday={isSoftDeletedToday}
        isPriorityUpdating={isPriorityUpdating}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
