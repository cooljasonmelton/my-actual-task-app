import { useCallback, useEffect, useRef, useState } from "react";

type UseCopyToClipboardOptions = {
  feedbackDuration?: number;
};

const useCopyToClipboard = ({
  feedbackDuration = 400,
}: UseCopyToClipboardOptions = {}) => {
  const [isCopying, setIsCopying] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearFeedback = useCallback(() => {
    if (timeoutRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
    setIsCopying(false);
  }, []);

  const startFeedback = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsCopying(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsCopying(false);
      timeoutRef.current = null;
    }, feedbackDuration);
  }, [feedbackDuration]);

  useEffect(() => clearFeedback, [clearFeedback]);

  const copyText = useCallback(
    async (text: string | null | undefined) => {
      if (!text) {
        return false;
      }

      if (typeof navigator === "undefined" || !navigator.clipboard) {
        console.warn("Clipboard API is not available");
        return false;
      }

      startFeedback();

      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error("Failed to copy text", error);
        clearFeedback();
        return false;
      }
    },
    [clearFeedback, startFeedback]
  );

  return {
    isCopying,
    copyText,
  };
};

export default useCopyToClipboard;
