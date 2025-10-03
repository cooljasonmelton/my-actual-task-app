import { useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import "./Task.css";
import type { TaskProps } from "./types";

const Task = ({ task, onDelete }: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="card task">
      <TaskHeader
        taskId={task.id}
        title={task.title}
        isExpanded={isExpanded}
        setIsExpanded={() => setIsExpanded(!isExpanded)}
        onDelete={onDelete}
      />
      {isExpanded && <TaskContent />}
    </div>
  );
};

export default Task;
