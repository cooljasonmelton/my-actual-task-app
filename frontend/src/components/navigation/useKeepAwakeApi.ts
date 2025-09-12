import { useEffect, useState, useCallback } from "react";

interface WakeLockSentinel extends EventTarget {
  released: boolean;
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
  removeEventListener(type: "release", listener: () => void): void;
}

const useKeepAwakeApi = () => {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      console.warn("Wake Lock API not supported");
      return;
    }
    try {
      // Some TS versions don’t have navigator.wakeLock in lib.dom.d.ts
      const sentinel = await navigator.wakeLock.request("screen");
      setWakeLock(sentinel);
      setIsActive(true);

      sentinel.addEventListener("release", () => {
        console.log("Wake Lock was released");
        setIsActive(false);
        setWakeLock(null);
      });

      console.log("Wake Lock is active!");
    } catch (err) {
      console.error("Failed to acquire wake lock:", err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsActive(false);
      console.log("Wake Lock manually released");
    }
  }, [wakeLock]);

  // re-request lock if tab comes back into focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !wakeLock) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseWakeLock();
    };
  }, [wakeLock, requestWakeLock, releaseWakeLock]);

  return {
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
};

export default useKeepAwakeApi;
