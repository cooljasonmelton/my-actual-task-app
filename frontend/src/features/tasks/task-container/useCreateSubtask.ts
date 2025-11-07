import { useCallback } from "react";
import type { TaskType } from "@/types";
import { TASKS_API_URL } from "./constants";
import { useTasksActions } from "./state/TasksContext";

export const useCreateSubtask = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const handleCreateSubtask = useCallback(
    async (taskId: TaskType["id"], title: string) => {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        const message = "Subtask title cannot be empty";
        setError(message);
        throw new Error(message);
      }

      setError(null);

      try {
        const response = await fetch(`${TASKS_API_URL}/${taskId}/subtasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: trimmedTitle }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create subtask (${response.status})`);
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
    handleCreateSubtask,
  };
};
