import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../design-system-components/button/Button";
import InputField from "../../design-system-components/form/InputField";
import Form from "../../design-system-components/form/Form";

import "./NewTaskContainer.css";
import type { TaskType } from "../../../types";

const TASKS_API_URL = "http://localhost:3000/tasks";

const BUTTON_CTA_TEXT = "Add";
const INPUT_TEXT = "add new task";

const NewTaskContainer = ({
  setTasks,
  setError,
}: {
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // TODO: animation on submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = taskTitle.trim();

    if (!title) return;

    setLoading(true);
    try {
      const res = await fetch(TASKS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      const data = await res.json();
      setTasks((prev) => [data, ...prev]);
      setTaskTitle("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card">
      <Form onSubmit={handleSubmit} className="new-task-form">
        <InputField
          id="new-task-input"
          type="text"
          name="task-title"
          className="new-task-input"
          placeholder={INPUT_TEXT}
          label={INPUT_TEXT}
          onChange={(e) => setTaskTitle(e.target.value)}
          value={taskTitle}
        />
        <Button
          className="new-task-submit"
          variant="secondary"
          size="medium"
          type="submit"
          isLoading={loading}
        >
          <Plus size={20} />
          {BUTTON_CTA_TEXT}
        </Button>
      </Form>
    </div>
  );
};

export default NewTaskContainer;
