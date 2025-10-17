import { useCallback, useEffect, useState } from "react";
import type { TaskType } from "../../types";

export const useExpandedTasks = (tasks: TaskType[]) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    const taskIds = new Set(tasks.map((task) => task.id));
    setExpandedTaskIds((previous) => {
      let hasChanges = false;
      const next = new Set<number>();
      previous.forEach((id) => {
        if (taskIds.has(id)) {
          next.add(id);
        } else {
          hasChanges = true;
        }
      });
      return hasChanges ? next : previous;
    });
  }, [tasks]);

  const handleToggleExpanded = useCallback((taskId: number) => {
    setExpandedTaskIds((previous) => {
      const next = new Set(previous);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  return {
    expandedTaskIds,
    handleToggleExpanded,
  };
};

export type UseExpandedTasksReturn = ReturnType<typeof useExpandedTasks>;
