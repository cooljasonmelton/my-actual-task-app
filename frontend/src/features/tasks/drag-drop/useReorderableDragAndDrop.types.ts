import type { DragEvent } from "react";
import type { DraggingEntity } from "./types";

export interface UseReorderableDragAndDropOptions<TItem, TGroup> {
  getItemId: (item: TItem) => number;
  getItemGroupId: (item: TItem) => TGroup;
  isItemDraggable?: (item: TItem) => boolean;
  applyReorder: (
    groupId: TGroup,
    sourceId: number,
    targetId: number | null
  ) => number[] | null;
  persistReorder: (groupId: TGroup, orderedIds: number[]) => Promise<void>;
}

export interface ReorderableDragHandlers<TItem, TGroup> {
  handleDragStart: (event: DragEvent<HTMLElement>, item: TItem) => void;
  handleDragEnter: (event: DragEvent<HTMLElement>, item: TItem) => void;
  handleDragOver: (event: DragEvent<HTMLElement>, item: TItem) => void;
  handleDragLeave: (event: DragEvent<HTMLElement>, item: TItem) => void;
  handleDropOnItem: (event: DragEvent<HTMLElement>, item: TItem) => void;
  handleContainerDragOver: (
    event: DragEvent<HTMLElement>,
    groupId: TGroup
  ) => void;
  handleContainerDrop: (event: DragEvent<HTMLElement>, groupId: TGroup) => void;
  handleDragEnd: () => void;
}

export interface UseReorderableDragAndDropResult<TItem, TGroup>
  extends ReorderableDragHandlers<TItem, TGroup> {
  draggingItem: DraggingEntity<TGroup>;
  dragOverItemId: number | null;
}
