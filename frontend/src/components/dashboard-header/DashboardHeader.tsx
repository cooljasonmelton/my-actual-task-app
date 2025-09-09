import NewTaskContainer from "./new-task/NewTaskContainer";
import SectionTabsContainer from "./section-tabs/SectionTabsContainer";
import "./DashboardHeader.css";

const DashboardHeader = () => {
  return (
    <div className="dashboard-header">
      <SectionTabsContainer />
      <NewTaskContainer />
    </div>
  );
};

export default DashboardHeader;
