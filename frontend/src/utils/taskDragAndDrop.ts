import { useCallback, useEffect, useState, type DragEvent } from "react";
import { sortTasks } from "./taskSorting";
import type { Status, TaskType } from "../types";
import type { TaskSortOption } from "./taskSorting";

export const TASK_REORDER_STEP = 10;

export type ReorderComputation = {
  updatedTasks: TaskType[];
  orderedIds: number[];
  changed: boolean;
};

const computeReorderedTasks = (
  tasks: TaskType[],
  status: Status,
  sourceId: number,
  targetId: number | null,
  taskReorderStep: number = TASK_REORDER_STEP
): ReorderComputation => {
  if (status === "finished") {
    return { updatedTasks: tasks, orderedIds: [], changed: false };
  }

  const statusTasks = tasks.filter(
    (task) => task.status === status && !task.deletedAt
  );

  if (statusTasks.length <= 1) {
    return {
      updatedTasks: tasks,
      orderedIds: statusTasks.map((task) => task.id),
      changed: false,
    };
  }

  const originalIds = statusTasks.map((task) => task.id);
  const sourceIndex = originalIds.indexOf(sourceId);

  if (sourceIndex === -1) {
    return { updatedTasks: tasks, orderedIds: originalIds, changed: false };
  }

  const reorderedIds = originalIds.slice();
  reorderedIds.splice(sourceIndex, 1);

  const targetIndex =
    targetId === null ? reorderedIds.length : reorderedIds.indexOf(targetId);
  const insertionIndex = targetIndex < 0 ? reorderedIds.length : targetIndex;
  reorderedIds.splice(insertionIndex, 0, sourceId);

  const changed =
    reorderedIds.length === originalIds.length &&
    reorderedIds.some((id, index) => id !== originalIds[index]);

  if (!changed) {
    return { updatedTasks: tasks, orderedIds: originalIds, changed: false };
  }

  const sortIndexMap = new Map<number, number>();
  reorderedIds.forEach((id, index) => {
    sortIndexMap.set(id, (index + 1) * taskReorderStep);
  });

  const updatedTasks = tasks.map((task) => {
    if (task.status === status && sortIndexMap.has(task.id)) {
      return {
        ...task,
        sortIndex: sortIndexMap.get(task.id)!,
      };
    }
    return task;
  });

  return { updatedTasks, orderedIds: reorderedIds, changed: true };
};

type DraggingTask = { id: number; status: Status } | null;

export interface UseTaskDragAndDropOptions {
  sortOption: TaskSortOption;
  selectedStatus: Status;
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  persistReorder: (status: Status, orderedTaskIds: number[]) => Promise<void>;
  taskReorderStep?: number;
}

export interface UseTaskDragAndDropResult {
  draggingTask: DraggingTask;
  dragOverTaskId: number | null;
  handleDragStart: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragEnter: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragLeave: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleDragEnd: () => void;
  handleDropOnTask: (event: DragEvent<HTMLDivElement>, task: TaskType) => void;
  handleContainerDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDropOnContainer: (event: DragEvent<HTMLDivElement>) => void;
}

export const useTaskDragAndDrop = ({
  sortOption,
  selectedStatus,
  setTasks,
  persistReorder,
  taskReorderStep = TASK_REORDER_STEP,
}: UseTaskDragAndDropOptions): UseTaskDragAndDropResult => {
  const [draggingTask, setDraggingTask] = useState<DraggingTask>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);

  const applyReorder = useCallback<
    (status: Status, sourceId: number, targetId: number | null) => number[] | null
  >((status, sourceId, targetId) => {
      let updatedOrder: number[] | null = null;
      let didChange = false;

      setTasks((previousTasks) => {
        const result = computeReorderedTasks(
          previousTasks,
          status,
          sourceId,
          targetId,
          taskReorderStep
        );
        const { updatedTasks, orderedIds, changed } = result;

        if (!changed) {
          return previousTasks;
        }

        updatedOrder = orderedIds;
        didChange = true;
        return sortTasks(updatedTasks, sortOption);
      });

      if (didChange && updatedOrder) {
        return updatedOrder;
      }

      return null;
    },
    [setTasks, sortOption, taskReorderStep]
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (task.status === "finished" || task.deletedAt) {
        return;
      }

      setDraggingTask({ id: task.id, status: task.status });
      setDragOverTaskId(null);

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
      }
    },
    []
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      event.preventDefault();

      if (!draggingTask || draggingTask.id === task.id) {
        return;
      }

      if (draggingTask.status !== task.status) {
        setDragOverTaskId(null);
        return;
      }

      setDragOverTaskId(task.id);
    },
    [draggingTask]
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (!draggingTask) {
        return;
      }

      if (draggingTask.status !== task.status) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }

      if (dragOverTaskId !== task.id) {
        setDragOverTaskId(task.id);
      }
    },
    [dragOverTaskId, draggingTask]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>, task: TaskType) => {
      if (!draggingTask) {
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      if (dragOverTaskId === task.id) {
        setDragOverTaskId(null);
      }
    },
    [dragOverTaskId, draggingTask]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingTask(null);
    setDragOverTaskId(null);
  }, []);

  const handleDropOnTask = useCallback(
    (event: DragEvent<HTMLDivElement>, targetTask: TaskType) => {
      event.preventDefault();
      event.stopPropagation();

      if (!draggingTask || draggingTask.id === targetTask.id) {
        handleDragEnd();
        return;
      }

      if (draggingTask.status !== targetTask.status) {
        handleDragEnd();
        return;
      }

      const reorderedIds = applyReorder(
        targetTask.status,
        draggingTask.id,
        targetTask.id
      );

      handleDragEnd();

      if (reorderedIds && reorderedIds.length > 0) {
        void persistReorder(targetTask.status, reorderedIds);
      }
    },
    [applyReorder, draggingTask, handleDragEnd, persistReorder]
  );

  const handleContainerDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!draggingTask || draggingTask.status !== selectedStatus) {
        return;
      }

      event.preventDefault();
    },
    [draggingTask, selectedStatus]
  );

  const handleDropOnContainer = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!draggingTask || draggingTask.status !== selectedStatus) {
        handleDragEnd();
        return;
      }

      const reorderedIds = applyReorder(selectedStatus, draggingTask.id, null);

      handleDragEnd();

      if (reorderedIds && reorderedIds.length > 0) {
        void persistReorder(selectedStatus, reorderedIds);
      }
    },
    [applyReorder, draggingTask, handleDragEnd, persistReorder, selectedStatus]
  );

  useEffect(() => {
    setDragOverTaskId(null);
    setDraggingTask(null);
  }, [selectedStatus]);

  return {
    draggingTask,
    dragOverTaskId,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropOnTask,
    handleContainerDragOver,
    handleDropOnContainer,
  };
};

export { computeReorderedTasks };
