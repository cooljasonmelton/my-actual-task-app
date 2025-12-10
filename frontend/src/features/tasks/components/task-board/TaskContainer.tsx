import { useCallback, useEffect, useRef, useState } from "react";
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
import TaskWorkspaceBody from "./TaskWorkspaceBody";
import "./TaskContainer.css";

const TaskContainer = () => {
  const { tasks, error, isLoading } = useTasksState();
  const [selectedStatus, setSelectedStatus] =
    useState<Status>(DEFAULT_SECTION_TAB_ITEM);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const {
    completionCount,
    catGifUrl,
    isCatLoading,
    catError,
    registerTaskCompletion,
    retryCatReward,
  } = useTaskCompletionRewards();
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
  const handleSubtaskCompleted = useCallback(
    async (taskId: number, subtaskId: number) => {
      await handleDeleteSubtask(taskId, subtaskId);
      void registerTaskCompletion();
    },
    [handleDeleteSubtask, registerTaskCompletion]
  );
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
  const handleToggleNotesPanel = () => {
    setIsNotesPanelOpen((previous) => !previous);
  };
  const handleCloseNotesPanel = () => {
    setIsNotesPanelOpen(false);
  };
  const taskContainerClassName =
    draggingTask && draggingTask.status === selectedStatus
    ? "task-container task-container--reordering"
    : "task-container";
  const workspaceClassName = `task-workspace__body${
    isNotesPanelOpen ? " task-workspace__body--panel-open" : ""
  }`;
  const taskListProps = {
    tasks: tasksForSelectedStatus,
    selectedStatus,
    expandedTaskIds,
    onToggleExpanded: handleToggleExpanded,
    onDelete: handleDeleteTask,
    onRestore: handleRestoreTask,
    onTogglePriority: handleTogglePriority,
    onUpdateTitle: handleUpdateTitle,
    onCreateSubtask: handleCreateSubtask,
    onUpdateSubtaskTitle: handleUpdateSubtaskTitle,
    onDeleteSubtask: handleSubtaskCompleted,
    onRestoreSubtask: handleRestoreSubtask,
    updatingPriorities,
    draggingTaskId: draggingTask?.id ?? null,
    dragOverTaskId,
    draggingSubtask,
    dragOverSubtaskId,
    handleSubtaskDragStart,
    handleSubtaskDragEnter,
    handleSubtaskDragOver,
    handleSubtaskDragLeave,
    handleSubtaskDrop: handleDropOnSubtask,
    handleSubtaskDragEnd,
    handleSubtaskListDragOver,
    handleSubtaskListDrop,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropOnTask,
    onTaskCompletedViaCheckbox: handleTaskCompletedViaCheckbox,
  };
  const inspirationPanelProps = {
    isOpen: isNotesPanelOpen,
    onClose: handleCloseNotesPanel,
    completionCount,
    catGifUrl,
    isCatLoading,
    catError,
    onRetryCat: retryCatReward,
  };
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
        onToggleNotesPanel={handleToggleNotesPanel}
      />
      <TaskWorkspaceBody
        workspaceClassName={workspaceClassName}
        taskContainerClassName={taskContainerClassName}
        handleContainerDragOver={handleContainerDragOver}
        handleDropOnContainer={handleDropOnContainer}
        error={error}
        isLoading={isLoading}
        taskListProps={taskListProps}
        inspirationPanelProps={inspirationPanelProps}
      />
    </>
  );
};
export default TaskContainer;
