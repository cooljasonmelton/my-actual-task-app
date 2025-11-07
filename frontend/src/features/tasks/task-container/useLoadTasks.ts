import { useCallback, useRef } from "react";
import { TASKS_API_URL } from "./constants";
import { parseTaskFromApi } from "./utils/taskContainerUtils";
import { DEFAULT_TASK_SORT_OPTION, sortTasks } from "./utils/taskSorting";
import type { ApiTask } from "./types";
import { useTasksActions } from "./state/TasksContext";

export const useLoadTasks = () => {
  const { setError, setTasks, setIsLoading } = useTasksActions();
  const hasLoadedOnceRef = useRef(false);

  const loadTasks = useCallback(async () => {
    const shouldShowSpinner = !hasLoadedOnceRef.current;

    if (shouldShowSpinner) {
      setIsLoading(true);
    }

    try {
      setError(null);
      const response = await fetch(`${TASKS_API_URL}?includeDeleted=true`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedTasks = Array.isArray(data)
        ? (data as ApiTask[]).map(parseTaskFromApi)
        : [];
      setTasks(sortTasks(parsedTasks, DEFAULT_TASK_SORT_OPTION));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      hasLoadedOnceRef.current = true;

      if (shouldShowSpinner) {
        setIsLoading(false);
      }
    }
  }, [setError, setTasks, setIsLoading]);

  return {
    loadTasks,
  };
};
