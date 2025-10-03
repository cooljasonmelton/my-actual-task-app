import { useEffect, useState, type KeyboardEvent } from "react";
import { Star, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import type { TaskHeaderType } from "./types";

import "./TaskHeader.css";

const TaskHeader: TaskHeaderType = ({
  taskId,
  title,
  isExpanded,
  toggleExpanded,
  onDelete,
  isSoftDeleted,
  isSoftDeletedToday,
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

  useEffect(() => {
    if (isSoftDeleted) {
      setShouldDelete(false);
      setIsDeleting(false);
    }
  }, [isSoftDeleted]);

  const handleClickDelete = async () => {
    if (isDeleting || isSoftDeleted) {
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
    action: "expand" | "delete"
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();

    if (action === "expand") {
      toggleExpanded();
    }

    if (action === "delete" && !isSoftDeleted) {
      void handleClickDelete();
    }
  };

  const Chevron = isExpanded ? ChevronDown : ChevronRight;
  const isStarredClassName = isStarred ? "filled-star" : "empty-star";
  const titleClassName = `task-title${
    isSoftDeleted ? " task-title--soft-deleted" : ""
  }${isSoftDeletedToday ? " task-title--soft-deleted-today" : ""}`;

  return (
    <div className="task-header">
      <div className="task-title-wrapper">
        <Chevron
          size={20}
          onClick={toggleExpanded}
          onKeyDown={(e) => handleKeyDown(e, "expand")}
          className="task-header__chevron"
          aria-label={isExpanded ? "Hide task details" : "Expand task details"}
          role="button"
          tabIndex={0}
        />
        <Star
          size={20}
          onClick={() => setIsStarred(!isStarred)}
          className={isStarredClassName}
          aria-label={isStarred ? "Unstar task" : "Star task"}
          role="button"
          tabIndex={0}
        />
        {/* TODO: make headings semantic */}
        <h3 className={titleClassName}>{title}</h3>
      </div>
      {!isSoftDeleted && (
        <XCircle
          size={20}
          onClick={handleClickDelete}
          onKeyDown={(e) => handleKeyDown(e, "delete")}
          className={shouldDelete ? "filled-delete" : "empty-delete"}
          aria-label={shouldDelete ? "Confirm delete task" : "Delete task"}
          role="button"
          aria-disabled={isDeleting}
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default TaskHeader;
