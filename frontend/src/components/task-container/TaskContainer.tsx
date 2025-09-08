import Task from "./Task";
import "./TaskContainer.css";

const TaskContainer = () => {
  const tasks = [1, 2, 3];
  return (
    <div className="task-container">
      {tasks.map((task, i) => (
        <Task key={task + "-" + i} />
      ))}
    </div>
  );
};

export default TaskContainer;
