import { useCallback, type SetStateAction, type Dispatch } from "react";
import type { Status } from "../../types";
import { TASKS_API_URL } from "./constants";

export const usePersistReorder = ({
  setError,
  loadTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  loadTasks: () => Promise<void>;
}) => {
  const persistReorder = useCallback(
    async (status: Status, orderedIds: number[]) => {
      if (orderedIds.length === 0) {
        return;
      }

      try {
        const response = await fetch(`${TASKS_API_URL}/reorder`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            orderedTaskIds: orderedIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder tasks (${response.status})`);
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

  return {
    persistReorder,
  };
};
