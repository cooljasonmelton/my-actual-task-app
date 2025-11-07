import { useCallback } from "react";
import type { TaskType } from "@/types";
import { TASKS_API_URL } from "./constants";
import { useTasksActions } from "./state/TasksContext";

export const useSoftDeleteTask = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
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
    [setError, loadTasks]
  );

  return {
    handleDeleteTask,
  };
};
