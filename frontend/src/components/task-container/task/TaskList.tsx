import Task from "./Task";
import NoTasksPlaceholder from "../NoTasksPlaceholder";
import type { DerivedTask } from "../types";
import type { Status, TaskType } from "../../../types";
import type { UseTaskDragAndDropResult } from "../utils/taskDragAndDrop";

type DragHandlers = Pick<
  UseTaskDragAndDropResult,
  | "handleDragStart"
  | "handleDragEnter"
  | "handleDragOver"
  | "handleDragLeave"
  | "handleDragEnd"
  | "handleDropOnTask"
>;

type TaskListProps = DragHandlers & {
  tasks: DerivedTask[];
  selectedStatus: Status;
  expandedTaskIds: Set<number>;
  onToggleExpanded: (taskId: number) => void;
  onDelete: (taskId: TaskType["id"]) => Promise<void>;
  onRestore: (taskId: TaskType["id"]) => Promise<void>;
  onTogglePriority: (
    taskId: TaskType["id"],
    currentPriority: TaskType["priority"]
  ) => Promise<void>;
  onUpdateTitle: (
    taskId: TaskType["id"],
    updatedTitle: string
  ) => Promise<void>;
  onCreateSubtask: (taskId: TaskType["id"], title: string) => Promise<void>;
  onUpdateSubtaskTitle: (
    taskId: TaskType["id"],
    subtaskId: number,
    updatedTitle: string
  ) => Promise<void>;
  onDeleteSubtask: (taskId: TaskType["id"], subtaskId: number) => Promise<void>;
  onRestoreSubtask: (
    taskId: TaskType["id"],
    subtaskId: number
  ) => Promise<void>;
  updatingPriorities: Set<number>;
  draggingTaskId: number | null;
  dragOverTaskId: number | null;
};

const TaskList = ({
  tasks,
  selectedStatus,
  expandedTaskIds,
  onToggleExpanded,
  onDelete,
  onRestore,
  onTogglePriority,
  onUpdateTitle,
  onCreateSubtask,
  onUpdateSubtaskTitle,
  onDeleteSubtask,
  onRestoreSubtask,
  updatingPriorities,
  draggingTaskId,
  dragOverTaskId,
  handleDragStart,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDragEnd,
  handleDropOnTask,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return <NoTasksPlaceholder />;
  }

  return (
    <>
      {tasks.map(({ task, isSoftDeleted, isSoftDeletedToday }) => (
        <Task
          key={task.id}
          task={task}
          onDelete={onDelete}
          onRestore={onRestore}
          onTogglePriority={onTogglePriority}
          onUpdateTitle={onUpdateTitle}
          onCreateSubtask={onCreateSubtask}
          onUpdateSubtaskTitle={onUpdateSubtaskTitle}
          onDeleteSubtask={onDeleteSubtask}
          onRestoreSubtask={onRestoreSubtask}
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          isPriorityUpdating={updatingPriorities.has(task.id)}
          isExpanded={expandedTaskIds.has(task.id)}
          onToggleExpanded={onToggleExpanded}
          draggable={!isSoftDeleted && selectedStatus !== "finished"}
          isDragging={draggingTaskId === task.id}
          isDragOver={dragOverTaskId === task.id}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
          onDrop={handleDropOnTask}
        />
      ))}
    </>
  );
};

export default TaskList;
