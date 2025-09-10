import { mockTasks } from "../../assets/mockData";
import Task from "./Task";
import "./TaskContainer.css";

const TaskContainer = () => {
  const tasks = mockTasks;

  return (
    <div className="task-container">
      {tasks.map((task, i) => (
        <Task key={`${task}-${i}`} title={task.title} />
      ))}
    </div>
  );
};

export default TaskContainer;
