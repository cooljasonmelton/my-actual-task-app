import type { Dispatch, SetStateAction } from "react";
import type { Status } from "../../types";
import NewTaskContainer from "./new-task/NewTaskContainer";
import SectionTabsContainer from "./section-tabs/SectionTabsContainer";
import "./DashboardHeader.css";

const DashboardHeader = ({
  refreshTasks,
  reportError,
  selectedStatus,
  onStatusChange,
  statusCounts,
}: {
  refreshTasks: () => Promise<void>;
  reportError: Dispatch<SetStateAction<string | null>>;
  selectedStatus: Status;
  onStatusChange: (value: Status) => void;
  statusCounts: Record<Status, number>;
}) => {
  return (
    <div className="dashboard-header">
      <SectionTabsContainer
        selectedStatus={selectedStatus}
        onChange={onStatusChange}
        counts={statusCounts}
      />
      <NewTaskContainer refreshTasks={refreshTasks} reportError={reportError} />
    </div>
  );
};

export default DashboardHeader;
