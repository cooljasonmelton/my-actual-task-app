import { useCallback } from "react";
import type { Status, TaskType } from "@/types";
import { TASKS_API_URL } from "@/config/api";
import type { ApiTask } from "@/features/tasks/types";
import { parseTaskFromApi } from "@/features/tasks/utils/taskContainerUtils";
import { DEFAULT_TASK_SORT_OPTION, sortTasks } from "@/features/tasks/utils/taskSorting";
import { useTasksActions } from "@/features/tasks/context/TasksContext";

export const useUpdateStatus = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError, setTasks } = useTasksActions();
  const handleUpdateStatus = useCallback(
    async (id: TaskType["id"], nextStatus: Status) => {
      setError(null);

      try {
        const response = await fetch(`${TASKS_API_URL}/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update task status (${response.status})`);
        }

        const data = (await response.json()) as ApiTask;
        const updatedTask = parseTaskFromApi(data);

        setTasks((previousTasks) => {
          const taskExists = previousTasks.some((task) => task.id === id);
          const nextTasks = taskExists
            ? previousTasks.map((task) => (task.id === id ? updatedTask : task))
            : [...previousTasks, updatedTask];
          return sortTasks(nextTasks, DEFAULT_TASK_SORT_OPTION);
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        await loadTasks();
        throw new Error(message);
      }
    },
    [loadTasks, setError, setTasks]
  );

  return {
    handleUpdateStatus,
  };
};
