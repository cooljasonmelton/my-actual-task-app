import type { DragEvent } from "react";
import type { Status } from "../../types";
import NewTaskContainer from "./new-task/NewTaskContainer";
import SectionTabsContainer from "./section-tabs/SectionTabsContainer";
import "./DashboardHeader.css";
import NotesToggleButton from "./notes-toggle/NotesToggleButton";

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
  isNotesPanelOpen,
  onToggleNotesPanel,
}: {
  refreshTasks: () => Promise<void>;
  reportError: (message: string | null) => void;
  selectedStatus: Status;
  onStatusChange: (value: Status) => void;
  statusCounts: Record<Status, number>;
  isDragActive: boolean;
  dragOverStatus: Status | null;
  onStatusDragOver: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDragLeave: (event: DragEvent<HTMLElement>, status: Status) => void;
  onStatusDrop: (event: DragEvent<HTMLElement>, status: Status) => void;
  isNotesPanelOpen: boolean;
  onToggleNotesPanel: () => void;
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
      <div className="dashboard-header__actions">
        <NewTaskContainer
          refreshTasks={refreshTasks}
          reportError={reportError}
          selectedStatus={selectedStatus}
        />
        <NotesToggleButton
          isActive={isNotesPanelOpen}
          onToggle={onToggleNotesPanel}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
