import { useEffect, useState, type KeyboardEvent } from "react";
import { Star, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import type { TaskHeaderType } from "./types";

import "./TaskHeader.css";

const TaskHeader: TaskHeaderType = ({
  taskId,
  title,
  isExpanded,
  setIsExpanded,
  onDelete,
}) => {
  // TODO: move starred to api call and debounce
  const [isStarred, setIsStarred] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    if (!shouldDelete) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShouldDelete(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [shouldDelete]);

  const handleClickDelete = async () => {
    if (isDeleting) {
      return;
    }

    if (!shouldDelete) {
      setShouldDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(taskId);
    } catch (error) {
      console.error("Failed to delete task", error);
      setShouldDelete(false);
      setIsDeleting(false);
    }
  };

  const handleDeleteKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    void handleClickDelete();
  };

  const isStarredClassName = isStarred ? "filled-star" : "empty-star";
  // TODO: add a classname and color
  const isReadyForDeleteClassName = shouldDelete ? "filled-star" : "empty-star";

  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        {isExpanded ? (
          <ChevronDown size={20} onClick={setIsExpanded} />
        ) : (
          <ChevronRight size={20} onClick={setIsExpanded} />
        )}
        <Star
          size={20}
          onClick={() => setIsStarred(!isStarred)}
          className={isStarredClassName}
        />
        {/* TODO: make headings semantic */}
        <h3 className="task-title">{title}</h3>
      </div>
      <XCircle
        size={20}
        onClick={handleClickDelete}
        onKeyDown={handleDeleteKeyDown}
        className={isReadyForDeleteClassName}
        aria-label={
          shouldDelete ? "Confirm delete task" : "Delete task"
        }
        role="button"
        aria-disabled={isDeleting}
        tabIndex={0}
      />
    </div>
  );
};

export default TaskHeader;
