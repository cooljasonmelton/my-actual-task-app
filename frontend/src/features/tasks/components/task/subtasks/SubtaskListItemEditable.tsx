import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Button from "@/components/design-system-components/button/Button";

import type { SubtaskItemProps } from "./SubtaskListItemContainer";
import "./SubtaskListItem.css";

type EditableBaseProps = Pick<
  SubtaskItemProps,
  "taskId" | "subtask" | "isTaskSoftDeleted" | "onUpdateSubtaskTitle"
>;

export type SubtaskListItemEditableProps = EditableBaseProps & {
  closeEditForm: () => void;
};

const SubtaskListItemEditable = ({
  taskId,
  subtask,
  isTaskSoftDeleted,
  onUpdateSubtaskTitle,
  closeEditForm,
}: SubtaskListItemEditableProps) => {
  const [draftTitle, setDraftTitle] = useState(subtask.title);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formId = useMemo(
    () => `subtask-edit-${taskId}-${subtask.id}`,
    [subtask.id, taskId]
  );

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const resetEditingState = useCallback(() => {
    setDraftTitle(subtask.title);
    setLocalError(null);
  }, [subtask.title]);

  const handleCancelEditing = useCallback(() => {
    resetEditingState();
    closeEditForm();
  }, [resetEditingState, closeEditForm]);

  const handleTitleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (localError) {
        setLocalError(null);
      }
      setDraftTitle(event.target.value);
    },
    [localError]
  );

  const handleTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancelEditing();
      }
    },
    [handleCancelEditing]
  );

  const handleSubmitTitle = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isTaskSoftDeleted || isSaving) {
        return;
      }

      const trimmedTitle = draftTitle.trim();

      if (!trimmedTitle) {
        setLocalError("Subtask title cannot be empty");
        return;
      }

      if (trimmedTitle === subtask.title) {
        resetEditingState();
        return;
      }

      setIsSaving(true);
      setLocalError(null);

      try {
        await onUpdateSubtaskTitle(taskId, subtask.id, trimmedTitle);
        resetEditingState();
        closeEditForm();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update subtask";
        setLocalError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [
      draftTitle,
      isSaving,
      isTaskSoftDeleted,
      onUpdateSubtaskTitle,
      resetEditingState,
      closeEditForm,
      subtask.id,
      subtask.title,
      taskId,
    ]
  );

  return (
    <li className={"subtask-item"}>
      <div className="subtask-item__content">
        <form
          id={formId}
          className="subtask-item__form"
          onSubmit={handleSubmitTitle}
        >
          <input
            ref={inputRef}
            className="subtask-item__input"
            value={draftTitle}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            disabled={isSaving}
            aria-label="Subtask title"
          />
          {localError && (
            <p className="subtask-item__error" role="alert">
              {localError}
            </p>
          )}
        </form>
      </div>
      <div className="subtask-item__actions">
        <Button
          type="submit"
          size="small"
          variant="secondary"
          form={formId}
          disabled={isSaving}
          isLoading={isSaving}
        >
          Save
        </Button>
        <Button
          type="button"
          size="small"
          variant="dark"
          onClick={handleCancelEditing}
          disabled={isSaving}
        >
          Cancel
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

export default SubtaskListItemEditable;
