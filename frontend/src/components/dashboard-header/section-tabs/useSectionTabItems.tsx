import { STATUS_SECTION_TAB_ITEMS } from "@/constants";
import SectionTab from "./SectionTab";
import type { Status } from "@/types";
import type { DragEvent } from "react";

type SectionTabItemOptions = {
  isDragActive: boolean;
  dragOverStatus: Status | null;
  onStatusDragOver?: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDragLeave?: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDrop?: (event: DragEvent<HTMLElement>, status: Status) => void;
};

export const useSectionTabItems = (
  counts: Record<Status, number>,
  {
    isDragActive,
    dragOverStatus,
    onStatusDragOver,
    onStatusDragLeave,
    onStatusDrop,
  }: SectionTabItemOptions
) => {
  return STATUS_SECTION_TAB_ITEMS.map((item) => {
    const status = item.value;
    const isDropTarget = dragOverStatus === status;
    const count = counts[status] ?? 0;
    const showCount = status !== "finished";

    const handleDragOver =
      onStatusDragOver &&
      ((event: DragEvent<HTMLElement>) => onStatusDragOver(event, status));
    const handleDragLeave =
      onStatusDragLeave &&
      ((event: DragEvent<HTMLElement>) => onStatusDragLeave(event, status));
    const handleDrop =
      onStatusDrop &&
      ((event: DragEvent<HTMLElement>) => onStatusDrop(event, status));

    return {
      cta: (
        <SectionTab
          text={item.cta}
          count={count}
          isDropTarget={isDropTarget}
          isDragActive={isDragActive}
          showCount={showCount}
        />
      ),
      value: status,
      className:
        isDragActive && isDropTarget ? "radio-btn--drop-target" : undefined,
      onDragOver: handleDragOver,
      onDragEnter: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    };
  });
};
