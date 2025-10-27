import type { Dispatch, SetStateAction } from "react";
import type { Status } from "../../../types";
import type { DraggingTask } from "./taskDragReorder";

export type ApplyReorder = (
  status: Status,
  sourceId: number,
  targetId: number | null
) => number[] | null;

export type PersistReorder = (
  status: Status,
  orderedTaskIds: number[]
) => Promise<void>;

export type PersistStatusChange = (taskId: number, status: Status) => Promise<void>;

export interface TaskDragHandlerParams {
  draggingTask: DraggingTask;
  dragOverTaskId: number | null;
  dragOverStatus: Status | null;
  setDraggingTask: Dispatch<SetStateAction<DraggingTask>>;
  setDragOverTaskId: Dispatch<SetStateAction<number | null>>;
  setDragOverStatus: Dispatch<SetStateAction<Status | null>>;
  applyReorder: ApplyReorder;
  handleDragEnd: () => void;
  persistReorder: PersistReorder;
  persistStatusChange: PersistStatusChange;
  selectedStatus: Status;
}
