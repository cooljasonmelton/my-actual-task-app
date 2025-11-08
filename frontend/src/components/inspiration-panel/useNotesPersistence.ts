import { useCallback, useEffect } from "react";
import { useScratchNote } from "../../hooks/useScratchNote";
import type { Note } from "../../types";

interface UseNotesPersistenceParams {
  isOpen: boolean;
}

interface UseNotesPersistenceResult {
  note: Note | null;
  saveNote: (content: string) => Promise<Note>;
  isLoading: boolean;
  loadError: string | null;
  handleRetryLoad: () => void;
}

export const useNotesPersistence = ({
  isOpen,
}: UseNotesPersistenceParams): UseNotesPersistenceResult => {
  const {
    note,
    loadNote,
    saveNote,
    isLoading,
    error: loadError,
    setError: setLoadError,
  } = useScratchNote();

  useEffect(() => {
    if (isOpen && !note && !isLoading) {
      void loadNote().catch(() => {
        /* handled by loadError */
      });
    }
  }, [isOpen, isLoading, loadNote, note]);

  const handleRetryLoad = useCallback(() => {
    setLoadError(null);
    void loadNote();
  }, [loadNote, setLoadError]);

  return {
    note,
    saveNote,
    isLoading,
    loadError,
    handleRetryLoad,
  };
};
