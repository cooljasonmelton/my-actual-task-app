import {
  Star,
  ChevronDown,
  ChevronRight,
  XCircle,
  ArchiveRestore,
  ListChecks,
  Copy,
} from "lucide-react";
import type { TaskHeaderProps } from "../types";
import TaskTitleEditor from "./TaskTitleEditor";
import useKeyboardActivation from "../useKeyboardActivation";
import useCopyToClipboard from "../useCopyToClipboard";
import useTaskDeleteAction from "./useTaskDeleteAction";
import TaskDeleteCheckbox from "./TaskDeleteCheckbox";
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
  const {
    shouldDeleteFromCheckbox,
    shouldDeleteFromIcon,
    isDeleting,
    handleDeleteRequest,
  } = useTaskDeleteAction({
    taskId,
    onDelete,
    isSoftDeleted,
  });
  const handleDeleteClick = (source: "checkbox" | "icon") => {
    void handleDeleteRequest(source);
  };
  const { isCopying, copyText } = useCopyToClipboard();
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

  const handleCopyTitle = () => {
    void copyText(title);
  };

  const { handleKeyDown: handleCopyKeyDown } =
    useKeyboardActivation(handleCopyTitle);
  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        <TaskDeleteCheckbox
          isSoftDeleted={isSoftDeleted}
          isDeleting={isDeleting}
          shouldDelete={shouldDeleteFromCheckbox}
          onDelete={() => handleDeleteClick("checkbox")}
          onDeleteKeyDown={() => {
            void handleDeleteRequest("checkbox");
          }}
        />
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
        <Copy
          onClick={handleCopyTitle}
          onKeyDown={handleCopyKeyDown}
          className={`task-header__icon task-header__icon--copy${
            isCopying ? " task-header__icon--copy-active" : ""
          }`}
          aria-label="Copy task title"
          role="button"
          tabIndex={0}
        />
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
            onClick={() => handleDeleteClick("icon")}
            onKeyDown={() => {
              void handleDeleteRequest("icon");
            }}
            className={`${
              shouldDeleteFromIcon ? "filled-delete" : "empty-delete"
            } task-header__icon`}
            aria-label={
              shouldDeleteFromIcon ? "Confirm delete task" : "Delete task"
            }
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
