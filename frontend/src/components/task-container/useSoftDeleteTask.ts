import { useCallback, type SetStateAction, type Dispatch } from "react";
import type { TaskType } from "../../types";
import { TASKS_API_URL } from "./constants";

export const useSoftDeleteTask = ({
  setError,
  loadTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  loadTasks: () => Promise<void>;
}) => {
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
