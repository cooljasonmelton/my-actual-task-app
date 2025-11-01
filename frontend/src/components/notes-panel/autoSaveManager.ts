import type { RefObject } from "react";
import type { Note } from "../../types";
import { autoLinkHtml } from "./utils";

export type SaveOptions = {
  linkify?: boolean;
  force?: boolean;
};

interface AutoSaveManagerDeps {
  editorRef: RefObject<HTMLDivElement | null>;
  saveNote: (content: string) => Promise<Note>;
  ensureAnchorAttributes: () => void;
  isDirtyRef: RefObject<boolean>;
  setIsDirty: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setSaveError: (value: string | null) => void;
  setLastSavedAt: (date: Date) => void;
  latestHtmlRef: RefObject<string>;
  isSavingRef: RefObject<boolean>;
  queuedSaveRef: RefObject<SaveOptions | null>;
  saveTimeoutRef: RefObject<number | null>;
}

interface AutoSaveManager {
  triggerSave: (options?: SaveOptions) => Promise<void>;
  scheduleAutoSave: () => void;
  handleInput: () => void;
  dispose: () => void;
}

export const createAutoSaveManager = ({
  editorRef,
  saveNote,
  ensureAnchorAttributes,
  isDirtyRef,
  setIsDirty,
  setIsSaving,
  setSaveError,
  setLastSavedAt,
  latestHtmlRef,
  isSavingRef,
  queuedSaveRef,
  saveTimeoutRef,
}: AutoSaveManagerDeps): AutoSaveManager => {
  const triggerSave = async ({
    linkify = false,
    force = false,
  }: SaveOptions = {}) => {
    if (isSavingRef.current) {
      queuedSaveRef.current = { linkify, force };
      return;
    }

    const editor = editorRef.current;
    const rawHtml = latestHtmlRef.current;
    const processedHtml =
      linkify && typeof window !== "undefined"
        ? autoLinkHtml(rawHtml)
        : rawHtml;

    const shouldPersist =
      force || isDirtyRef.current || processedHtml !== rawHtml;

    if (linkify && editor && processedHtml !== rawHtml) {
      editor.innerHTML = processedHtml;
      ensureAnchorAttributes();
    }

    latestHtmlRef.current = processedHtml;

    if (!shouldPersist) {
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      const saved = await saveNote(processedHtml);
      setLastSavedAt(saved.updatedAt);
      setIsDirty(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save note";
      setSaveError(message);
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;

      if (queuedSaveRef.current) {
        const nextSave = queuedSaveRef.current;
        queuedSaveRef.current = null;
        await triggerSave(nextSave);
      }
    }
  };

  const scheduleAutoSave = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void triggerSave();
    }, 1200);
  };

  const handleInput = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    latestHtmlRef.current = editor.innerHTML;
    setIsDirty(true);
    setSaveError(null);
    scheduleAutoSave();
  };

  const dispose = () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  return {
    triggerSave,
    scheduleAutoSave,
    handleInput,
    dispose,
  };
};
