import { useState } from "react";
import TaskHeader from "./TaskHeader";
import type { TaskProps } from "./types";
import "./Task.css";
import TaskContent from "./TaskContent";

const Task = ({ title }: TaskProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="card task">
      <TaskHeader
        title={title}
        isExpanded={isExpanded}
        setIsExpanded={() => setIsExpanded(!isExpanded)}
      />
      <TaskContent />
    </div>
  );
};

export default Task;
