import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CAT_API_KEY,
  CAT_IMAGES_URL,
  CAT_TAGGED_IMAGES_URL,
  CAT_ASSET_BASE_URL,
} from "@/config/api";
import { useReferenceWindow } from "./useReferenceWindow";
import {
  createDefaultStorage,
  loadStoredRewards,
  persistRewards,
  type RewardStorage,
} from "./taskCompletionRewardsStorage";

const COMPLETION_MILESTONES = [3, 5, 7, 10, 15, 20, 25, 30];
const COMPLETION_SCROLL_TARGET = "[data-completion-progress]";

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

    // Try to grab an orange-tagged gif before falling back to the generic API.
    const fetchOrangeTaggedGif = async (): Promise<string | null> => {
      try {
        const response = await fetch(
          `${CAT_TAGGED_IMAGES_URL}/orange?type=gif&json=true`
        );

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as { url?: string };
        const relativeUrl = data?.url;

        if (!relativeUrl) {
          return null;
        }

        return relativeUrl.startsWith("http")
          ? relativeUrl
          : `${CAT_ASSET_BASE_URL}${relativeUrl}`;
      } catch {
        return null;
      }
    };

    try {
      const orangeCatGifUrl = await fetchOrangeTaggedGif();
      if (orangeCatGifUrl) {
        setCatGifUrl(orangeCatGifUrl);
        return;
      }

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

  const scrollCompletionIntoView = useCallback(() => {
    if (typeof window === "undefined" || !("document" in window)) {
      return;
    }

    const target = window.document.querySelector(COMPLETION_SCROLL_TARGET);
    if (target && "scrollIntoView" in target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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
      scrollCompletionIntoView();
      await fetchCatGif();
    }
  }, [
    fetchCatGif,
    referenceWindowKey,
    referenceWindowStart,
    scrollCompletionIntoView,
  ]);

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
