import { useCallback } from "react";
import type { Subtask, TaskType } from "@/types";
import { TASKS_API_URL } from "./constants";
import { useTasksActions } from "./state/TasksContext";

export const useSoftDeleteSubtask = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const handleDeleteSubtask = useCallback(
    async (taskId: TaskType["id"], subtaskId: Subtask["id"]) => {
      setError(null);

      try {
        const response = await fetch(
          `${TASKS_API_URL}/${taskId}/subtasks/${subtaskId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete subtask (${response.status})`);
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
    handleDeleteSubtask,
  };
};
