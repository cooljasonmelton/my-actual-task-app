import Task from "./Task";
import "./TaskContainer.css";

const TaskContainer = () => {
  const tasks = ["task 1", "task 2", "task 3"];
  return (
    <div className="task-container">
      {tasks.map((task, i) => (
        <Task key={task + "-" + i} title={task} />
      ))}
    </div>
  );
};

export default TaskContainer;
