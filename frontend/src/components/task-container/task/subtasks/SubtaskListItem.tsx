import { useCallback, useState, type KeyboardEvent } from "react";
import { Square } from "lucide-react";
import Button from "../../../design-system-components/button/Button";
import type { Subtask } from "../../../../types";
import useEditableActivation from "../../useEditableActivation";

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
};

const SubtaskListItem = ({
  taskId,
  subtask,
  isTaskSoftDeleted,
  onDeleteSubtask,
  openEditForm,
}: SubtaskItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const handleDeleteKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    void handleDelete();
  };
  // TODO: fix disabled logic to handle loading / error states
  // const isActionDisabled =
  //   isTaskSoftDeleted || isSaving || isDeleting || isRestoring;
  const isActionDisabled = isTaskSoftDeleted || isDeleting;
  const { handleDoubleClick, handleKeyDown, interactionProps } =
    useEditableActivation(handleStartEditing, { isDisabled: isActionDisabled });

  return (
    <li className={"subtask-item"}>
      <Square
        onClick={handleDelete}
        onKeyDown={(event) => handleDeleteKeyDown(event)}
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
