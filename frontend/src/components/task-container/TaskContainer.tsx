import { useEffect, useMemo, useState } from "react";
import Task from "./task/Task";
import DashboardHeader from "../dashboard-header/DashboardHeader";
import type { Status, TaskType } from "../../types";
import type { DerivedTask } from "./types";
import {
  DEFAULT_SECTION_TAB_ITEM,
  STATUS_SECTION_TAB_ITEMS,
} from "../../constants";
import { DEFAULT_TASK_SORT_OPTION } from "./utils/taskSorting";
import { useTaskDragAndDrop } from "./utils/taskDragAndDrop";
import { useReferenceWindow } from "./useReferenceWindow";
import { createEmptyBuckets } from "./utils/taskContainerUtils";
import { useLoadTasks } from "./useLoadTasks";
import { useSoftDeleteTask } from "./useSoftDeleteTask";
import { useTogglePriority } from "./useTogglePriorty";
import { useUpdateStatus } from "./useUpdateStatus";
import { useUpdateTitle } from "./useUpdateTitle";
import { usePersistReorder } from "./usePersistReorder";
import NoTasksPlaceholder from "./NoTasksPlaceholder";

import "./TaskContainer.css";

const STATUS_VALUES = STATUS_SECTION_TAB_ITEMS.map((item) => item.value);

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    DEFAULT_SECTION_TAB_ITEM
  );

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
  const { handleUpdateTitle } = useUpdateTitle({
    setError,
    setTasks,
    loadTasks,
  });
  const { persistReorder } = usePersistReorder({ loadTasks, setError });

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

  const { isInCurrentReferenceWindow } = useReferenceWindow();
  const derivedTasks = useMemo<DerivedTask[]>(() => {
    return tasks.map((task) => {
      const deletedAt = task.deletedAt;
      const isSoftDeleted = Boolean(deletedAt);
      const isSoftDeletedToday = Boolean(
        deletedAt && isInCurrentReferenceWindow(deletedAt)
      );

      return {
        task,
        isSoftDeleted,
        isSoftDeletedToday,
      };
    });
  }, [tasks, isInCurrentReferenceWindow]);

  const statusBuckets = useMemo(() => {
    const buckets = createEmptyBuckets(STATUS_VALUES);

    derivedTasks.forEach((item) => {
      const { task, isSoftDeleted, isSoftDeletedToday } = item;

      if (isSoftDeleted && !isSoftDeletedToday) {
        buckets.finished.push(item);
      } else {
        buckets[task.status].push(item);
      }
    });

    return buckets;
  }, [derivedTasks]);

  const statusCounts = useMemo<Record<Status, number>>(() => {
    return STATUS_VALUES.reduce((acc, status) => {
      acc[status] = statusBuckets[status]?.length ?? 0;
      return acc;
    }, {} as Record<Status, number>);
  }, [statusBuckets]);

  const tasksForSelectedStatus = statusBuckets[selectedStatus];

  const renderTasks = () => {
    if (tasksForSelectedStatus.length === 0) {
      return <NoTasksPlaceholder />;
    }

    return tasksForSelectedStatus.map(
      ({ task, isSoftDeleted, isSoftDeletedToday }) => (
        <Task
          key={task.id}
          task={task}
          onDelete={handleDeleteTask}
          onTogglePriority={handleTogglePriority}
          onUpdateTitle={handleUpdateTitle}
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          isPriorityUpdating={updatingPriorities.has(task.id)}
          draggable={!isSoftDeleted && selectedStatus !== "finished"}
          isDragging={draggingTask?.id === task.id}
          isDragOver={dragOverTaskId === task.id}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
          onDrop={handleDropOnTask}
        />
      )
    );
  };

  const isDraggingInSelectedStatus = Boolean(
    draggingTask && draggingTask.status === selectedStatus
  );
  const taskContainerClassName = `task-container${
    isDraggingInSelectedStatus ? " task-container--reordering" : ""
  }`;

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
      />

      <div
        className={taskContainerClassName}
        onDragOver={handleContainerDragOver}
        onDrop={handleDropOnContainer}
      >
        {/* TODO: better error component */}
        {error && <p className="task-container__error">{error}</p>}
        {/* TODO: better loading component */}
        {isLoading ? (
          <p className="task-container__loading">Loading tasks…</p>
        ) : (
          renderTasks()
        )}
      </div>
    </>
  );
};

export default TaskContainer;
