import { useCallback } from "react";
import type { Subtask, TaskType } from "@/types";
import { TASKS_API_URL } from "@/config/api";
import { useTasksActions } from "@/features/tasks/context/TasksContext";

export const useUpdateSubtaskTitle = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const handleUpdateSubtaskTitle = useCallback(
    async (
      taskId: TaskType["id"],
      subtaskId: Subtask["id"],
      updatedTitle: string
    ) => {
      const trimmedTitle = updatedTitle.trim();

      if (!trimmedTitle) {
        const message = "Subtask title cannot be empty";
        setError(message);
        throw new Error(message);
      }

      setError(null);

      try {
        const response = await fetch(
          `${TASKS_API_URL}/${taskId}/subtasks/${subtaskId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: trimmedTitle }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update subtask (${response.status})`);
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
    handleUpdateSubtaskTitle,
  };
};
