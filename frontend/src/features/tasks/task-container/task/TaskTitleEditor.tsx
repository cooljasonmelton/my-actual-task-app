import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Button from "@/components/design-system-components/button/Button";
import useEditableActivation from "../useEditableActivation";

type TaskTitleEditorProps = {
  taskId: number;
  title: string;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
  onUpdateTitle: (id: number, updatedTitle: string) => Promise<void>;
  onEditingChange?: (isEditing: boolean) => void;
};

const TaskTitleEditor = ({
  taskId,
  title,
  isSoftDeleted,
  isSoftDeletedToday,
  onUpdateTitle,
  onEditingChange,
}: TaskTitleEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = titleInputRef.current;
    if (!textarea) {
      return;
    }

    const nearestRem = Math.round(textarea.scrollHeight / 16);
    textarea.style.height = "auto";
    textarea.style.height = `${nearestRem}rem`;
  }, []);

  useEffect(() => {
    if (isEditing) {
      const textarea = titleInputRef.current;
      textarea?.focus();
      textarea?.select();
      adjustTextareaHeight();
    }
  }, [adjustTextareaHeight, isEditing]);

  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  const handleStartEditing = useCallback(() => {
    if (isSoftDeleted) {
      return;
    }
    setTitleError(null);
    setDraftTitle(title);
    setIsEditing(true);
  }, [isSoftDeleted, title]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraftTitle(title);
    setTitleError(null);
  }, [title]);

  const handleSubmitTitle = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedTitle = draftTitle.trim();

      if (!trimmedTitle) {
        setTitleError("Title cannot be empty");
        return;
      }
      if (trimmedTitle === title) {
        handleCancelEditing();
        return;
      }

      setIsSavingTitle(true);
      setTitleError(null);

      try {
        await onUpdateTitle(taskId, trimmedTitle);
        setIsEditing(false);
      } catch (error) {
        // TODO: make error message not cause card to jump
        const message =
          error instanceof Error ? error.message : "Failed to update title";
        setTitleError(message);
      } finally {
        setIsSavingTitle(false);
      }
    },
    [draftTitle, handleCancelEditing, onUpdateTitle, taskId, title]
  );

  const { handleDoubleClick, handleKeyDown, interactionProps } =
    useEditableActivation(handleStartEditing, { isDisabled: isSoftDeleted });

  const handleTitleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancelEditing();
      }
    },
    [handleCancelEditing]
  );

  const handleFormBlur = useCallback(
    (event: FocusEvent<HTMLFormElement>) => {
      if (isSavingTitle) {
        return;
      }

      const nextFocusTarget = event.relatedTarget as Node | null;
      if (!event.currentTarget.contains(nextFocusTarget)) {
        handleCancelEditing();
      }
    },
    [handleCancelEditing, isSavingTitle]
  );

  const titleClassName = `task-title${
    isSoftDeleted ? " task-title--soft-deleted" : ""
  }${isSoftDeletedToday ? " task-title--soft-deleted-today" : ""}`;

  if (isEditing) {
    return (
      <form
        className="task-title-form"
        onSubmit={handleSubmitTitle}
        onBlur={handleFormBlur}
      >
        <textarea
          ref={titleInputRef}
          className="task-title-form__input"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={handleTitleInputKeyDown}
          disabled={isSavingTitle}
          aria-label="Task title"
        />
        <div className="task-title-form__actions">
          <Button
            variant="secondary"
            size="small"
            type="submit"
            disabled={isSavingTitle}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="dark"
            size="small"
            onClick={handleCancelEditing}
            disabled={isSavingTitle}
          >
            Cancel
          </Button>
        </div>
        {titleError && (
          <p className="task-title-form__error" role="alert">
            {titleError}
          </p>
        )}
      </form>
    );
  }
  return (
    <h3
      className={titleClassName}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      {...interactionProps}
    >
      {title}
    </h3>
  );
};
export default TaskTitleEditor;
