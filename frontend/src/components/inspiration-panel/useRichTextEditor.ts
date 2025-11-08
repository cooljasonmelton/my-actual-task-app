import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import type { Note } from "../../types";
import { applyAnchorAttributes, formatSavedTime } from "./utils";
import { createAutoSaveManager, type SaveOptions } from "./autoSaveManager";
import { createEditorCommands } from "./editorCommands";

interface UseRichTextEditorParams {
  note: Note | null;
  saveNote: (content: string) => Promise<Note>;
  onClose: () => void;
}

interface UseRichTextEditorResult {
  editorRef: RefObject<HTMLDivElement | null>;
  isDirty: boolean;
  isSaving: boolean;
  statusMessage: string;
  handleCommand: (command: string, value?: string) => void;
  handleCreateLink: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleInput: () => void;
  handleBlur: () => void;
  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  handlePaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  handleClose: () => void;
}

export const useRichTextEditor = ({
  note,
  saveNote,
  onClose,
}: UseRichTextEditorParams): UseRichTextEditorResult => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isDirtyRef = useRef(false);
  const latestHtmlRef = useRef<string>("");
  const isSavingRef = useRef(false);
  const queuedSaveRef = useRef<SaveOptions | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const ensureAnchorAttributes = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    applyAnchorAttributes(editor);
  }, []);

  const manager = useMemo(
    () =>
      createAutoSaveManager({
        editorRef,
        saveNote,
        ensureAnchorAttributes,
        isDirtyRef,
        setIsDirty,
        setIsSaving,
        setSaveError,
        setLastSavedAt: (date: Date) => setLastSavedAt(date),
        latestHtmlRef,
        isSavingRef,
        queuedSaveRef,
        saveTimeoutRef,
      }),
    [ensureAnchorAttributes, saveNote]
  );

  useEffect(() => () => manager.dispose(), [manager]);

  useEffect(() => {
    if (!note) {
      return;
    }

    latestHtmlRef.current = note.content;
    setLastSavedAt(note.updatedAt);

    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    if (document.activeElement === editor) {
      return;
    }

    if (editor.innerHTML !== note.content) {
      editor.innerHTML = note.content;
      ensureAnchorAttributes();
    }
  }, [note, ensureAnchorAttributes]);

  const { handleCommand, handleCreateLink, handleUndo, handleRedo } = useMemo(
    () =>
      createEditorCommands({
        editorRef,
        ensureAnchorAttributes,
        onInput: manager.handleInput,
      }),
    [ensureAnchorAttributes, manager]
  );

  const clearAutoSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  const handleBlur = useCallback(() => {
    clearAutoSaveTimeout();
    void manager.triggerSave({ linkify: true });
  }, [clearAutoSaveTimeout, manager]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        clearAutoSaveTimeout();
        void manager.triggerSave({ linkify: true, force: true });
      }
    },
    [clearAutoSaveTimeout, manager]
  );

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    []
  );

  const handleClose = useCallback(() => {
    clearAutoSaveTimeout();
    void manager.triggerSave({ linkify: true });
    onClose();
  }, [clearAutoSaveTimeout, manager, onClose]);

  const statusMessage = useMemo(() => {
    if (saveError) {
      return saveError;
    }

    if (isSaving) {
      return "Saving...";
    }

    return formatSavedTime(lastSavedAt);
  }, [isSaving, lastSavedAt, saveError]);

  return {
    editorRef,
    isDirty,
    isSaving,
    statusMessage,
    handleCommand,
    handleCreateLink,
    handleUndo,
    handleRedo,
    handleInput: manager.handleInput,
    handleBlur,
    handleKeyDown,
    handlePaste,
    handleClose,
  };
};
