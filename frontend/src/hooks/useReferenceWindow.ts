import { useCallback, useMemo } from "react";

const REFERENCE_WINDOW_OFFSET_HOURS = 4;
const REFERENCE_WINDOW_OFFSET_MS =
  REFERENCE_WINDOW_OFFSET_HOURS * 60 * 60 * 1000;

const SERIALIZED_DATE_TIME_REGEX = /[Tt]|Z$|[+-]\d{2}:?\d{2}$/;

const getReferenceWindowStart = (date: Date) => {
  const shifted = new Date(date.getTime() - REFERENCE_WINDOW_OFFSET_MS);
  shifted.setHours(0, 0, 0, 0);
  return new Date(shifted.getTime() + REFERENCE_WINDOW_OFFSET_MS);
};

export const areDatesInSameReferenceWindow = (dateA: Date, dateB: Date) =>
  getReferenceWindowStart(dateA).getTime() ===
  getReferenceWindowStart(dateB).getTime();

export const parseReferenceWindowDate = (value: string | Date): Date => {
  if (value instanceof Date) {
    return value;
  }

  const normalized = SERIALIZED_DATE_TIME_REGEX.test(value)
    ? value
    : `${value.replace(" ", "T")}Z`;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
};

const defaultNow = () => new Date();

export const useReferenceWindow = (now: Date = defaultNow()) => {
  const referenceWindowStart = useMemo(
    () => getReferenceWindowStart(now),
    [now.getTime()]
  );
  const referenceWindowStartMs = referenceWindowStart.getTime();

  const isInCurrentReferenceWindow = useCallback(
    (date: Date) => areDatesInSameReferenceWindow(date, referenceWindowStart),
    [referenceWindowStartMs]
  );

  return { referenceWindowStart, isInCurrentReferenceWindow };
};

export const REFERENCE_WINDOW_INTERNALS = {
  getReferenceWindowStart,
};
