import { useCallback } from "react";
import { Copy, Square } from "lucide-react";
import Button from "@/components/design-system-components/button/Button";
import type { Subtask } from "@/types";
import type { TaskProps } from "@/features/tasks/types";
import useEditableActivation from "@/features/tasks/hooks/useEditableActivation";
import useKeyboardActivation from "@/features/tasks/hooks/useKeyboardActivation";
import useCopyToClipboard from "@/features/tasks/hooks/useCopyToClipboard";
import useSubtaskDeleteAction from "./useSubtaskDeleteAction";

import "./SubtaskListItem.css";

type SubtaskListItemProps = {
  taskId: number;
  subtask: Subtask;
  isTaskSoftDeleted: boolean;
  onDeleteSubtask: (taskId: number, subtaskId: number) => Promise<void>;
  onUpdateSubtaskTitle: (
    taskId: number,
    subtaskId: number,
    updatedTitle: string
  ) => Promise<void>;
  onRestoreSubtask: (taskId: number, subtaskId: number) => Promise<void>;
  openEditForm: () => void;
  onDragStart: NonNullable<TaskProps["onSubtaskDragStart"]>;
  onDragEnter: NonNullable<TaskProps["onSubtaskDragEnter"]>;
  onDragOver: NonNullable<TaskProps["onSubtaskDragOver"]>;
  onDragLeave: NonNullable<TaskProps["onSubtaskDragLeave"]>;
  onDrop: NonNullable<TaskProps["onSubtaskDrop"]>;
  onDragEnd: NonNullable<TaskProps["onSubtaskDragEnd"]>;
  isDragging: boolean;
  isDragOver: boolean;
};

const SubtaskListItem = ({
  taskId,
  subtask,
  isTaskSoftDeleted,
  onDeleteSubtask,
  openEditForm,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}: SubtaskListItemProps) => {
  const { isCopying, copyText } = useCopyToClipboard();
  const { isDeleting, error: localError, handleDelete, resetError } =
    useSubtaskDeleteAction({
      taskId,
      subtaskId: subtask.id,
      onDeleteSubtask,
      isTaskSoftDeleted,
    });

  const handleStartEditing = useCallback(() => {
    if (
      isTaskSoftDeleted ||
      isDeleting
    ) {
      return;
    }

    resetError();
    openEditForm();
  }, [
    isTaskSoftDeleted,
    isDeleting,
    openEditForm,
    resetError,
  ]);

  // TODO: fix disabled logic to handle loading / error states
  // const isActionDisabled =
  //   isTaskSoftDeleted || isSaving || isDeleting || isRestoring;
  const isActionDisabled = isTaskSoftDeleted || isDeleting;
  const { handleDoubleClick, handleKeyDown, interactionProps } =
    useEditableActivation(handleStartEditing, { isDisabled: isActionDisabled });
  const { handleKeyDown: handleDeleteKeyDown } = useKeyboardActivation(
    () => {
      void handleDelete();
    },
    {
      isDisabled: isActionDisabled,
    }
  );

  const handleCopyTitle = useCallback(() => {
    void copyText(subtask.title);
  }, [copyText, subtask.title]);

  const isDraggable = !isTaskSoftDeleted && !isDeleting;
  const dropEnabled = !isTaskSoftDeleted;
  const itemClassName = `subtask-item${
    isDraggable ? " subtask-item--draggable" : ""
  }${isDragging ? " subtask-item--dragging" : ""}${
    isDragOver ? " subtask-item--drag-over" : ""
  }`;

  return (
    <li
      className={itemClassName}
      draggable={isDraggable}
      onDragStart={
        isDraggable
          ? (event) =>
              onDragStart(event, {
                taskId,
                subtask,
                isTaskSoftDeleted,
              })
          : undefined
      }
      onDragEnter={
        dropEnabled ? (event) => onDragEnter(event, { taskId, subtask }) : undefined
      }
      onDragOver={
        dropEnabled ? (event) => onDragOver(event, { taskId, subtask }) : undefined
      }
      onDragLeave={
        dropEnabled ? (event) => onDragLeave(event, { taskId, subtask }) : undefined
      }
      onDrop={
        dropEnabled ? (event) => onDrop(event, { taskId, subtask }) : undefined
      }
      onDragEnd={isDraggable ? (event) => onDragEnd(event) : undefined}
      aria-grabbed={isDragging || undefined}
    >
      <Square
        onClick={handleDelete}
        onKeyDown={handleDeleteKeyDown}
        className={`${"empty-delete"} task-header__icon`}
        aria-label="Delete subtask"
        role="button"
        aria-disabled={isDeleting}
        tabIndex={0}
      />
      <div className="subtask-item__content">
        <span
          className="subtask-item__title"
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          {...interactionProps}
        >
          {subtask.title}
        </span>
      </div>
      <div className="subtask-item__actions">
        <Button
          type="button"
          size="small"
          variant="ghost"
          onClick={handleStartEditing}
          disabled={isActionDisabled}
        >
          Edit
        </Button>
        <button
          type="button"
          className={`subtask-item__copy-button${
            isCopying ? " subtask-item__copy-button--active" : ""
          }`}
          onClick={handleCopyTitle}
          aria-label="Copy subtask title"
        >
          <Copy
            className="subtask-item__copy-icon"
            aria-hidden="true"
            focusable="false"
          />
        </button>
      </div>
      {localError && (
        <p className="subtask-item__error" role="alert">
          {localError}
        </p>
      )}
    </li>
  );
};

export default SubtaskListItem;
