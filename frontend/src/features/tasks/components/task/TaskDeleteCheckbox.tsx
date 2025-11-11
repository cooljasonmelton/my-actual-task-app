import { CheckSquare, Square } from "lucide-react";
import type { KeyboardEventHandler } from "react";

type TaskDeleteCheckboxProps = {
  isSoftDeleted: boolean;
  isDeleting: boolean;
  shouldDelete: boolean;
  onDelete: () => void;
  onDeleteKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
};

const TaskDeleteCheckbox = ({
  isSoftDeleted,
  isDeleting,
  shouldDelete,
  onDelete,
  onDeleteKeyDown,
}: TaskDeleteCheckboxProps) => {
  const CheckboxIcon = isSoftDeleted ? CheckSquare : Square;
  const checkboxLabel = isSoftDeleted
    ? "Task already soft deleted"
    : shouldDelete
      ? "Confirm delete task"
      : "Soft delete task";
  const isInteractive = !isSoftDeleted;

  return (
    <button
      type="button"
      className="task-header__checkbox"
      onClick={isInteractive ? onDelete : undefined}
      onKeyDown={isInteractive ? onDeleteKeyDown : undefined}
      aria-label={checkboxLabel}
      aria-pressed={shouldDelete}
      aria-disabled={isSoftDeleted || isDeleting}
      tabIndex={isInteractive ? 0 : -1}
    >
      <CheckboxIcon
        className={`task-header__icon task-header__icon--checkbox${
          shouldDelete ? " task-header__icon--checkbox-active" : ""
        }`}
        aria-hidden="true"
        focusable="false"
      />
    </button>
  );
};

export default TaskDeleteCheckbox;
