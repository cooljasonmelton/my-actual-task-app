import { X } from "lucide-react";
import NotesToolbar from "./NotesToolbar";
import { useNotesPanel } from "./useNotesPanel";
import CatRewardPanel from "./CatRewardPanel";
import CompletionProgress from "./CompletionProgress";
import "./InspirationPanel.css";

type InspirationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  completionCount: number;
  catGifUrl: string | null;
  isCatLoading: boolean;
  catError: string | null;
  onRetryCat: () => void;
};

const InspirationPanel = ({
  isOpen,
  onClose,
  completionCount,
  catGifUrl,
  isCatLoading,
  catError,
  onRetryCat,
}: InspirationPanelProps) => {
  const {
    editorRef,
    isLoading,
    loadError,
    handleRetryLoad,
    handleClose,
    handleCommand,
    handleCreateLink,
    handleUndo,
    handleRedo,
    handleInput,
    handleBlur,
    handleKeyDown,
    handlePaste,
    isDirty,
    isSaving,
    statusMessage,
    panelClassName,
  } = useNotesPanel({ isOpen, onClose });

  return (
    <aside className={panelClassName} aria-hidden={!isOpen}>
      <CompletionProgress count={completionCount} />
      <CatRewardPanel
        catGifUrl={catGifUrl}
        isCatLoading={isCatLoading}
        catError={catError}
        onRetryCat={onRetryCat}
      />
      <div className="notes-panel__header">
        <div>
          <h2 className="notes-panel__title">NOTES / IDEAS</h2>
          {loadError && (
            <p className="notes-panel__error">
              {loadError}{" "}
              <button
                type="button"
                className="notes-panel__retry"
                onClick={handleRetryLoad}
              >
                Retry
              </button>
            </p>
          )}
        </div>
        <button
          type="button"
          className="notes-panel__close"
          onClick={handleClose}
          aria-label="Close inspiration panel"
        >
          <X size={16} />
        </button>
      </div>

      <NotesToolbar
        onCommand={handleCommand}
        onCreateLink={handleCreateLink}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <div className="notes-panel__editor-wrapper">
        <div
          ref={editorRef}
          className="notes-panel__editor"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="add notes"
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          tabIndex={0}
          role="textbox"
          aria-multiline="true"
        />
        {isLoading && (
          <div className="notes-panel__loading">
            <span className="notes-panel__spinner" aria-hidden="true" />
            <span>Loading notes…</span>
          </div>
        )}
      </div>

      <div className="notes-panel__footer">
        <span className="notes-panel__status">{statusMessage}</span>
        {isDirty && !isSaving && (
          <span className="notes-panel__dirty-indicator" aria-live="polite">
            Unsaved changes
          </span>
        )}
      </div>
    </aside>
  );
};

export default InspirationPanel;
