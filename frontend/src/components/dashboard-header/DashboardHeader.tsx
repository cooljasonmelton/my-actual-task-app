import NewTaskContainer from "./new-task/NewTaskContainer";
import SectionTabsContainer from "./section-tabs/SectionTabsContainer";
import type { TaskType } from "../../types";
import "./DashboardHeader.css";

const DashboardHeader = ({
  setTasks,
  setError,
}: {
  setTasks: React.Dispatch<React.SetStateAction<TaskType[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  return (
    <div className="dashboard-header">
      <SectionTabsContainer />
      <NewTaskContainer setTasks={setTasks} setError={setError} />
    </div>
  );
};

export default DashboardHeader;
