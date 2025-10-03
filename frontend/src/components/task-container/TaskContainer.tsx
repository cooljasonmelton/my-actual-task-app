import { useCallback, useEffect, useMemo, useState } from "react";
import Task from "./Task";
import DashboardHeader from "../dashboard-header/DashboardHeader";
import type { Status, TaskType } from "../../types";
import "./TaskContainer.css";
import { DEFAULT_SECTION_TAB_ITEM } from "../../constants";

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

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    DEFAULT_SECTION_TAB_ITEM
  );

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
      setTasks(parsedTasks);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const referenceWindowStart = useMemo(
    () => getReferenceWindowStart(new Date()),
    []
  );
  const derivedTasks = useMemo(() => {
    return tasks.map((task) => {
      const deletedAt = task.deletedAt;
      const isSoftDeleted = Boolean(deletedAt);
      const isSoftDeletedToday = Boolean(
        deletedAt && isSameReferenceWindow(deletedAt, referenceWindowStart)
      );

      const effectiveStatus: Status =
        isSoftDeleted && !isSoftDeletedToday ? "finished" : task.status;

      return {
        task,
        effectiveStatus,
        isSoftDeleted,
        isSoftDeletedToday,
      };
    });
  }, [tasks, referenceWindowStart]);

  const statusCounts = useMemo(() => {
    return derivedTasks.reduce<Record<Status, number>>(
      (acc, { effectiveStatus }) => {
        acc[effectiveStatus] += 1;
        return acc;
      },
      { next: 0, ongoing: 0, backburner: 0, finished: 0 }
    );
  }, [derivedTasks]);

  const tasksForSelectedStatus = useMemo(
    () =>
      derivedTasks.filter(
        (derived) => derived.effectiveStatus === selectedStatus
      ),
    [derivedTasks, selectedStatus]
  );

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
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
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
