import Button from "../../design-system-components/button/Button";
import "./NewTaskContainer.css";
import { Plus } from "lucide-react";

const NewTaskContainer = () => {
  return (
    <div className="card">
      {/* <input>input</input> */}
      <Button variant="secondary" size="medium">
        <Plus size={20} />
        Add
      </Button>
    </div>
  );
};

export default NewTaskContainer;
