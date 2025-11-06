import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Square } from "lucide-react";
import Button from "@/components/design-system-components/button/Button";
import type { Subtask } from "@/types";
import useEditableActivation from "../../useEditableActivation";
import useKeyboardActivation from "../../useKeyboardActivation";
import type { TaskProps } from "../../types";

import "./SubtaskListItem.css";

export type SubtaskItemProps = {
  taskId: number;
  subtask: Subtask;
  isTaskSoftDeleted: boolean;
  onUpdateSubtaskTitle: (
    taskId: number,
    subtaskId: number,
    updatedTitle: string
  ) => Promise<void>;
  onDeleteSubtask: (taskId: number, subtaskId: number) => Promise<void>;
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
}: SubtaskItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const copyFeedbackTimeoutRef = useRef<number | null>(null);

  const handleStartEditing = useCallback(() => {
    if (
      isTaskSoftDeleted ||
      // isDeleted ||
      // isSaving ||
      isDeleting
      // isRestoring
    ) {
      return;
    }

    setLocalError(null);
    openEditForm();
  }, [
    isTaskSoftDeleted,
    // isDeleted,
    // isSaving,
    isDeleting,
    // isRestoring,
    openEditForm,
  ]);

  const handleDelete = useCallback(async () => {
    if (isTaskSoftDeleted || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setLocalError(null);

    try {
      await onDeleteSubtask(taskId, subtask.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete subtask";
      setLocalError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [isTaskSoftDeleted, isDeleting, onDeleteSubtask, subtask.id, taskId]);

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

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        copyFeedbackTimeoutRef.current !== null
      ) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
        copyFeedbackTimeoutRef.current = null;
      }
    };
  }, []);

  const handleCopyTitle = useCallback(() => {
    if (!subtask.title) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      console.warn("Clipboard API is not available");
      return;
    }

    if (typeof window !== "undefined") {
      if (copyFeedbackTimeoutRef.current !== null) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
      }

      setIsCopying(true);
      copyFeedbackTimeoutRef.current = window.setTimeout(() => {
        setIsCopying(false);
        copyFeedbackTimeoutRef.current = null;
      }, 400);
    }

    void navigator.clipboard.writeText(subtask.title).catch((error) => {
      console.error("Failed to copy subtask title", error);
      setIsCopying(false);
      if (
        typeof window !== "undefined" &&
        copyFeedbackTimeoutRef.current !== null
      ) {
        window.clearTimeout(copyFeedbackTimeoutRef.current);
        copyFeedbackTimeoutRef.current = null;
      }
    });
  }, [subtask.title]);

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
        aria-label={"Delete task"}
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
