import { useCallback } from "react";
import { TASKS_API_URL } from "@/config/api";
import { useTasksActions } from "./state/TasksContext";

export const usePersistSubtaskReorder = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const persistSubtaskReorder = useCallback(
    async (taskId: number, orderedSubtaskIds: number[]) => {
      if (orderedSubtaskIds.length === 0) {
        return;
      }

      try {
        const response = await fetch(
          `${TASKS_API_URL}/${taskId}/subtasks/reorder`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderedSubtaskIds,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to reorder subtasks (${response.status})`
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        await loadTasks();
        setError(message);
      }
    },
    [loadTasks, setError]
  );

  return { persistSubtaskReorder };
};
