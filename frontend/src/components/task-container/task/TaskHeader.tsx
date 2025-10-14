import { useEffect, useState, type KeyboardEvent } from "react";
import {
  Star,
  ChevronDown,
  ChevronRight,
  XCircle,
  ArchiveRestore,
} from "lucide-react";
import type { TaskHeaderProps } from "../types";
import TaskTitleEditor from "./TaskTitleEditor";

import "./TaskHeader.css";

const TaskHeader: React.FC<TaskHeaderProps> = ({
  taskId,
  title,
  priority,
  isExpanded,
  toggleExpanded,
  onDelete,
  onTogglePriority,
  onUpdateTitle,
  isSoftDeleted,
  isSoftDeletedToday,
  isPriorityUpdating,
  onTitleEditingChange,
  onRestoreRequest,
}) => {
  const [shouldDelete, setShouldDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!shouldDelete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldDelete(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [shouldDelete]);

  useEffect(() => {
    if (isSoftDeleted) {
      setShouldDelete(false);
      setIsDeleting(false);
    }
  }, [isSoftDeleted]);

  const handleClickDelete = async () => {
    if (isDeleting || isSoftDeleted) {
      return;
    }

    if (!shouldDelete) {
      setShouldDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(taskId);
    } catch (error) {
      console.error("Failed to delete task", error);
      setShouldDelete(false);
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<SVGSVGElement>,
    action: "expand" | "delete" | "star" | "restore"
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();

    if (action === "expand") {
      toggleExpanded();
    }

    if (action === "delete" && !isSoftDeleted) {
      void handleClickDelete();
    }

    if (action === "restore" && isSoftDeleted) {
      onRestoreRequest();
    }

    if (action === "star") {
      handleToggleStar();
    }
  };

  const Chevron = isExpanded ? ChevronDown : ChevronRight;
  const isStarred = priority === 1;
  const isPriorityDisabled = isPriorityUpdating || isSoftDeleted;
  const isStarredClassName = isStarred ? "filled-star" : "empty-star";

  const handleToggleStar = () => {
    if (isPriorityDisabled) {
      return;
    }

    void onTogglePriority(taskId, priority).catch((error) => {
      console.error("Failed to update task priority", error);
    });
  };

  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        <Chevron
          onClick={toggleExpanded}
          onKeyDown={(e) => handleKeyDown(e, "expand")}
          className="task-header__chevron task-header__icon"
          aria-label={isExpanded ? "Hide task details" : "Expand task details"}
          role="button"
          tabIndex={0}
        />
        <Star
          onClick={handleToggleStar}
          onKeyDown={(e) => handleKeyDown(e, "star")}
          className={`${isStarredClassName} task-header__icon task-header__icon--star`}
          aria-label={isStarred ? "Unstar task" : "Star task"}
          role="button"
          tabIndex={isPriorityDisabled ? -1 : 0}
          aria-disabled={isPriorityDisabled}
        />
        <div className="task-title-container">
          <TaskTitleEditor
            taskId={taskId}
            title={title}
            isSoftDeleted={isSoftDeleted}
            isSoftDeletedToday={isSoftDeletedToday}
            onUpdateTitle={onUpdateTitle}
            onEditingChange={onTitleEditingChange}
          />
        </div>
      </div>
      {isSoftDeleted ? (
        <ArchiveRestore
          onClick={onRestoreRequest}
          onKeyDown={(e) => handleKeyDown(e, "restore")}
          className="task-header__icon task-header__icon--restore"
          aria-label="Restore task"
          role="button"
          tabIndex={0}
        />
      ) : (
        <XCircle
          onClick={handleClickDelete}
          onKeyDown={(e) => handleKeyDown(e, "delete")}
          className={`${
            shouldDelete ? "filled-delete" : "empty-delete"
          } task-header__icon`}
          aria-label={shouldDelete ? "Confirm delete task" : "Delete task"}
          role="button"
          aria-disabled={isDeleting}
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default TaskHeader;
