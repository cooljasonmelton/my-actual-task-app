import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

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
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(title);
    }
  }, [title, isEditing]);

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditing]);

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

      const trimmed = draftTitle.trim();

      if (!trimmed) {
        setTitleError("Title cannot be empty");
        return;
      }

      if (trimmed === title) {
        handleCancelEditing();
        return;
      }

      setIsSavingTitle(true);
      setTitleError(null);

      try {
        await onUpdateTitle(taskId, trimmed);
        setIsEditing(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update title";
        setTitleError(message);
      } finally {
        setIsSavingTitle(false);
      }
    },
    [draftTitle, handleCancelEditing, onUpdateTitle, taskId, title]
  );

  const handleTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLHeadingElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleStartEditing();
      }
    },
    [handleStartEditing]
  );

  const handleTitleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
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
        <input
          ref={titleInputRef}
          className="task-title-form__input"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={handleTitleInputKeyDown}
          disabled={isSavingTitle}
          aria-label="Task title"
        />
        <div className="task-title-form__actions">
          <button
            type="submit"
            className="task-title-form__button"
            disabled={isSavingTitle}
          >
            Save
          </button>
          <button
            type="button"
            className="task-title-form__button task-title-form__button--secondary"
            onClick={handleCancelEditing}
            disabled={isSavingTitle}
          >
            Cancel
          </button>
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
      onDoubleClick={handleStartEditing}
      onKeyDown={handleTitleKeyDown}
      role={isSoftDeleted ? undefined : "button"}
      tabIndex={isSoftDeleted ? -1 : 0}
    >
      {title}
    </h3>
  );
};

export default TaskTitleEditor;
