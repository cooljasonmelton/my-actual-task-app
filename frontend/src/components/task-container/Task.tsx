import { useState } from "react";
import type { TaskProps } from "./types";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import "./Task.css";

const Task = ({ title }: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="card task">
      <TaskHeader
        title={title}
        isExpanded={isExpanded}
        setIsExpanded={() => setIsExpanded(!isExpanded)}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
