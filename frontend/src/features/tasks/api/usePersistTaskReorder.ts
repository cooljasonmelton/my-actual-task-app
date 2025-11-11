import { useCallback, useRef } from "react";
import type { Status } from "@/types";
import { TASKS_API_URL } from "@/config/api";
import { useTasksActions } from "@/features/tasks/context/TasksContext";

type TasksReorderPayload = {
  status: Status;
  orderedIds: number[];
};

export const usePersistTaskReorder = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const latestPayloadRef = useRef<TasksReorderPayload | null>(null);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      while (latestPayloadRef.current) {
        const payload = latestPayloadRef.current;
        latestPayloadRef.current = null;

        try {
          const response = await fetch(`${TASKS_API_URL}/reorder`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: payload.status,
              orderedTaskIds: payload.orderedIds,
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
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [loadTasks, setError]);

  const persistTaskReorder = useCallback(
    async (status: Status, orderedIds: number[]) => {
      if (orderedIds.length === 0) {
        return;
      }

      latestPayloadRef.current = {
        status,
        orderedIds: orderedIds.slice(),
      };
      await processQueue();
    },
    [processQueue]
  );

  return {
    persistTaskReorder,
  };
};
