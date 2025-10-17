import { useMemo, useState } from "react";
import SubtaskListItemEditable from "./SubtaskListItemEditable";
import SubtaskListItem from "./SubtaskListItem";
import SubtaskListItemSoftDeleted from "./SubtaskListItemSoftDeleted";
import type { Subtask } from "../../../../types";

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
};

// TODO: fix all props -- only needed ones
const SubtaskListItemContainer = (props: SubtaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const isDeleted = useMemo(
    () => Boolean(props.subtask.deletedAt),
    [props.subtask.deletedAt]
  );

  const isLoading = false; // add isRestoring, isSubmitting, etc

  // TODO: add loading logic
  if (isLoading) {
    <div>is loading</div>;
  }

  if (isDeleted) {
    return <SubtaskListItemSoftDeleted {...props} />;
  }

  if (isEditing) {
    return (
      <SubtaskListItemEditable
        closeEditForm={() => setIsEditing(false)}
        {...props}
      />
    );
  }

  return <SubtaskListItem openEditForm={() => setIsEditing(true)} {...props} />;
};

export default SubtaskListItemContainer;
