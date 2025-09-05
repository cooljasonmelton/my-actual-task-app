import { STATUS_SECTION_TAB_ITEMS } from "../../../constants";
import SectionTab from "./SectionTab";

// TODO: get correct counts
export const useSectionTabItems = () => {
  const countsMap = {
    next: 0,
    ongoing: 0,
    backburner: 0,
    finished: 0,
  };

  const sectionTabItems = STATUS_SECTION_TAB_ITEMS.map((item) => ({
    cta: <SectionTab text={item.cta} count={countsMap[item.value]} />,
    value: item.value,
  }));

  return sectionTabItems;
};
