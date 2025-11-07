import { useCallback, useState } from "react";
import { NOTES_API_URL } from "@/config/api";
import type { Note } from "../types";

type RawNotePayload = {
  id?: unknown;
  userId?: unknown;
  content?: unknown;
  updatedAt?: unknown;
};

const toNumberOrZero = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const normalizeTimestampString = (raw: string): string => {
  const trimmed = raw.trim();

  if (/^\d{4}-\d{2}-\d{2}T[^Z]+Z$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
    return trimmed.replace(" ", "T");
  }

  return trimmed;
};

const toDateOrNow = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = normalizeTimestampString(value);
    const timestamp = Date.parse(normalized);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value);
  }

  return new Date();
};

const parseNote = (payload: unknown): Note => {
  if (!payload || typeof payload !== "object") {
    return {
      id: 0,
      userId: 0,
      content: "",
      updatedAt: new Date(),
    };
  }

  const raw = payload as RawNotePayload;
  return {
    id: toNumberOrZero(raw.id),
    userId: toNumberOrZero(raw.userId),
    content: typeof raw.content === "string" ? raw.content : "",
    updatedAt: toDateOrNow(raw.updatedAt),
  };
};

export const useScratchNote = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(NOTES_API_URL);

      if (!response.ok) {
        throw new Error("Failed to load scratch note");
      }

      const data = await response.json();
      const parsed = parseNote(data);
      setNote(parsed);
      setError(null);
      return parsed;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load scratch note";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNote = useCallback(async (content: string) => {
    try {
      const response = await fetch(NOTES_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save scratch note");
      }

      const data = await response.json();
      const updated = parseNote(data);
      setNote(updated);
      setError(null);
      return updated;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save scratch note";
      setError(message);
      throw err;
    }
  }, []);

  return {
    note,
    isLoading,
    error,
    setError,
    setNote,
    loadNote,
    saveNote,
  };
};
