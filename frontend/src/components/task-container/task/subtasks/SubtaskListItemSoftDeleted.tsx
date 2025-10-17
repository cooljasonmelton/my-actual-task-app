import { useCallback, useState, type KeyboardEvent } from "react";
import { SquareCheck } from "lucide-react";
import type { Subtask } from "../../../../types";

import "./SubtaskListItem.css";

interface SubtaskListItemSoftDeletedProps {
  taskId: number;
  subtask: Subtask;
  isTaskSoftDeleted: boolean;
  onRestoreSubtask: (taskId: number, subtaskId: number) => Promise<void>;
}

const SubtaskListItemSoftDeleted = ({
  isTaskSoftDeleted,
  onRestoreSubtask,
  subtask,
  taskId,
}: SubtaskListItemSoftDeletedProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  // TODO: move up to container for isLoading?
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = useCallback(async () => {
    if (isTaskSoftDeleted || isRestoring) {
      return;
    }

    setIsRestoring(true);
    setLocalError(null);

    try {
      await onRestoreSubtask(taskId, subtask.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to restore subtask";
      setLocalError(message);
    } finally {
      setIsRestoring(false);
    }
  }, [isTaskSoftDeleted, isRestoring, onRestoreSubtask, subtask.id, taskId]);

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    handleRestore();
  };

  return (
    <div>
      <li className={"subtask-item subtask-item--deleted"}>
        <SquareCheck
          onClick={handleRestore}
          onKeyDown={(e) => handleKeyDown(e)}
          className="task-header__icon task-header__icon--restore"
          aria-label="Restore task"
          role="button"
          aria-disabled={isRestoring}
          tabIndex={0}
        />
        <div className="subtask-item__content">
          <span className="subtask-item__title">{subtask.title}</span>
        </div>
        {localError && (
          <p className="subtask-item__error" role="alert">
            {localError}
          </p>
        )}
      </li>
    </div>
  );
};

export default SubtaskListItemSoftDeleted;
