import { useCallback, type Dispatch, type SetStateAction } from "react";
import { TASKS_API_URL } from "./constants";

export const usePersistSubtaskReorder = ({
  setError,
  loadTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  loadTasks: () => Promise<void>;
}) => {
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
