import type { Subtask } from "../../../../types";
import SubtaskListItemContainer from "./SubtaskListItemContainer";
import "./SubtaskList.css";

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
};

const SubtaskList = ({
  taskId,
  subtasks,
  isTaskSoftDeleted,
  onUpdateSubtaskTitle,
  onDeleteSubtask,
  onRestoreSubtask,
}: SubtaskListProps) => {
  if (subtasks.length === 0) {
    return null;
  }

  return (
    <ul className="subtask-list">
      {subtasks.map((subtask) => (
        <SubtaskListItemContainer
          key={subtask.id}
          taskId={taskId}
          subtask={subtask}
          isTaskSoftDeleted={isTaskSoftDeleted}
          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
          onDeleteSubtask={onDeleteSubtask}
          onRestoreSubtask={onRestoreSubtask}
        />
      ))}
    </ul>
  );
};

export default SubtaskList;
