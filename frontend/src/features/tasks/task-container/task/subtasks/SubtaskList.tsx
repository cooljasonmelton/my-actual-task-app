import type { DragEvent } from "react";
import type { Subtask } from "@/types";
import SubtaskListItemContainer from "./SubtaskListItemContainer";
import "./SubtaskList.css";
import type { DraggingSubtask } from "../../utils/subtaskDragReorder";
import type { TaskProps } from "../../types";

type SubtaskListProps = {
  taskId: number;
  subtasks: Subtask[];
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
  onSubtaskListDragOver: NonNullable<TaskProps["onSubtaskListDragOver"]>;
  onSubtaskListDrop: NonNullable<TaskProps["onSubtaskListDrop"]>;
};

const SubtaskList = ({
  taskId,
  subtasks,
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
  onSubtaskListDragOver,
  onSubtaskListDrop,
}: SubtaskListProps) => {
  if (subtasks.length === 0) {
    return null;
  }

  const listClassName = `subtask-list${
    draggingSubtask && draggingSubtask.taskId === taskId
      ? " subtask-list--dragging"
      : ""
  }`;

  const handleListDragOver = (event: DragEvent<HTMLUListElement>) => {
    onSubtaskListDragOver(event, { taskId });
  };

  const handleListDrop = (event: DragEvent<HTMLUListElement>) => {
    onSubtaskListDrop(event, { taskId });
  };

  return (
    <ul className={listClassName} onDragOver={handleListDragOver} onDrop={handleListDrop}>
      {subtasks.map((subtask) => (
        <SubtaskListItemContainer
          key={subtask.id}
          taskId={taskId}
          subtask={subtask}
          isTaskSoftDeleted={isTaskSoftDeleted}
          draggingSubtask={draggingSubtask}
          dragOverSubtaskId={dragOverSubtaskId}
          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
          onDeleteSubtask={onDeleteSubtask}
          onRestoreSubtask={onRestoreSubtask}
          onSubtaskDragStart={onSubtaskDragStart}
          onSubtaskDragEnter={onSubtaskDragEnter}
          onSubtaskDragOver={onSubtaskDragOver}
          onSubtaskDragLeave={onSubtaskDragLeave}
          onSubtaskDrop={onSubtaskDrop}
          onSubtaskDragEnd={onSubtaskDragEnd}
        />
      ))}
    </ul>
  );
};

export default SubtaskList;
