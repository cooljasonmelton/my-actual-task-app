export interface ReorderComputationParams<TItem, TGroup> {
  items: TItem[];
  groupId: TGroup;
  sourceId: number;
  targetId: number | null;
  getItemId: (item: TItem) => number;
  getItemGroupId: (item: TItem) => TGroup;
  isItemEligible?: (item: TItem) => boolean;
}

export interface ReorderComputationResult {
  orderedIds: number[];
  changed: boolean;
}

export const computeReorderedIds = <TItem, TGroup>({
  items,
  groupId,
  sourceId,
  targetId,
  getItemId,
  getItemGroupId,
  isItemEligible,
}: ReorderComputationParams<TItem, TGroup>): ReorderComputationResult => {
  const eligibleItems = items.filter((item) => {
    if (getItemGroupId(item) !== groupId) {
      return false;
    }
    return isItemEligible ? isItemEligible(item) : true;
  });

  if (eligibleItems.length <= 1) {
    return {
      orderedIds: eligibleItems.map(getItemId),
      changed: false,
    };
  }

  const originalIds = eligibleItems.map(getItemId);
  const sourceIndex = originalIds.indexOf(sourceId);

  if (sourceIndex === -1) {
    return {
      orderedIds: originalIds,
      changed: false,
    };
  }

  const reorderedIds = originalIds.slice();
  reorderedIds.splice(sourceIndex, 1);

  let insertionIndex = reorderedIds.length;
  if (targetId !== null) {
    const targetIndex = reorderedIds.indexOf(targetId);
    insertionIndex = targetIndex >= 0 ? targetIndex : reorderedIds.length;
  }

  reorderedIds.splice(insertionIndex, 0, sourceId);

  const changed =
    reorderedIds.length === originalIds.length &&
    reorderedIds.some((id, index) => id !== originalIds[index]);

  return {
    orderedIds: changed ? reorderedIds : originalIds,
    changed,
  };
};

export const createSortIndexMap = (
  orderedIds: number[],
  step: number
): Map<number, number> => {
  const map = new Map<number, number>();
  orderedIds.forEach((id, index) => {
    map.set(id, (index + 1) * step);
  });
  return map;
};
