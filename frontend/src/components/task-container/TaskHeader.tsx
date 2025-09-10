import { useState } from "react";
import { Star, ChevronDown, ChevronRight } from "lucide-react";
import type { TaskHeaderType } from "./types";

import "./TaskHeader.css";

// TODO: move to own file
const TaskHeader: TaskHeaderType = ({ title, isExpanded, setIsExpanded }) => {
  // TODO: move starred to api call
  const [isStarred, setIsStarred] = useState(false);

  const isStarredClassName = isStarred ? "filled-star" : "empty-star";

  return (
    <div className="task-header">
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
      <h3>{title}</h3>
    </div>
  );
};

export default TaskHeader;
