import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";
import TaskHeader from "../task/TaskHeader";
import type { TaskHeaderProps } from "../types";

const createProps = (
  overrides: Partial<TaskHeaderProps> = {}
): TaskHeaderProps => ({
  taskId: 1,
  title: "Test Task",
  priority: 5,
  isExpanded: false,
  toggleExpanded: vi.fn(),
  onDelete: vi.fn(),
  onTogglePriority: vi.fn().mockResolvedValue(undefined),
  onUpdateTitle: vi.fn().mockResolvedValue(undefined),
  isSoftDeleted: false,
  isSoftDeletedToday: false,
  isPriorityUpdating: false,
  onTitleEditingChange: vi.fn(),
  onRestoreRequest: vi.fn(),
  hasSubtasks: false,
  ...overrides,
});

describe("TaskHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task title", () => {
    render(<TaskHeader {...createProps()} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("calls toggleExpanded when chevron is clicked", () => {
    const props = createProps();
    render(<TaskHeader {...props} />);

    fireEvent.click(
      screen.getByRole("button", { name: /expand task details/i })
    );

    expect(props.toggleExpanded).toHaveBeenCalled();
  });

  it("hides the delete button when task is already soft deleted", () => {
    render(
      <TaskHeader
        {...createProps()}
        isSoftDeleted
        isSoftDeletedToday={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: /delete task/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /restore task/i })
    ).toBeInTheDocument();
  });

  it("shows a subtasks indicator when the task has subtasks", () => {
    render(<TaskHeader {...createProps({ hasSubtasks: true })} />);

    const expandButtons = screen.getAllByRole("button", {
      name: /expand task details/i,
    });

    expect(expandButtons).toHaveLength(2);
  });

  it("hides the subtasks indicator when there are no subtasks", () => {
    render(<TaskHeader {...createProps()} />);

    const expandButtons = screen.getAllByRole("button", {
      name: /expand task details/i,
    });

    expect(expandButtons).toHaveLength(1);
  });

  it("calls onRestoreRequest when the restore button is clicked", () => {
    const onRestoreRequest = vi.fn();
    render(
      <TaskHeader
        {...createProps()}
        isSoftDeleted
        onRestoreRequest={onRestoreRequest}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /restore task/i }));
    expect(onRestoreRequest).toHaveBeenCalled();
  });
});
