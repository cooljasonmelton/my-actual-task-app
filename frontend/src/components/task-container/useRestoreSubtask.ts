import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { Subtask, TaskType } from "../../types";
import { TASKS_API_URL } from "./constants";

export const useRestoreSubtask = ({
  setError,
  loadTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  loadTasks: () => Promise<void>;
}) => {
  const handleRestoreSubtask = useCallback(
    async (taskId: TaskType["id"], subtaskId: Subtask["id"]) => {
      setError(null);

      try {
        const response = await fetch(
          `${TASKS_API_URL}/${taskId}/subtasks/${subtaskId}/restore`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to restore subtask (${response.status})`);
        }

        await loadTasks();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        throw new Error(message);
      }
    },
    [loadTasks, setError]
  );

  return {
    handleRestoreSubtask,
  };
};
