import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../design-system-components/button/Button";
import InputField from "../../design-system-components/form/InputField";
import Form from "../../design-system-components/form/Form";
import type { Status } from "../../../types";
import { TASKS_API_URL } from "@/config/api";
import { useLoadTasks } from "@/features/tasks/task-container/useLoadTasks";
import { useTasksActions } from "@/features/tasks/task-container/state/TasksContext";

import "./NewTaskContainer.css";

const BUTTON_CTA_TEXT = "Add";
const INPUT_TEXT = "add new task";

const NewTaskContainer = ({ selectedStatus }: { selectedStatus: Status }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { loadTasks } = useLoadTasks();
  const { setError } = useTasksActions();

  // TODO: animation on submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = taskTitle.trim();

    if (!title) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(TASKS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status: selectedStatus }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      await loadTasks();
      setTaskTitle("");
      const input = inputRef.current;
      if (input) {
        try {
          input.focus({ preventScroll: true });
        } catch {
          input.focus();
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
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
          ref={inputRef}
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
