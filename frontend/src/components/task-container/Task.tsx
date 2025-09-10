import { useState } from "react";
import TaskHeader from "./TaskHeader";
import type { TaskProps } from "./types";
import "./Task.css";

const Task = ({ title }: TaskProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="card">
      <TaskHeader
        title={title}
        isExpanded={isExpanded}
        setIsExpanded={() => setIsExpanded(!isExpanded)}
      />
    </div>
  );
};

export default Task;
