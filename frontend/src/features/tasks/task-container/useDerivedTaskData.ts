import { useMemo } from "react";
import type { Status, TaskType } from "@/types";
import type { DerivedTask } from "./types";
import { STATUS_VALUES } from "@/constants";
import { createEmptyBuckets } from "./utils/taskContainerUtils";

type UseDerivedTaskDataParams = {
  tasks: TaskType[];
  selectedStatus: Status;
  isInCurrentReferenceWindow: (date: Date) => boolean;
};

export const useDerivedTaskData = ({
  tasks,
  selectedStatus,
  isInCurrentReferenceWindow,
}: UseDerivedTaskDataParams) => {
  const derivedTasks = useMemo<DerivedTask[]>(() => {
    return tasks.map((task) => {
      const deletedAt = task.deletedAt;
      const isSoftDeleted = Boolean(deletedAt);
      const isSoftDeletedToday = Boolean(
        deletedAt && isInCurrentReferenceWindow(deletedAt)
      );

      return {
        task,
        isSoftDeleted,
        isSoftDeletedToday,
      };
    });
  }, [tasks, isInCurrentReferenceWindow]);

  const statusBuckets = useMemo(() => {
    const buckets = createEmptyBuckets(STATUS_VALUES);

    derivedTasks.forEach((item) => {
      const { task, isSoftDeleted, isSoftDeletedToday } = item;

      if (isSoftDeleted && !isSoftDeletedToday) {
        buckets.finished.push(item);
      } else {
        buckets[task.status].push(item);
      }
    });

    return buckets;
  }, [derivedTasks]);

  const statusCounts = useMemo<Record<Status, number>>(() => {
    return STATUS_VALUES.reduce((acc, status) => {
      acc[status] = statusBuckets[status]?.length ?? 0;
      return acc;
    }, {} as Record<Status, number>);
  }, [statusBuckets]);

  return {
    derivedTasks,
    statusCounts,
    tasksForSelectedStatus: statusBuckets[selectedStatus] ?? [],
  };
};

export type UseDerivedTaskDataReturn = ReturnType<typeof useDerivedTaskData>;
