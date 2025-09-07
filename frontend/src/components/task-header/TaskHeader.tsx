import NewTaskContainer from "./new-task/NewTaskContainer";
import SectionTabsContainer from "./section-tabs/SectionTabsContainer";
import "./TaskHeader.css";

const TaskHeader = () => {
  return (
    <div className="task-header">
      <SectionTabsContainer />
      <NewTaskContainer />
    </div>
  );
};

export default TaskHeader;
