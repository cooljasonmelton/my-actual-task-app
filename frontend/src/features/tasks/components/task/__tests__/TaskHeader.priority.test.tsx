import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";
import TaskHeader from "../TaskHeader";
import type { TaskHeaderProps } from "@/features/tasks/types";

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

describe("TaskHeader priority controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a yellow star when priority is 1", () => {
    render(<TaskHeader {...createProps({ priority: 1 })} />);
    const starButton = screen.getByRole("button", {
      name: /set task to red priority/i,
    });

    expect(starButton).toHaveClass("task-header__icon--star-primary");
  });

  it("renders a red star when priority is 2", () => {
    render(<TaskHeader {...createProps({ priority: 2 })} />);
    const starButton = screen.getByRole("button", {
      name: /remove task priority/i,
    });

    expect(starButton).toHaveClass("task-header__icon--star-secondary");
  });

  it("calls onTogglePriority when the star is clicked", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...createProps({ onTogglePriority })} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /mark task as top priority/i })
    );

    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it("does not toggle priority when the update is in progress", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader
        {...createProps({
          onTogglePriority,
          isPriorityUpdating: true,
        })}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /mark task as top priority/i })
    );

    expect(onTogglePriority).not.toHaveBeenCalled();
  });

  it("supports toggling priority with the keyboard", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...createProps({ onTogglePriority })} />
    );

    fireEvent.keyDown(
      screen.getByRole("button", { name: /mark task as top priority/i }),
      { key: "Enter" }
    );

    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it("disables the star control for soft deleted tasks", () => {
    render(<TaskHeader {...createProps({ isSoftDeleted: true })} />);

    expect(
      screen.getByRole("button", { name: /mark task as top priority/i })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("highlights the title when priority is 1", () => {
    render(<TaskHeader {...createProps({ priority: 1 })} />);
    expect(screen.getByText("Test Task")).toHaveClass("task-title--priority-1");
  });

  it("does not highlight the title when soft deleted even if priority is 1", () => {
    render(
      <TaskHeader
        {...createProps({
          priority: 1,
          isSoftDeleted: true,
        })}
      />
    );
    expect(screen.getByText("Test Task")).not.toHaveClass(
      "task-title--priority-1"
    );
  });
});
