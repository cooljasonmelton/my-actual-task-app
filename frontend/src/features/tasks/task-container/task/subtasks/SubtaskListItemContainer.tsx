import { useMemo, useState } from "react";
import SubtaskListItemEditable from "./SubtaskListItemEditable";
import SubtaskListItem from "./SubtaskListItem";
import SubtaskListItemSoftDeleted from "./SubtaskListItemSoftDeleted";
import type { Subtask } from "@/types";
import type { DraggingSubtask } from "../../utils/subtaskDragReorder";
import type { TaskProps } from "../../types";

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
  draggingSubtask: DraggingSubtask;
  dragOverSubtaskId: number | null;
  onSubtaskDragStart: NonNullable<TaskProps["onSubtaskDragStart"]>;
  onSubtaskDragEnter: NonNullable<TaskProps["onSubtaskDragEnter"]>;
  onSubtaskDragOver: NonNullable<TaskProps["onSubtaskDragOver"]>;
  onSubtaskDragLeave: NonNullable<TaskProps["onSubtaskDragLeave"]>;
  onSubtaskDrop: NonNullable<TaskProps["onSubtaskDrop"]>;
  onSubtaskDragEnd: NonNullable<TaskProps["onSubtaskDragEnd"]>;
};

const SubtaskListItemContainer = ({
  taskId,
  subtask,
  isTaskSoftDeleted,
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
}: SubtaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const isDeleted = useMemo(() => Boolean(subtask.deletedAt), [subtask.deletedAt]);

  const isLoading = false; // Future: add loading state management

  if (isLoading) {
    return <li className="subtask-item subtask-item--loading" />;
  }

  if (isDeleted) {
    return (
      <SubtaskListItemSoftDeleted
        taskId={taskId}
        subtask={subtask}
        isTaskSoftDeleted={isTaskSoftDeleted}
        onRestoreSubtask={onRestoreSubtask}
      />
    );
  }

  if (isEditing) {
    return (
      <SubtaskListItemEditable
        taskId={taskId}
        subtask={subtask}
        isTaskSoftDeleted={isTaskSoftDeleted}
        onUpdateSubtaskTitle={onUpdateSubtaskTitle}
        closeEditForm={() => setIsEditing(false)}
      />
    );
  }

  const isDragging =
    Boolean(draggingSubtask) && draggingSubtask?.id === subtask.id;
  const isDragOver = dragOverSubtaskId === subtask.id;

  return (
    <SubtaskListItem
      taskId={taskId}
      subtask={subtask}
      isTaskSoftDeleted={isTaskSoftDeleted}
      openEditForm={() => setIsEditing(true)}
      onDeleteSubtask={onDeleteSubtask}
      onRestoreSubtask={onRestoreSubtask}
      onUpdateSubtaskTitle={onUpdateSubtaskTitle}
      onDragStart={onSubtaskDragStart}
      onDragEnter={onSubtaskDragEnter}
      onDragOver={onSubtaskDragOver}
      onDragLeave={onSubtaskDragLeave}
      onDrop={onSubtaskDrop}
      onDragEnd={onSubtaskDragEnd}
      isDragging={isDragging}
      isDragOver={isDragOver}
    />
  );
};

export default SubtaskListItemContainer;
