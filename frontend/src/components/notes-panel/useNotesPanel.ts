import { useMemo } from "react";
import { useNotesPersistence } from "./useNotesPersistence";
import { useRichTextEditor } from "./useRichTextEditor";

interface UseNotesPanelParams {
  isOpen: boolean;
  onClose: () => void;
}

export const useNotesPanel = ({ isOpen, onClose }: UseNotesPanelParams) => {
  const { note, saveNote, isLoading, loadError, handleRetryLoad } =
    useNotesPersistence({ isOpen });

  const editorState = useRichTextEditor({
    note,
    saveNote,
    onClose,
  });

  const panelClassName = useMemo(
    () => `notes-panel${isOpen ? " notes-panel--open" : ""}`,
    [isOpen]
  );

  return {
    ...editorState,
    isLoading,
    loadError,
    handleRetryLoad,
    panelClassName,
  };
};
