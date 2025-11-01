import { StickyNote } from "lucide-react";
import "./NotesToggleButton.css";

type NotesToggleButtonProps = {
  isActive: boolean;
  onToggle: () => void;
};

const NotesToggleButton = ({ isActive, onToggle }: NotesToggleButtonProps) => {
  const className = `notes-toggle-button${
    isActive ? " notes-toggle-button--active" : ""
  }`;

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-pressed={isActive}
    >
      <StickyNote size={18} />
      NOTES
    </button>
  );
};

export default NotesToggleButton;
