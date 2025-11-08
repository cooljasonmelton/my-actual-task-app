import { useCallback, useEffect, useMemo, useState } from "react";
import { CAT_API_KEY, CAT_IMAGES_URL } from "@/config/api";
import { useReferenceWindow } from "./useReferenceWindow";

const COMPLETION_STORAGE_KEY = "task-completion-rewards";
const COMPLETION_MILESTONES = [3, 5, 7, 10];

type RewardStorage = {
  count: number;
  windowStart: string;
  achievedMilestones: number[];
};

const createDefaultStorage = (windowStart: Date): RewardStorage => ({
  count: 0,
  windowStart: windowStart.toISOString(),
  achievedMilestones: [],
});

const loadStoredRewards = (windowStart: Date): RewardStorage => {
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

const persistRewards = (storage: RewardStorage) => {
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

export const useTaskCompletionRewards = () => {
  const { referenceWindowStart } = useReferenceWindow();
  const referenceWindowKey = useMemo(
    () => referenceWindowStart.toISOString(),
    [referenceWindowStart]
  );

  const [rewardState, setRewardState] = useState<RewardStorage>(() =>
    loadStoredRewards(referenceWindowStart)
  );
  const [catGifUrl, setCatGifUrl] = useState<string | null>(null);
  const [isCatLoading, setIsCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    setRewardState((previous) => {
      if (previous.windowStart === referenceWindowKey) {
        return previous;
      }
      const next = loadStoredRewards(referenceWindowStart);
      return next;
    });
  }, [referenceWindowKey, referenceWindowStart]);

  const fetchCatGif = useCallback(async () => {
    setIsCatLoading(true);
    setCatError(null);

    try {
      const requestHeaders = CAT_API_KEY
        ? { "x-api-key": CAT_API_KEY }
        : undefined;
      const response = await fetch(
        `${CAT_IMAGES_URL}?mime_types=gif&size=full&limit=1`,
        requestHeaders ? { headers: requestHeaders } : undefined
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cat gif (${response.status})`);
      }

      const data = (await response.json()) as Array<{ url?: string }>;
      const nextUrl = data?.[0]?.url;

      if (!nextUrl) {
        throw new Error("No cat gif returned");
      }

      setCatGifUrl(nextUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load cat gif";
      setCatError(message);
    } finally {
      setIsCatLoading(false);
    }
  }, []);

  const registerTaskCompletion = useCallback(async () => {
    let triggeredMilestone: number | null = null;

    setRewardState((previous) => {
      const isSameWindow = previous.windowStart === referenceWindowKey;
      const baseState = isSameWindow
        ? previous
        : createDefaultStorage(referenceWindowStart);

      const nextCount = baseState.count + 1;
      const milestoneAchieved =
        COMPLETION_MILESTONES.includes(nextCount) &&
        !baseState.achievedMilestones.includes(nextCount);

      triggeredMilestone = milestoneAchieved ? nextCount : null;

      const nextState: RewardStorage = {
        windowStart: referenceWindowKey,
        count: nextCount,
        achievedMilestones: milestoneAchieved
          ? [...baseState.achievedMilestones, nextCount]
          : baseState.achievedMilestones,
      };

      persistRewards(nextState);
      return nextState;
    });

    if (triggeredMilestone) {
      await fetchCatGif();
    }
  }, [fetchCatGif, referenceWindowKey, referenceWindowStart]);

  const retryCatReward = useCallback(async () => {
    await fetchCatGif();
  }, [fetchCatGif]);

  return {
    completionCount: rewardState.count,
    registerTaskCompletion,
    catGifUrl,
    isCatLoading,
    catError,
    retryCatReward,
  };
};
