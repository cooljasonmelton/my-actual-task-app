import RadioButtonGroup from "../../design-system-components/radio-button-group/RadioButtonGroup";
import { DEFAULT_SECTION_TAB_ITEM } from "@/constants";
import { useSectionTabItems } from "./useSectionTabItems";
import "./SectionTabsContainer.css";
import type { Status } from "@/types";
import type { DragEvent } from "react";

const SectionTabsContainer = ({
  selectedStatus,
  onChange,
  counts,
  isDragActive,
  dragOverStatus,
  onStatusDragOver,
  onStatusDragLeave,
  onStatusDrop,
}: {
  selectedStatus: Status;
  onChange: (value: Status) => void;
  counts: Record<Status, number>;
  isDragActive: boolean;
  dragOverStatus: Status | null;
  onStatusDragOver: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDragLeave: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDrop: (event: DragEvent<HTMLElement>, status: Status) => void;
}) => {
  const sectionTabItems = useSectionTabItems(counts, {
    isDragActive,
    dragOverStatus,
    onStatusDragOver,
    onStatusDragLeave,
    onStatusDrop,
  });

  return (
    <div className="card">
      <RadioButtonGroup
        buttonName="status-section-tab-button"
        legendText="select task status view"
        radioButtonItems={sectionTabItems}
        defaultValue={DEFAULT_SECTION_TAB_ITEM}
        value={selectedStatus}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value as Status)
        }
      />
    </div>
  );
};

export default SectionTabsContainer;
