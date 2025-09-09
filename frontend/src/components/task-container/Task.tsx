import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Plus,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
} from "lucide-react";
import "./Task.css";

interface TaskProps {
  title: string;
}

type TaskHeaderType = React.FC<
  Pick<TaskProps, "title"> & { isExpanded: boolean; setIsExpanded: () => void }
>;

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
