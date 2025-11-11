import Task from "./Task";
import NoTasksPlaceholder from "../shared/NoTasksPlaceholder";
import type { DerivedTask, TaskProps } from "@/features/tasks/types";
import type { Status, TaskType } from "@/types";
import type { UseTaskDragAndDropResult } from "@/features/tasks/hooks/useTaskDragAndDrop";
import type { DraggingSubtask } from "@/features/tasks/utils/subtaskDragReorder";

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
  draggingSubtask: DraggingSubtask;
  dragOverSubtaskId: number | null;
  handleSubtaskDragStart: NonNullable<TaskProps["onSubtaskDragStart"]>;
  handleSubtaskDragEnter: NonNullable<TaskProps["onSubtaskDragEnter"]>;
  handleSubtaskDragOver: NonNullable<TaskProps["onSubtaskDragOver"]>;
  handleSubtaskDragLeave: NonNullable<TaskProps["onSubtaskDragLeave"]>;
  handleSubtaskDrop: NonNullable<TaskProps["onSubtaskDrop"]>;
  handleSubtaskDragEnd: NonNullable<TaskProps["onSubtaskDragEnd"]>;
  handleSubtaskListDragOver: NonNullable<TaskProps["onSubtaskListDragOver"]>;
  handleSubtaskListDrop: NonNullable<TaskProps["onSubtaskListDrop"]>;
  onTaskCompletedViaCheckbox: (taskId: TaskType["id"]) => void;
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
  draggingSubtask,
  dragOverSubtaskId,
  handleSubtaskDragStart,
  handleSubtaskDragEnter,
  handleSubtaskDragOver,
  handleSubtaskDragLeave,
  handleSubtaskDrop,
  handleSubtaskDragEnd,
  handleSubtaskListDragOver,
  handleSubtaskListDrop,
  handleDragStart,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDragEnd,
  handleDropOnTask,
  onTaskCompletedViaCheckbox,
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
          draggingSubtask={draggingSubtask}
          dragOverSubtaskId={dragOverSubtaskId}
          onSubtaskDragStart={handleSubtaskDragStart}
          onSubtaskDragEnter={handleSubtaskDragEnter}
          onSubtaskDragOver={handleSubtaskDragOver}
          onSubtaskDragLeave={handleSubtaskDragLeave}
          onSubtaskDrop={handleSubtaskDrop}
          onSubtaskDragEnd={handleSubtaskDragEnd}
          onSubtaskListDragOver={handleSubtaskListDragOver}
          onSubtaskListDrop={handleSubtaskListDrop}
          onCheckboxSoftDelete={() => onTaskCompletedViaCheckbox(task.id)}
        />
      ))}
    </>
  );
};

export default TaskList;
