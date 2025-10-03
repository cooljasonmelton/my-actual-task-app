import { useCallback, useEffect, useState } from "react";
import Task from "./Task";
import DashboardHeader from "../dashboard-header/DashboardHeader";
import type { TaskType } from "../../types";
import "./TaskContainer.css";

const TASKS_API_URL = "http://localhost:3000/tasks";

const TaskContainer = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(TASKS_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load tasks: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => setTasks(data))
      .catch((err: Error) => {
        if (err) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      });
  }, []);

  const handleDeleteTask = useCallback(async (id: TaskType["id"]) => {
    setError(null);

    try {
      const response = await fetch(`${TASKS_API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task (${response.status})`);
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      throw new Error(message);
    }
  }, []);

  return (
    <>
      <DashboardHeader setTasks={setTasks} setError={setError} />

      <div className="task-container">
        {error && <p>{error}</p>}
        {tasks.map((task) => (
          <Task key={task.id} task={task} onDelete={handleDeleteTask} />
        ))}
      </div>
    </>
  );
};

export default TaskContainer;
