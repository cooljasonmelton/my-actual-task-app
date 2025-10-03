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

  const handleKeyDown = (
    event: KeyboardEvent<SVGSVGElement>,
    type: "expand" | "delete"
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    if (type === "delete") {
      void handleClickDelete();
    }
    if (type === "expand") {
      setIsExpanded(!isExpanded);
    }
  };

  const isStarredClassName = isStarred ? "filled-star" : "empty-star";
  const shouldDeleteClassName = shouldDelete ? "filled-delete" : "empty-delete";
  const Chevron = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        <Chevron
          size={20}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => handleKeyDown(e, "expand")}
          className={isStarredClassName}
          aria-label={isExpanded ? "Hide task details" : "Expand task details"}
          role="button"
          tabIndex={0}
        />
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
        onKeyDown={(e) => handleKeyDown(e, "delete")}
        className={shouldDeleteClassName}
        aria-label={shouldDelete ? "Confirm delete task" : "Delete task"}
        role="button"
        aria-disabled={isDeleting}
        tabIndex={0}
      />
    </div>
  );
};

export default TaskHeader;
