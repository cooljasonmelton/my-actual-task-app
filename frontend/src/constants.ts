import type { StatusSectionTabItem } from "./types.ts";

export const STATUS_SECTION_TAB_ITEMS: StatusSectionTabItem[] = [
  {
    cta: "Dates",
    value: "dates",
  },
  {
    cta: "Next",
    value: "next",
  },
  {
    cta: "Ongoing",
    value: "ongoing",
  },
  {
    cta: "Get",
    value: "get",
  },
  {
    cta: "Watch",
    value: "watch",
  },
  {
    cta: "Backburner",
    value: "backburner",
  },
  {
    cta: "Finished",
    value: "finished",
  },
];
export const DEFAULT_SECTION_TAB_ITEM = "next";

export const STATUS_VALUES = STATUS_SECTION_TAB_ITEMS.map((item) => item.value);
