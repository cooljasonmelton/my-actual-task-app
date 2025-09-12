import { useCallback, useEffect, useRef, useState } from "react";

export type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface UseFetchOptions<B = unknown> {
  method?: FetchMethod;
  headers?: Record<string, string>;
  body?: B;
  /**
   * If true, the hook will not automatically run the fetch on mount.
   * Call `execute()` manually.
   */
  manual?: boolean;
  /**
   * If true (default), attempt to parse response as JSON.
   * If false, returns the raw Response.
   */
  parseJson?: boolean;
  /**
   * Additional fetch options passed through (e.g. credentials, mode).
   */
  fetchOptions?: Omit<RequestInit, "method" | "headers" | "body" | "signal">;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (override?: {
    url?: string;
    body?: unknown;
    method?: FetchMethod;
  }) => Promise<T>;
  cancel: () => void;
}

/**
 * useFetch - generic data-fetching hook
 * - T = expected response shape
 * - B = request body shape
 */
export default function useFetch<T = unknown, B = unknown>(
  url: string | null,
  {
    method = "GET",
    headers,
    body,
    manual = false,
    parseJson = true,
    fetchOptions = {},
  }: UseFetchOptions<B> = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!manual && !!url);
  const [error, setError] = useState<Error | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (override?: { url?: string; body?: unknown; method?: FetchMethod }) => {
      const finalUrl = override?.url ?? url;
      if (!finalUrl) {
        throw new Error("useFetch: url is required to execute fetch");
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const init: RequestInit = {
          method: override?.method ?? method,
          headers,
          signal: controller.signal,
          ...fetchOptions,
        };

        const effectiveBody = override?.body ?? body;
        if (effectiveBody != null && (init.method ?? "GET") !== "GET") {
          init.body =
            typeof effectiveBody === "string"
              ? effectiveBody
              : JSON.stringify(effectiveBody);
          init.headers = {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
          };
        }

        const res = await fetch(finalUrl, init);

        if (!res.ok) {
          const message = `Request failed with status ${res.status}`;
          const err = new Error(message);
          (err as Error & { status: number }).status = res.status;
          throw err;
        }

        if (!parseJson) {
          return res as unknown as T;
        }

        const parsed = (await res.json()) as T;

        if (mountedRef.current) {
          setData(parsed);
        }

        return parsed;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw err; // aborted, let caller handle if needed
        }
        const e = err instanceof Error ? err : new Error("Unknown error");
        if (mountedRef.current) {
          setError(e);
        }
        throw e;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [url, method, headers, body, parseJson, fetchOptions]
  );

  useEffect(() => {
    if (!manual && url) {
      execute().catch(() => {
        /* errors already in state */
      });
    }
  }, [manual, url, execute]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { data, loading, error, execute, cancel };
}
