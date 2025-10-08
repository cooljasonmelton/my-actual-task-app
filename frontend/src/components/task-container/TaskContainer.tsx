// TODO: refactor for smaller file size

import { useCallback, useEffect, useMemo, useState } from "react";
import Task from "./task/Task";
import DashboardHeader from "../dashboard-header/DashboardHeader";
import type { Status, TaskType } from "../../types";
import type { ApiTask, DerivedTask } from "./types";
import type { TaskSortOption } from "../../utils/taskSorting";
import {
  DEFAULT_SECTION_TAB_ITEM,
  STATUS_SECTION_TAB_ITEMS,
} from "../../constants";
import {
  DEFAULT_TASK_SORT_OPTION,
  getNextPriority,
  sortTasks,
} from "../../utils/taskSorting";
import { useTaskDragAndDrop } from "../../utils/taskDragAndDrop";
import { useReferenceWindow } from "../../hooks/useReferenceWindow";
import { parseTaskFromApi, createEmptyBuckets } from "./taskContainerUtils";

import "./TaskContainer.css";

const TASKS_API_URL = "http://localhost:3000/tasks";
const STATUS_VALUES = STATUS_SECTION_TAB_ITEMS.map((item) => item.value);

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    DEFAULT_SECTION_TAB_ITEM
  );
  const [updatingPriorities, setUpdatingPriorities] = useState<Set<number>>(
    () => new Set()
  );
  const sortOption: TaskSortOption = DEFAULT_TASK_SORT_OPTION;

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const response = await fetch(`${TASKS_API_URL}?includeDeleted=true`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedTasks = Array.isArray(data)
        ? (data as ApiTask[]).map(parseTaskFromApi)
        : [];
      setTasks(sortTasks(parsedTasks, sortOption));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sortOption]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleDeleteTask = useCallback(
    async (id: TaskType["id"]) => {
      setError(null);
      try {
        const response = await fetch(`${TASKS_API_URL}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete task (${response.status})`);
        }

        await loadTasks();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        throw new Error(message);
      }
    },
    [loadTasks]
  );

  const handleTogglePriority = useCallback(
    async (id: TaskType["id"], currentPriority: TaskType["priority"]) => {
      setError(null);

      let shouldSkip = false;

      setUpdatingPriorities((prev) => {
        if (prev.has(id)) {
          shouldSkip = true;
          return prev;
        }
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      if (shouldSkip) {
        return;
      }

      const nextPriority = getNextPriority(currentPriority);

      try {
        const response = await fetch(`${TASKS_API_URL}/${id}/priority`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priority: nextPriority }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to update task priority (${response.status})`
          );
        }

        const data = (await response.json()) as ApiTask;
        const updatedTask = parseTaskFromApi(data);

        setTasks((previousTasks) =>
          sortTasks(
            previousTasks.map((task) => (task.id === id ? updatedTask : task)),
            sortOption
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        throw new Error(message);
      } finally {
        setUpdatingPriorities((prev) => {
          if (!prev.has(id)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [sortOption]
  );

  const handleUpdateTitle = useCallback(
    async (id: TaskType["id"], updatedTitle: string) => {
      const trimmedTitle = updatedTitle.trim();

      if (!trimmedTitle) {
        const message = "Title cannot be empty";
        setError(message);
        throw new Error(message);
      }

      setError(null);

      try {
        const response = await fetch(`${TASKS_API_URL}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: trimmedTitle }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update title (${response.status})`);
        }

        const data = (await response.json()) as ApiTask;
        const updatedTask = parseTaskFromApi(data);

        setTasks((previousTasks) =>
          sortTasks(
            previousTasks.map((task) => (task.id === id ? updatedTask : task)),
            sortOption
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        await loadTasks();
        throw new Error(message);
      }
    },
    [loadTasks, sortOption]
  );

  const persistReorder = useCallback(
    async (status: Status, orderedIds: number[]) => {
      if (orderedIds.length === 0) {
        return;
      }

      try {
        const response = await fetch(`${TASKS_API_URL}/reorder`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            orderedTaskIds: orderedIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder tasks (${response.status})`);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        await loadTasks();
        setError(message);
      }
    },
    [loadTasks]
  );

  const {
    draggingTask,
    dragOverTaskId,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropOnTask,
    handleContainerDragOver,
    handleDropOnContainer,
  } = useTaskDragAndDrop({
    sortOption,
    selectedStatus,
    setTasks,
    persistReorder,
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
      return (
        <p className="task-container__empty">No tasks in this section yet.</p>
      );
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
      />

      <div
        className={taskContainerClassName}
        onDragOver={handleContainerDragOver}
        onDrop={handleDropOnContainer}
      >
        {error && <p className="task-container__error">{error}</p>}
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
