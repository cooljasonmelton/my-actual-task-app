import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Plus } from "lucide-react";
import Button from "@/components/design-system-components/button/Button";
import SubtaskList from "./subtasks/SubtaskList";
import InputField from "@/components/design-system-components/form/InputField";
import type { Subtask } from "@/types";
import type { DraggingSubtask } from "../utils/subtaskDragReorder";
import type { TaskProps } from "../types";

import "./TaskContent.css";

type TaskContentProps = {
  taskId: number;
  subtasks: Subtask[];
  isSoftDeleted: boolean;
  onCreateSubtask: (taskId: number, title: string) => Promise<void>;
  onUpdateSubtaskTitle: (
    taskId: number,
    subtaskId: number,
    updatedTitle: string
  ) => Promise<void>;
  onDeleteSubtask: (taskId: number, subtaskId: number) => Promise<void>;
  onRestoreSubtask: (taskId: number, subtaskId: number) => Promise<void>;
  draggingSubtask: DraggingSubtask;
  dragOverSubtaskId: number | null;
  onSubtaskDragStart: NonNullable<TaskProps["onSubtaskDragStart"]>;
  onSubtaskDragEnter: NonNullable<TaskProps["onSubtaskDragEnter"]>;
  onSubtaskDragOver: NonNullable<TaskProps["onSubtaskDragOver"]>;
  onSubtaskDragLeave: NonNullable<TaskProps["onSubtaskDragLeave"]>;
  onSubtaskDrop: NonNullable<TaskProps["onSubtaskDrop"]>;
  onSubtaskDragEnd: NonNullable<TaskProps["onSubtaskDragEnd"]>;
  onSubtaskListDragOver: NonNullable<TaskProps["onSubtaskListDragOver"]>;
  onSubtaskListDrop: NonNullable<TaskProps["onSubtaskListDrop"]>;
};

const TaskContent = ({
  taskId,
  subtasks,
  isSoftDeleted,
  onCreateSubtask,
  onUpdateSubtaskTitle,
  onDeleteSubtask,
  onRestoreSubtask,
  draggingSubtask,
  dragOverSubtaskId,
  onSubtaskDragStart,
  onSubtaskDragEnter,
  onSubtaskDragOver,
  onSubtaskDragLeave,
  onSubtaskDrop,
  onSubtaskDragEnd,
  onSubtaskListDragOver,
  onSubtaskListDrop,
}: TaskContentProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasSubtasks = subtasks.length > 0;

  useEffect(() => {
    if (newSubtaskTitle === "") {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
    }
  }, [newSubtaskTitle]);

  const handleSubmitNewSubtask = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (isSoftDeleted || isSubmitting) {
        return;
      }

      const trimmedTitle = newSubtaskTitle.trim();

      if (!trimmedTitle) {
        setLocalError("Subtask title cannot be empty");
        return;
      }

      setIsSubmitting(true);
      setLocalError(null);

      try {
        await onCreateSubtask(taskId, trimmedTitle);
        setNewSubtaskTitle("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create subtask";
        setLocalError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSoftDeleted, isSubmitting, newSubtaskTitle, onCreateSubtask, taskId]
  );

  const isCreateDisabled = isSoftDeleted || isSubmitting;

  return (
    <div className="task-content">
      <form className="task-content__form" onSubmit={handleSubmitNewSubtask}>
        <InputField
          id={`new-subtask-${taskId}`}
          type="text"
          name="task-title"
          className="new-task-input"
          placeholder="Add a subtask"
          label="Add a subtask"
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          value={newSubtaskTitle}
          ref={inputRef}
          disabled={isCreateDisabled}
        />
        <Button
          type="submit"
          size="small"
          variant="secondary"
          disabled={isCreateDisabled}
          isLoading={isSubmitting}
          aria-label="Add subtask"
        >
          <Plus size={20} />
        </Button>
      </form>
      {/* TODO: replace with error component */}
      {localError && (
        <p className="task-content__form-error" role="alert">
          {localError}
        </p>
      )}
      <SubtaskList
        taskId={taskId}
        subtasks={subtasks}
        isTaskSoftDeleted={isSoftDeleted}
        onUpdateSubtaskTitle={onUpdateSubtaskTitle}
        onDeleteSubtask={onDeleteSubtask}
        onRestoreSubtask={onRestoreSubtask}
        draggingSubtask={draggingSubtask}
        dragOverSubtaskId={dragOverSubtaskId}
        onSubtaskDragStart={onSubtaskDragStart}
        onSubtaskDragEnter={onSubtaskDragEnter}
        onSubtaskDragOver={onSubtaskDragOver}
        onSubtaskDragLeave={onSubtaskDragLeave}
        onSubtaskDrop={onSubtaskDrop}
        onSubtaskDragEnd={onSubtaskDragEnd}
        onSubtaskListDragOver={onSubtaskListDragOver}
        onSubtaskListDrop={onSubtaskListDrop}
      />
      {!hasSubtasks && <p className="task-content__empty">no subtasks</p>}
    </div>
  );
};

export default TaskContent;
