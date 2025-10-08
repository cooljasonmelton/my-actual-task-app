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
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const isDraggable = draggable && !isTitleEditing;
  const taskCardClassName = `card task${
    isSoftDeleted ? " task--soft-deleted" : ""
  }${isDraggable ? " task--draggable" : ""}${
    isDragging ? " task--dragging" : ""
  }${isDragOver ? " task--drag-over" : ""}`;

  return (
    <div
      className={taskCardClassName}
      draggable={isDraggable}
      onDragStart={
        isDraggable ? (event) => onDragStart?.(event, task) : undefined
      }
      onDragEnter={
        isDraggable ? (event) => onDragEnter?.(event, task) : undefined
      }
      onDragOver={
        isDraggable ? (event) => onDragOver?.(event, task) : undefined
      }
      onDragLeave={
        isDraggable ? (event) => onDragLeave?.(event, task) : undefined
      }
      onDragEnd={isDraggable ? (event) => onDragEnd?.(event, task) : undefined}
      onDrop={isDraggable ? (event) => onDrop?.(event, task) : undefined}
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
        onTitleEditingChange={setIsTitleEditing}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
