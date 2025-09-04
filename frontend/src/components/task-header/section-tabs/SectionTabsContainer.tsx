import RadioButtonGroup from "../../design-system-components/radio-button-group/RadioButtonGroup";
import {
  DEFAULT_SECTION_TAB_ITEM,
  STATUS_SECTION_TAB_ITEMS,
} from "../../../constants";
import "./SectionTabsContainer.css";
import { useState } from "react";

const SectionTabsContainer = () => {
  const [selectedTab, setSelectedTab] = useState(DEFAULT_SECTION_TAB_ITEM);
  console.log("selectedTab", selectedTab);
  return (
    <div className="section-tabs-container">
      <RadioButtonGroup
        buttonName="status-section-tab"
        legendText="select task status view"
        radioButtonItems={STATUS_SECTION_TAB_ITEMS}
        defaultValue={DEFAULT_SECTION_TAB_ITEM}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedTab(e.target.value)
        }
      />
    </div>
  );
};

export default SectionTabsContainer;
