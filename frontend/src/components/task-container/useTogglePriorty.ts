import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { TASKS_API_URL } from "./constants";
import { parseTaskFromApi } from "./taskContainerUtils";
import type { Task } from "../../../../shared/types/task";
import type { ApiTask } from "./types";
import type { TaskType } from "../../types";
import {
  DEFAULT_TASK_SORT_OPTION,
  getNextPriority,
  sortTasks,
} from "../../utils/taskSorting";

export const useTogglePriority = ({
  setError,
  setTasks,
}: {
  setError: Dispatch<SetStateAction<string | null>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
}) => {
  const [updatingPriorities, setUpdatingPriorities] = useState<Set<number>>(
    () => new Set()
  );
  const handleTogglePriority = useCallback(
    async (id: TaskType["id"], currentPriority: TaskType["priority"]) => {
      setError(null);

      let shouldSkip = false;

      setUpdatingPriorities((prev) => {
        if (prev.has(id)) {
          shouldSkip = true;
          return prev;
        }
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      if (shouldSkip) {
        return;
      }

      const nextPriority = getNextPriority(currentPriority);

      try {
        const response = await fetch(`${TASKS_API_URL}/${id}/priority`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priority: nextPriority }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to update task priority (${response.status})`
          );
        }

        const data = (await response.json()) as ApiTask;
        const updatedTask = parseTaskFromApi(data);

        setTasks((previousTasks) =>
          sortTasks(
            previousTasks.map((task) => (task.id === id ? updatedTask : task)),
            DEFAULT_TASK_SORT_OPTION
          )
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        throw new Error(message);
      } finally {
        setUpdatingPriorities((prev) => {
          if (!prev.has(id)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [setError, setTasks]
  );

  return {
    updatingPriorities,
    handleTogglePriority,
  };
};
