import { useCallback } from "react";
import type { TaskType } from "@/types";
import { TASKS_API_URL } from "./constants";
import type { ApiTask } from "./types";
import { parseTaskFromApi } from "./utils/taskContainerUtils";
import { DEFAULT_TASK_SORT_OPTION, sortTasks } from "./utils/taskSorting";
import { useTasksActions } from "./state/TasksContext";

export const useUpdateTitle = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError, setTasks } = useTasksActions();
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
            DEFAULT_TASK_SORT_OPTION
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
    [loadTasks, setError, setTasks]
  );

  return {
    handleUpdateTitle,
  };
};
