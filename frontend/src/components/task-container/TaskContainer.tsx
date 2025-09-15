import { useEffect, useState } from "react";
import Task from "./Task";
import type { TaskType } from "../../types";
import "./TaskContainer.css";

const GET_TASKS_URL = "http://localhost:3000/tasks";

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(GET_TASKS_URL)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err: Error) => {
        if (err) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      });
  }, []);

  return (
    <div className="task-container">
      {error && <p>{error}</p>}
      {tasks.map((task, i) => (
        <Task key={`${task}-${i}`} title={task.title} />
      ))}
    </div>
  );
};

export default TaskContainer;
