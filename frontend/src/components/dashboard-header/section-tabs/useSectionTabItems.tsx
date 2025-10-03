import { STATUS_SECTION_TAB_ITEMS } from "../../../constants";
import SectionTab from "./SectionTab";
import type { Status } from "../../../types";

export const useSectionTabItems = (
  counts: Record<Status, number>
) => {
  const sectionTabItems = STATUS_SECTION_TAB_ITEMS.map((item) => ({
    cta: <SectionTab text={item.cta} count={counts[item.value] ?? 0} />,
    value: item.value,
  }));

  return sectionTabItems;
};
