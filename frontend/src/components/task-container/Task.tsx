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

const TaskHeader: TaskHeaderType = ({ title, isExpanded, setIsExpanded }) => {
  return (
    <div className="task-header">
      {isExpanded ? (
        <ChevronDown size={24} onClick={setIsExpanded} />
      ) : (
        <ChevronRight size={24} onClick={setIsExpanded} />
      )}
      <h2>{title}</h2>
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
