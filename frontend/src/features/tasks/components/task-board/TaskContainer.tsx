import { useEffect, useRef, useState } from "react";
import TaskList from "../task/TaskList";
import DashboardHeader from "@/components/dashboard-header/DashboardHeader";
import type { Status } from "@/types";
import { DEFAULT_SECTION_TAB_ITEM } from "@/constants";
import { DEFAULT_TASK_SORT_OPTION } from "@/features/tasks/utils/taskSorting";
import { useTaskDragAndDrop } from "@/features/tasks/hooks/useTaskDragAndDrop";
import { useReferenceWindow } from "@/features/tasks/hooks/useReferenceWindow";
import { useLoadTasks } from "@/features/tasks/api/useLoadTasks";
import { useSoftDeleteTask } from "@/features/tasks/api/useSoftDeleteTask";
import { useRestoreTask } from "@/features/tasks/api/useRestoreTask";
import { useTogglePriority } from "@/features/tasks/api/useTogglePriority";
import { useUpdateStatus } from "@/features/tasks/api/useUpdateStatus";
import { useUpdateTitle } from "@/features/tasks/api/useUpdateTitle";
import { usePersistTaskReorder } from "@/features/tasks/api/usePersistTaskReorder";
import { useCreateSubtask } from "@/features/tasks/api/useCreateSubtask";
import { useUpdateSubtaskTitle } from "@/features/tasks/api/useUpdateSubtaskTitle";
import { useSoftDeleteSubtask } from "@/features/tasks/api/useSoftDeleteSubtask";
import { useRestoreSubtask } from "@/features/tasks/api/useRestoreSubtask";
import { useDerivedTaskData } from "@/features/tasks/hooks/useDerivedTaskData";
import { useExpandedTasks } from "@/features/tasks/hooks/useExpandedTasks";
import { usePersistSubtaskReorder } from "@/features/tasks/api/usePersistSubtaskReorder";
import { useSubtaskDragAndDrop } from "@/features/tasks/hooks/useSubtaskDragAndDrop";
import { useTasksState } from "@/features/tasks/context/TasksContext";
import { useTaskCompletionRewards } from "@/features/tasks/hooks/useTaskCompletionRewards";
import InspirationPanel from "@/components/inspiration-panel/InspirationPanel";
import "./TaskContainer.css";
const TaskContainer = () => {
  const { tasks, error, isLoading } = useTasksState();
  const [selectedStatus, setSelectedStatus] =
    useState<Status>(DEFAULT_SECTION_TAB_ITEM);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const { catGifUrl, isCatLoading, catError, registerTaskCompletion, retryCatReward } =
    useTaskCompletionRewards();
  const { loadTasks } = useLoadTasks();
  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);
  const { updatingPriorities, handleTogglePriority } = useTogglePriority();
  const { handleUpdateStatus } = useUpdateStatus({ loadTasks });
  const { handleDeleteTask } = useSoftDeleteTask({ loadTasks });
  const { handleRestoreTask } = useRestoreTask({ loadTasks });
  const { handleUpdateTitle } = useUpdateTitle({ loadTasks });
  const { persistTaskReorder } = usePersistTaskReorder({ loadTasks });
  const { persistSubtaskReorder } = usePersistSubtaskReorder({ loadTasks });
  const { handleCreateSubtask } = useCreateSubtask({ loadTasks });
  const { handleUpdateSubtaskTitle } = useUpdateSubtaskTitle({ loadTasks });
  const { handleDeleteSubtask } = useSoftDeleteSubtask({ loadTasks });
  const { handleRestoreSubtask } = useRestoreSubtask({ loadTasks });
  const { expandedTaskIds, handleToggleExpanded } = useExpandedTasks(tasks);
  const handleTaskCompletedViaCheckbox = () => {
    void registerTaskCompletion();
  };
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
    persistReorder: persistTaskReorder,
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
  } = useSubtaskDragAndDrop({ persistReorder: persistSubtaskReorder });
  const { isInCurrentReferenceWindow } = useReferenceWindow();
  const { statusCounts, tasksForSelectedStatus } = useDerivedTaskData({
    tasks,
    selectedStatus,
    isInCurrentReferenceWindow,
  });
  const hasActiveCatState = Boolean(catGifUrl || catError || isCatLoading);
  const hasRewardRef = useRef(false);
  useEffect(() => {
    if (!hasRewardRef.current && hasActiveCatState) {
      setIsNotesPanelOpen(true);
    }
    hasRewardRef.current = hasActiveCatState;
  }, [hasActiveCatState]);
  const taskContainerClassName =
    draggingTask && draggingTask.status === selectedStatus
    ? "task-container task-container--reordering"
    : "task-container";
  return (
    <>
      <DashboardHeader
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
              onTaskCompletedViaCheckbox={handleTaskCompletedViaCheckbox}
            />
          )}
        </div>
        <InspirationPanel
          isOpen={isNotesPanelOpen}
          onClose={() => setIsNotesPanelOpen(false)}
          catGifUrl={catGifUrl}
          isCatLoading={isCatLoading}
          catError={catError}
          onRetryCat={retryCatReward}
        />
      </div>
    </>
  );
};

export default TaskContainer;
