import { useCallback, useEffect, useState } from "react";
import type { TaskType } from "@/types";

export const useExpandedTasks = (tasks: TaskType[]) => {
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(
    () => new Set()
  );

  useEffect(() => {
    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    setExpandedTaskIds((previous) => {
      let hasChanges = false;
      const next = new Set<number>();
      previous.forEach((id) => {
        const task = taskMap.get(id);
        if (!task || task.deletedAt) {
          hasChanges = true;
          return;
        }

        next.add(id);
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
