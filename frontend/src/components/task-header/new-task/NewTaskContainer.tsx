import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../design-system-components/button/Button";
import InputField from "../../design-system-components/form/InputField";
import Form from "../../design-system-components/form/Form";

import "./NewTaskContainer.css";

const BUTTON_CTA_TEXT = "Add";
const INPUT_TEXT = "add new task";

const NewTaskContainer = () => {
  const [taskTitle, setTaskTitle] = useState("");

  // TODO: animation on submit
  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit", taskTitle);
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
        >
          <Plus size={20} />
          {BUTTON_CTA_TEXT}
        </Button>
      </Form>
    </div>
  );
};

export default NewTaskContainer;
