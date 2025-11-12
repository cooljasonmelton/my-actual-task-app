import { type ComponentProps, type DragEvent } from "react";
import TaskList from "../task/TaskList";
import InspirationPanel from "@/components/inspiration-panel/InspirationPanel";

type TaskWorkspaceBodyProps = {
  workspaceClassName: string;
  taskContainerClassName: string;
  handleContainerDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDropOnContainer: (event: DragEvent<HTMLDivElement>) => void;
  error: string | null;
  isLoading: boolean;
  taskListProps: ComponentProps<typeof TaskList>;
  inspirationPanelProps: ComponentProps<typeof InspirationPanel>;
};

const TaskWorkspaceBody = ({
  workspaceClassName,
  taskContainerClassName,
  handleContainerDragOver,
  handleDropOnContainer,
  error,
  isLoading,
  taskListProps,
  inspirationPanelProps,
}: TaskWorkspaceBodyProps) => {
  return (
    <div className={workspaceClassName}>
      <div
        className={taskContainerClassName}
        onDragOver={handleContainerDragOver}
        onDrop={handleDropOnContainer}
      >
        {error && <p className="task-container__error">{error}</p>}
        {isLoading ? (
          <div
            className="card task-container__loading-card"
            role="status"
            aria-live="polite"
          >
            <div className="task-container__loading">
              <div className="task-container__loading-content">
                <span
                  className="task-container__loading-spinner"
                  aria-hidden="true"
                />
                <span className="task-container__loading-text">
                  Loading tasks...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <TaskList {...taskListProps} />
        )}
      </div>
      <InspirationPanel {...inspirationPanelProps} />
    </div>
  );
};

export default TaskWorkspaceBody;
