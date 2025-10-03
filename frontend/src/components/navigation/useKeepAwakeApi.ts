import { useEffect, useState, useCallback, useRef } from "react";

interface WakeLockSentinel extends EventTarget {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
  removeEventListener(type: "release", listener: () => void): void;
}

const useKeepAwakeApi = () => {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const shouldRestoreRef = useRef(false);

  const handleRelease = useCallback(() => {
    console.log("Wake Lock was released");
    wakeLockRef.current = null;
    setIsActive(false);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      console.warn("Wake Lock API not supported");
      return;
    }
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      setIsActive(true);
      shouldRestoreRef.current = true;
      sentinel.addEventListener("release", handleRelease);
      console.log("Wake Lock is active!");
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
    }
  }, [handleRelease]);

  const releaseWakeLockInternal = useCallback(
    async (reason: "manual" | "cleanup" = "manual") => {
      const sentinel = wakeLockRef.current;
      if (!sentinel) {
        return;
      }
      shouldRestoreRef.current = false;
      sentinel.removeEventListener("release", handleRelease);
      await sentinel.release();
      wakeLockRef.current = null;
      setIsActive(false);
      if (reason === "manual") {
        console.log("Wake Lock manually released");
      }
    },
    [handleRelease]
  );

  const releaseWakeLock = useCallback(() => {
    return releaseWakeLockInternal("manual");
  }, [releaseWakeLockInternal]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        shouldRestoreRef.current &&
        !wakeLockRef.current
      ) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [requestWakeLock]);

  useEffect(() => {
    return () => {
      void releaseWakeLockInternal("cleanup");
    };
  }, [releaseWakeLockInternal]);

  return {
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
};

export default useKeepAwakeApi;
