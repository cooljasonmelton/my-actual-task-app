import { useCallback, type SetStateAction, type Dispatch } from "react";
import type { Status, TaskType } from "@/types";
import { TASKS_API_URL } from "./constants";
import type { ApiTask } from "./types";
import { parseTaskFromApi } from "./utils/taskContainerUtils";
import { DEFAULT_TASK_SORT_OPTION, sortTasks } from "./utils/taskSorting";

export const useUpdateStatus = ({
  setError,
  setTasks,
  loadTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  setTasks: Dispatch<SetStateAction<TaskType[]>>;
  loadTasks: () => Promise<void>;
}) => {
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
