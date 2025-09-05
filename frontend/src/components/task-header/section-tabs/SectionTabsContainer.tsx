import RadioButtonGroup from "../../design-system-components/radio-button-group/RadioButtonGroup";
import { DEFAULT_SECTION_TAB_ITEM } from "../../../constants";
import "./SectionTabsContainer.css";
import { useState } from "react";
import { useSectionTabItems } from "./useSectionTabItems";

// TODO: fix styling so tabs stretch across container
// TODO: figure out logic to list number of tasks for each section

const SectionTabsContainer = () => {
  const [selectedTab, setSelectedTab] = useState(DEFAULT_SECTION_TAB_ITEM);
  console.log("selectedTab", selectedTab);

  const sectionTabItems = useSectionTabItems();

  return (
    <div className="section-tabs-container">
      <RadioButtonGroup
        buttonName="status-section-tab"
        legendText="select task status view"
        radioButtonItems={sectionTabItems}
        defaultValue={DEFAULT_SECTION_TAB_ITEM}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedTab(e.target.value)
        }
      />
    </div>
  );
};

export default SectionTabsContainer;
