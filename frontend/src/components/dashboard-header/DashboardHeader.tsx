import type { Dispatch, SetStateAction, DragEvent } from "react";
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
  isDragActive,
  dragOverStatus,
  onStatusDragOver,
  onStatusDragLeave,
  onStatusDrop,
}: {
  refreshTasks: () => Promise<void>;
  reportError: Dispatch<SetStateAction<string | null>>;
  selectedStatus: Status;
  onStatusChange: (value: Status) => void;
  statusCounts: Record<Status, number>;
  isDragActive: boolean;
  dragOverStatus: Status | null;
  onStatusDragOver: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDragLeave: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDrop: (event: DragEvent<HTMLElement>, status: Status) => void;
}) => {
  return (
    <div className="dashboard-header">
      <SectionTabsContainer
        selectedStatus={selectedStatus}
        onChange={onStatusChange}
        counts={statusCounts}
        isDragActive={isDragActive}
        dragOverStatus={dragOverStatus}
        onStatusDragOver={onStatusDragOver}
        onStatusDragLeave={onStatusDragLeave}
        onStatusDrop={onStatusDrop}
      />
      <NewTaskContainer
        refreshTasks={refreshTasks}
        reportError={reportError}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

export default DashboardHeader;
