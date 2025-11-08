import {
  Bold,
  Italic,
  Underline,
  List as UnorderedListIcon,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";

type NotesToolbarProps = {
  onCommand: (command: string, value?: string) => void;
  onCreateLink: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

const NotesToolbar = ({
  onCommand,
  onCreateLink,
  onUndo,
  onRedo,
}: NotesToolbarProps) => {
  return (
    <div className="notes-panel__toolbar" role="toolbar" aria-label="Note formatting">
      <button
        type="button"
        className="notes-panel__tool"
        onClick={() => onCommand("bold")}
        aria-label="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        className="notes-panel__tool"
        onClick={() => onCommand("italic")}
        aria-label="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        className="notes-panel__tool"
        onClick={() => onCommand("underline")}
        aria-label="Underline"
      >
        <Underline size={16} />
      </button>
      <span className="notes-panel__toolbar-separator" role="separator" />
      <button
        type="button"
        className="notes-panel__tool"
        onClick={() => onCommand("insertUnorderedList")}
        aria-label="Bulleted list"
      >
        <UnorderedListIcon size={16} />
      </button>
      <button
        type="button"
        className="notes-panel__tool"
        onClick={() => onCommand("insertOrderedList")}
        aria-label="Numbered list"
      >
        <ListOrdered size={16} />
      </button>
      <span className="notes-panel__toolbar-separator" role="separator" />
      <button
        type="button"
        className="notes-panel__tool"
        onClick={onCreateLink}
        aria-label="Insert link"
      >
        <LinkIcon size={16} />
      </button>
      <span className="notes-panel__toolbar-separator" role="separator" />
      <button
        type="button"
        className="notes-panel__tool"
        onClick={onUndo}
        aria-label="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        type="button"
        className="notes-panel__tool"
        onClick={onRedo}
        aria-label="Redo"
      >
        <Redo2 size={16} />
      </button>
    </div>
  );
};

export default NotesToolbar;
