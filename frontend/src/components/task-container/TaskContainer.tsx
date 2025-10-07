import { useCallback, useEffect, useMemo, useState } from "react";
import Task from "./Task";
import DashboardHeader from "../dashboard-header/DashboardHeader";
import type { Status, TaskType } from "../../types";
import "./TaskContainer.css";
import { DEFAULT_SECTION_TAB_ITEM } from "../../constants";
import {
  DEFAULT_TASK_SORT_OPTION,
  getNextPriority,
  sortTasks,
} from "../../utils/taskSorting";
import type { TaskSortOption } from "../../utils/taskSorting";

const TASKS_API_URL = "http://localhost:3000/tasks";

const REFERENCE_WINDOW_OFFSET_HOURS = 4;
const REFERENCE_WINDOW_OFFSET_MS =
  REFERENCE_WINDOW_OFFSET_HOURS * 60 * 60 * 1000;

const getReferenceWindowStart = (date: Date) => {
  const shifted = new Date(date.getTime() - REFERENCE_WINDOW_OFFSET_MS);
  shifted.setHours(0, 0, 0, 0);
  return new Date(shifted.getTime() + REFERENCE_WINDOW_OFFSET_MS);
};

const isSameReferenceWindow = (dateA: Date, dateB: Date) =>
  getReferenceWindowStart(dateA).getTime() ===
  getReferenceWindowStart(dateB).getTime();

type ApiTask = Omit<TaskType, "createdAt" | "deletedAt"> & {
  createdAt: string | Date;
  deletedAt: string | Date | null;
};

const parseTaskFromApi = (task: ApiTask): TaskType => ({
  ...task,
  createdAt:
    task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
  deletedAt: task.deletedAt
    ? task.deletedAt instanceof Date
      ? task.deletedAt
      : new Date(task.deletedAt)
    : null,
});

type DerivedTask = {
  task: TaskType;
  isSoftDeleted: boolean;
  isSoftDeletedToday: boolean;
};

const createEmptyBuckets = (): Record<Status, DerivedTask[]> => ({
  next: [],
  ongoing: [],
  backburner: [],
  finished: [],
});

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
            previousTasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
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

  const referenceWindowStart = getReferenceWindowStart(new Date());
  const derivedTasks = useMemo<DerivedTask[]>(() => {
    return tasks.map((task) => {
      const deletedAt = task.deletedAt;
      const isSoftDeleted = Boolean(deletedAt);
      const isSoftDeletedToday = Boolean(
        deletedAt && isSameReferenceWindow(deletedAt, referenceWindowStart)
      );

      return {
        task,
        isSoftDeleted,
        isSoftDeletedToday,
      };
    });
  }, [tasks, referenceWindowStart]);

  const statusBuckets = useMemo(() => {
    const buckets = createEmptyBuckets();

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

  const statusCounts = useMemo<Record<Status, number>>(() => (
    {
      next: statusBuckets.next.length,
      ongoing: statusBuckets.ongoing.length,
      backburner: statusBuckets.backburner.length,
      finished: statusBuckets.finished.length,
    }
  ), [statusBuckets]);

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
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          isPriorityUpdating={updatingPriorities.has(task.id)}
        />
      )
    );
  };

  return (
    <>
      <DashboardHeader
        refreshTasks={loadTasks}
        reportError={setError}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusCounts={statusCounts}
      />

      <div className="task-container">
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
