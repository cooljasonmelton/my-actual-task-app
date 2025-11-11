import { useCallback, useState } from "react";
import type { DragEvent } from "react";
import type { DraggingEntity } from "./types";
import type {
  UseReorderableDragAndDropOptions,
  UseReorderableDragAndDropResult,
} from "./useReorderableDragAndDrop.types";

export const useReorderableDragAndDrop = <
  TItem,
  TGroup
>({
  getItemId,
  getItemGroupId,
  isItemDraggable,
  applyReorder,
  persistReorder,
}: UseReorderableDragAndDropOptions<TItem, TGroup>): UseReorderableDragAndDropResult<
  TItem,
  TGroup
> => {
  const [draggingItem, setDraggingItem] = useState<DraggingEntity<TGroup>>(null);
  const [dragOverItemId, setDragOverItemId] = useState<number | null>(null);

  const resetDragState = useCallback(() => {
    setDraggingItem(null);
    setDragOverItemId(null);
  }, []);

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLElement>, item: TItem) => {
      if (isItemDraggable && !isItemDraggable(item)) {
        return;
      }

      const itemId = getItemId(item);
      const groupId = getItemGroupId(item);

      setDraggingItem({ id: itemId, groupId });
      setDragOverItemId(null);

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(itemId));
      }
    },
    [getItemGroupId, getItemId, isItemDraggable]
  );

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLElement>, item: TItem) => {
      event.preventDefault();

      if (!draggingItem) {
        return;
      }

      const targetId = getItemId(item);
      const targetGroup = getItemGroupId(item);

      if (
        draggingItem.id === targetId ||
        draggingItem.groupId !== targetGroup
      ) {
        setDragOverItemId(null);
        return;
      }

      setDragOverItemId(targetId);
    },
    [draggingItem, getItemGroupId, getItemId]
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>, item: TItem) => {
      if (!draggingItem) {
        return;
      }

      const targetGroup = getItemGroupId(item);
      const targetId = getItemId(item);

      if (draggingItem.groupId !== targetGroup) {
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "none";
        }
        return;
      }

      event.preventDefault();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }

      if (dragOverItemId !== targetId) {
        setDragOverItemId(targetId);
      }
    },
    [dragOverItemId, draggingItem, getItemGroupId, getItemId]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent<HTMLElement>, item: TItem) => {
      if (!draggingItem) {
        return;
      }

      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      if (dragOverItemId === getItemId(item)) {
        setDragOverItemId(null);
      }
    },
    [dragOverItemId, draggingItem, getItemId]
  );

  const handleDrop = useCallback(
    (groupId: TGroup, targetId: number | null) => {
      if (!draggingItem) {
        resetDragState();
        return;
      }

      if (draggingItem.groupId !== groupId) {
        resetDragState();
        return;
      }

      const reorderedIds = applyReorder(groupId, draggingItem.id, targetId);

      resetDragState();

      if (reorderedIds && reorderedIds.length > 0) {
        void persistReorder(groupId, reorderedIds);
      }
    },
    [applyReorder, draggingItem, persistReorder, resetDragState]
  );

  const handleDropOnItem = useCallback(
    (event: DragEvent<HTMLElement>, item: TItem) => {
      event.preventDefault();
      event.stopPropagation();

      handleDrop(getItemGroupId(item), getItemId(item));
    },
    [getItemGroupId, getItemId, handleDrop]
  );

  const handleContainerDragOver = useCallback(
    (event: DragEvent<HTMLElement>, groupId: TGroup) => {
      if (!draggingItem || draggingItem.groupId !== groupId) {
        return;
      }

      event.preventDefault();
    },
    [draggingItem]
  );

  const handleContainerDrop = useCallback(
    (event: DragEvent<HTMLElement>, groupId: TGroup) => {
      event.preventDefault();
      handleDrop(groupId, null);
    },
    [handleDrop]
  );

  const handleDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  return {
    draggingItem,
    dragOverItemId,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDropOnItem,
    handleContainerDragOver,
    handleContainerDrop,
    handleDragEnd,
  };
};

export type {
  UseReorderableDragAndDropOptions,
  UseReorderableDragAndDropResult,
  ReorderableDragHandlers,
} from "./useReorderableDragAndDrop.types";
