import type { TaskDragHandlerParams } from "./taskDragHandlerTypes";
import {
  useTaskItemDragHandlers,
  type TaskItemDragHandlers,
} from "./taskItemDragHandlers";
import {
  useTaskStatusDragHandlers,
  type TaskStatusDragHandlers,
} from "./taskStatusDragHandlers";

export type TaskDragHandlers = TaskItemDragHandlers & TaskStatusDragHandlers;

export const useTaskDragHandlers = (
  params: TaskDragHandlerParams
): TaskDragHandlers => {
  const itemHandlers = useTaskItemDragHandlers(params);
  const statusHandlers = useTaskStatusDragHandlers(params);

  return { ...itemHandlers, ...statusHandlers };
};
