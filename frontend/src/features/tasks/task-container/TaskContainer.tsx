import { useEffect, useState } from "react";
import TaskList from "./task/TaskList";
import DashboardHeader from "@/components/dashboard-header/DashboardHeader";
import type { Status, TaskType } from "@/types";
import { DEFAULT_SECTION_TAB_ITEM } from "@/constants";
import { DEFAULT_TASK_SORT_OPTION } from "./utils/taskSorting";
import { useTaskDragAndDrop } from "./utils/taskDragAndDrop";
import { useReferenceWindow } from "./useReferenceWindow";
import { useLoadTasks } from "./useLoadTasks";
import { useSoftDeleteTask } from "./useSoftDeleteTask";
import { useRestoreTask } from "./useRestoreTask";
import { useTogglePriority } from "./useTogglePriorty";
import { useUpdateStatus } from "./useUpdateStatus";
import { useUpdateTitle } from "./useUpdateTitle";
import { usePersistReorder } from "./usePersistReorder";
import { useCreateSubtask } from "./useCreateSubtask";
import { useUpdateSubtaskTitle } from "./useUpdateSubtaskTitle";
import { useSoftDeleteSubtask } from "./useSoftDeleteSubtask";
import { useRestoreSubtask } from "./useRestoreSubtask";
import { useDerivedTaskData } from "./useDerivedTaskData";
import { useExpandedTasks } from "./useExpandedTasks";
import { usePersistSubtaskReorder } from "./usePersistSubtaskReorder";
import { useSubtaskDragAndDrop } from "./useSubtaskDragAndDrop";
import NotesPanel from "@/components/notes-panel/NotesPanel";
import "./TaskContainer.css";

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<Status>(DEFAULT_SECTION_TAB_ITEM);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  const { loadTasks, isLoading } = useLoadTasks({ setError, setTasks });
  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const { updatingPriorities, handleTogglePriority } = useTogglePriority({
    setError,
    setTasks,
  });
  const { handleUpdateStatus } = useUpdateStatus({
    setError,
    setTasks,
    loadTasks,
  });
  const { handleDeleteTask } = useSoftDeleteTask({ setError, loadTasks });
  const { handleRestoreTask } = useRestoreTask({ setError, loadTasks });
  const { handleUpdateTitle } = useUpdateTitle({ setError, setTasks, loadTasks });
  const { persistReorder } = usePersistReorder({ loadTasks, setError });
  const { persistSubtaskReorder } = usePersistSubtaskReorder({ loadTasks, setError });
  const { handleCreateSubtask } = useCreateSubtask({ setError, loadTasks });
  const { handleUpdateSubtaskTitle } = useUpdateSubtaskTitle({ setError, loadTasks });
  const { handleDeleteSubtask } = useSoftDeleteSubtask({ setError, loadTasks });
  const { handleRestoreSubtask } = useRestoreSubtask({ setError, loadTasks });
  const { expandedTaskIds, handleToggleExpanded } = useExpandedTasks(tasks);

  const {
    draggingTask,
    dragOverTaskId,
    dragOverStatus,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropOnTask,
    handleContainerDragOver,
    handleDropOnContainer,
    handleStatusDragOver,
    handleStatusDragLeave,
    handleStatusDrop,
  } = useTaskDragAndDrop({
    sortOption: DEFAULT_TASK_SORT_OPTION,
    selectedStatus,
    setTasks,
    persistReorder,
    persistStatusChange: handleUpdateStatus,
  });

  const {
    draggingSubtask,
    dragOverSubtaskId,
    handleDragStart: handleSubtaskDragStart,
    handleDragEnter: handleSubtaskDragEnter,
    handleDragOver: handleSubtaskDragOver,
    handleDragLeave: handleSubtaskDragLeave,
    handleDropOnSubtask,
    handleListDragOver: handleSubtaskListDragOver,
    handleDropOnList: handleSubtaskListDrop,
    handleDragEnd: handleSubtaskDragEnd,
  } = useSubtaskDragAndDrop({
    setTasks,
    persistReorder: persistSubtaskReorder,
  });
  const { isInCurrentReferenceWindow } = useReferenceWindow();
  const { statusCounts, tasksForSelectedStatus } = useDerivedTaskData({
    tasks,
    selectedStatus,
    isInCurrentReferenceWindow,
  });

  const isDraggingInSelectedStatus = Boolean(draggingTask && draggingTask.status === selectedStatus);
  const taskContainerClassName = isDraggingInSelectedStatus
    ? "task-container task-container--reordering"
    : "task-container";

  return (
    <>
      <DashboardHeader
        refreshTasks={loadTasks}
        reportError={setError}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusCounts={statusCounts}
        isDragActive={Boolean(draggingTask)}
        dragOverStatus={dragOverStatus}
        onStatusDragOver={handleStatusDragOver}
        onStatusDragLeave={handleStatusDragLeave}
        onStatusDrop={handleStatusDrop}
        isNotesPanelOpen={isNotesPanelOpen}
        onToggleNotesPanel={() => setIsNotesPanelOpen((previous) => !previous)}
      />

      <div
        className={`task-workspace__body${
          isNotesPanelOpen ? " task-workspace__body--panel-open" : ""
        }`}
      >
        <div
          className={taskContainerClassName}
          onDragOver={handleContainerDragOver}
          onDrop={handleDropOnContainer}
        >
          {error && <p className="task-container__error">{error}</p>}
          {isLoading ? (
            <div
              className="card task-container__loading-card"
              role="status"
              aria-live="polite"
            >
              <div className="task-container__loading">
                <div className="task-container__loading-content">
                  <span
                    className="task-container__loading-spinner"
                    aria-hidden="true"
                  />
                  <span className="task-container__loading-text">
                    Loading tasks...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <TaskList
              tasks={tasksForSelectedStatus}
              selectedStatus={selectedStatus}
              expandedTaskIds={expandedTaskIds}
              onToggleExpanded={handleToggleExpanded}
              onDelete={handleDeleteTask}
              onRestore={handleRestoreTask}
              onTogglePriority={handleTogglePriority}
              onUpdateTitle={handleUpdateTitle}
              onCreateSubtask={handleCreateSubtask}
              onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
              onDeleteSubtask={handleDeleteSubtask}
              onRestoreSubtask={handleRestoreSubtask}
              updatingPriorities={updatingPriorities}
              draggingTaskId={draggingTask?.id ?? null}
              dragOverTaskId={dragOverTaskId}
              draggingSubtask={draggingSubtask}
              dragOverSubtaskId={dragOverSubtaskId}
              handleSubtaskDragStart={handleSubtaskDragStart}
              handleSubtaskDragEnter={handleSubtaskDragEnter}
              handleSubtaskDragOver={handleSubtaskDragOver}
              handleSubtaskDragLeave={handleSubtaskDragLeave}
              handleSubtaskDrop={handleDropOnSubtask}
              handleSubtaskDragEnd={handleSubtaskDragEnd}
              handleSubtaskListDragOver={handleSubtaskListDragOver}
              handleSubtaskListDrop={handleSubtaskListDrop}
              handleDragStart={handleDragStart}
              handleDragEnter={handleDragEnter}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDragEnd={handleDragEnd}
              handleDropOnTask={handleDropOnTask}
            />
          )}
        </div>
        <NotesPanel
          isOpen={isNotesPanelOpen}
          onClose={() => setIsNotesPanelOpen(false)}
        />
      </div>
    </>
  );
};

export default TaskContainer;
