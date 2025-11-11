import { useCallback, useRef } from "react";
import { TASKS_API_URL } from "@/config/api";
import { useTasksActions } from "@/features/tasks/context/TasksContext";

type SubtaskReorderPayload = {
  taskId: number;
  orderedSubtaskIds: number[];
};

export const usePersistSubtaskReorder = ({
  loadTasks,
}: {
  loadTasks: () => Promise<void>;
}) => {
  const { setError } = useTasksActions();
  const latestPayloadRef = useRef<SubtaskReorderPayload | null>(null);
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
          const response = await fetch(
            `${TASKS_API_URL}/${payload.taskId}/subtasks/reorder`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderedSubtaskIds: payload.orderedSubtaskIds,
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
      }
    } finally {
      isProcessingRef.current = false;
    }
  }, [loadTasks, setError]);

  const persistSubtaskReorder = useCallback(
    async (taskId: number, orderedSubtaskIds: number[]) => {
      if (orderedSubtaskIds.length === 0) {
        return;
      }

      latestPayloadRef.current = {
        taskId,
        orderedSubtaskIds: orderedSubtaskIds.slice(),
      };
      await processQueue();
    },
    [processQueue]
  );

  return { persistSubtaskReorder };
};
