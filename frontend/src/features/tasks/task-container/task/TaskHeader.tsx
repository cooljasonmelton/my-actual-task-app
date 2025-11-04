import { useEffect, useState } from "react";
import {
  Star,
  ChevronDown,
  ChevronRight,
  XCircle,
  ArchiveRestore,
  ListChecks,
} from "lucide-react";
import type { TaskHeaderProps } from "../types";
import TaskTitleEditor from "./TaskTitleEditor";
import useKeyboardActivation from "../useKeyboardActivation";

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
  hasSubtasks,
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
  const Chevron = isExpanded ? ChevronDown : ChevronRight;
  const isPriorityDisabled = isPriorityUpdating || isSoftDeleted;

  let starVisualClass = "task-header__icon--star-default";
  let starAriaLabel = "Mark task as top priority";

  if (priority === 1) {
    starVisualClass = "task-header__icon--star-primary";
    starAriaLabel = "Set task to red priority";
  } else if (priority === 2) {
    starVisualClass = "task-header__icon--star-secondary";
    starAriaLabel = "Remove task priority";
  }

  const handleToggleStar = () => {
    if (isPriorityDisabled) {
      return;
    }

    void onTogglePriority(taskId, priority).catch((error) => {
      console.error("Failed to update task priority", error);
    });
  };

  const { handleKeyDown: handleExpandKeyDown } =
    useKeyboardActivation(toggleExpanded);

  const { handleKeyDown: handleStarKeyDown } = useKeyboardActivation(
    handleToggleStar,
    {
      isDisabled: isPriorityDisabled,
    }
  );

  const { handleKeyDown: handleRestoreKeyDown } =
    useKeyboardActivation(onRestoreRequest);

  const { handleKeyDown: handleDeleteKeyDown } = useKeyboardActivation(() => {
    void handleClickDelete();
  }, { isDisabled: isSoftDeleted || isDeleting });

  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        <Chevron
          onClick={toggleExpanded}
          onKeyDown={handleExpandKeyDown}
          className="task-header__chevron task-header__icon"
          aria-label={isExpanded ? "Hide task details" : "Expand task details"}
          role="button"
          tabIndex={0}
        />
        <Star
          onClick={handleToggleStar}
          onKeyDown={handleStarKeyDown}
          className={`${starVisualClass} task-header__icon task-header__icon--star`}
          aria-label={starAriaLabel}
          role="button"
          tabIndex={isPriorityDisabled ? -1 : 0}
          aria-disabled={isPriorityDisabled}
        />
        <TaskTitleEditor
          taskId={taskId}
          title={title}
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          onUpdateTitle={onUpdateTitle}
          onEditingChange={onTitleEditingChange}
        />
      </div>
      <div className="task-header__actions">
        {hasSubtasks ? (
          <div
            className="task-header__subtasks-indicator"
            role="button"
            aria-label={
              isExpanded ? "Hide task details" : "Expand task details"
            }
            tabIndex={0}
            onClick={toggleExpanded}
            onKeyDown={handleExpandKeyDown}
          >
            <ListChecks
              className="task-header__icon task-header__icon--subtasks"
              aria-hidden="true"
              focusable="false"
            />
          </div>
        ) : null}
        {isSoftDeleted ? (
          <ArchiveRestore
            onClick={onRestoreRequest}
            onKeyDown={handleRestoreKeyDown}
            className="task-header__icon task-header__icon--restore"
            aria-label="Restore task"
            role="button"
            tabIndex={0}
          />
        ) : (
          <XCircle
            onClick={handleClickDelete}
            onKeyDown={handleDeleteKeyDown}
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
    </div>
  );
};

export default TaskHeader;
