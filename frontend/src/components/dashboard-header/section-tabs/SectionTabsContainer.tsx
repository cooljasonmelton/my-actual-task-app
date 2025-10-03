import RadioButtonGroup from "../../design-system-components/radio-button-group/RadioButtonGroup";
import { DEFAULT_SECTION_TAB_ITEM } from "../../../constants";
import { useSectionTabItems } from "./useSectionTabItems";
import "./SectionTabsContainer.css";
import type { Status } from "../../../types";

// TODO: fix styling so tabs stretch across container
// TODO: figure out logic to list number of tasks for each section

const SectionTabsContainer = ({
  selectedStatus,
  onChange,
  counts,
}: {
  selectedStatus: Status;
  onChange: (value: Status) => void;
  counts: Record<Status, number>;
}) => {
  const sectionTabItems = useSectionTabItems(counts);

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
