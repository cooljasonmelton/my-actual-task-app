const COMPLETION_STORAGE_KEY = "task-completion-rewards";

export type RewardStorage = {
  count: number;
  windowStart: string;
  achievedMilestones: number[];
};

export const createDefaultStorage = (windowStart: Date): RewardStorage => ({
  count: 0,
  windowStart: windowStart.toISOString(),
  achievedMilestones: [],
});

export const loadStoredRewards = (windowStart: Date): RewardStorage => {
  if (typeof window === "undefined") {
    return createDefaultStorage(windowStart);
  }

  try {
    const raw = window.localStorage.getItem(COMPLETION_STORAGE_KEY);
    if (!raw) {
      return createDefaultStorage(windowStart);
    }

    const parsed = JSON.parse(raw) as RewardStorage;
    if (!parsed?.windowStart) {
      return createDefaultStorage(windowStart);
    }

    const isSameWindow = parsed.windowStart === windowStart.toISOString();
    return isSameWindow ? parsed : createDefaultStorage(windowStart);
  } catch {
    return createDefaultStorage(windowStart);
  }
};

export const persistRewards = (storage: RewardStorage) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      COMPLETION_STORAGE_KEY,
      JSON.stringify(storage)
    );
  } catch {
    // ignore storage failures
  }
};
