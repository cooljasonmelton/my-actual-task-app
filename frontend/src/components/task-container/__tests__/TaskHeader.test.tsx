import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { beforeEach } from "vitest";
import TaskHeader from "../task/TaskHeader";
import type { TaskHeaderProps } from "../types";

describe("TaskHeader", () => {
  const defaultProps: TaskHeaderProps = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task title", () => {
    render(<TaskHeader {...defaultProps} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("opens the inline editor on double click", () => {
    render(<TaskHeader {...defaultProps} />);
    fireEvent.doubleClick(screen.getByText("Test Task"));

    expect(screen.getByRole("textbox", { name: /task title/i })).toHaveValue(
      "Test Task"
    );
  });

  it("submits the edited title", async () => {
    const onUpdateTitle = vi.fn().mockResolvedValue(undefined);
    render(<TaskHeader {...defaultProps} onUpdateTitle={onUpdateTitle} />);

    fireEvent.doubleClick(screen.getByText("Test Task"));

    const input = screen.getByRole("textbox", { name: /task title/i });
    fireEvent.change(input, { target: { value: "Updated Title" } });
    await act(async () => {
      fireEvent.submit(input.closest("form") as HTMLFormElement);
    });

    expect(onUpdateTitle).toHaveBeenCalledWith(1, "Updated Title");
  });

  it("calls toggleExpanded when chevron is clicked", () => {
    render(<TaskHeader {...defaultProps} />);
    fireEvent.click(
      screen.getByRole("button", { name: /expand task details/i })
    );
    expect(defaultProps.toggleExpanded).toHaveBeenCalled();
  });

  it("hides the delete button when task is already soft deleted", () => {
    render(
      <TaskHeader
        {...defaultProps}
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

  it("renders a yellow star when priority is 1", () => {
    render(<TaskHeader {...defaultProps} priority={1} />);
    const starButton = screen.getByRole("button", {
      name: /set task to red priority/i,
    });
    expect(starButton).toHaveClass("task-header__icon--star-primary");
  });

  it("renders a red star when priority is 2", () => {
    render(<TaskHeader {...defaultProps} priority={2} />);
    const starButton = screen.getByRole("button", {
      name: /remove task priority/i,
    });
    expect(starButton).toHaveClass("task-header__icon--star-secondary");
  });

  it("calls onTogglePriority when the star is clicked", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...defaultProps} onTogglePriority={onTogglePriority} />
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
        {...defaultProps}
        onTogglePriority={onTogglePriority}
        isPriorityUpdating
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /mark task as top priority/i })
    );
    expect(onTogglePriority).not.toHaveBeenCalled();
  });

  it("shows a subtasks indicator when the task has subtasks", () => {
    render(<TaskHeader {...defaultProps} hasSubtasks />);

    expect(
      screen.getByRole("img", { name: /task has subtasks/i })
    ).toBeInTheDocument();
  });

  it("hides the subtasks indicator when there are no subtasks", () => {
    render(<TaskHeader {...defaultProps} />);

    expect(
      screen.queryByRole("img", { name: /task has subtasks/i })
    ).not.toBeInTheDocument();
  });

  it("supports toggling priority with the keyboard", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...defaultProps} onTogglePriority={onTogglePriority} />
    );

    fireEvent.keyDown(
      screen.getByRole("button", { name: /mark task as top priority/i }),
      {
        key: "Enter",
      }
    );

    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it("disables the star control for soft deleted tasks", () => {
    render(<TaskHeader {...defaultProps} isSoftDeleted />);

    expect(
      screen.getByRole("button", { name: /mark task as top priority/i })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("calls onRestoreRequest when the restore button is clicked", () => {
    const onRestoreRequest = vi.fn();
    render(
      <TaskHeader
        {...defaultProps}
        isSoftDeleted
        onRestoreRequest={onRestoreRequest}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /restore task/i }));
    expect(onRestoreRequest).toHaveBeenCalled();
  });

  it("notifies when the title editing state changes", async () => {
    const onTitleEditingChange = vi.fn();
    render(
      <TaskHeader
        {...defaultProps}
        onTitleEditingChange={onTitleEditingChange}
      />
    );

    await waitFor(() =>
      expect(onTitleEditingChange).toHaveBeenCalledWith(false)
    );

    onTitleEditingChange.mockClear();

    fireEvent.doubleClick(screen.getByText("Test Task"));

    await waitFor(() =>
      expect(onTitleEditingChange).toHaveBeenCalledWith(true)
    );
  });

  it("uses a textarea when editing the title to support multiple lines", () => {
    render(<TaskHeader {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText("Test Task"));
    const input = screen.getByRole("textbox", { name: /task title/i });

    expect(input.tagName).toBe("TEXTAREA");
  });

  it("cancels title editing when focus leaves the form", async () => {
    render(<TaskHeader {...defaultProps} />);

    fireEvent.doubleClick(screen.getByText("Test Task"));

    const input = screen.getByRole("textbox", { name: /task title/i });
    const form = input.closest("form") as HTMLFormElement;

    fireEvent.blur(form);

    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: /task title/i })
      ).not.toBeInTheDocument();
    });
  });

  it("submits multi-line titles without removing line breaks", async () => {
    const onUpdateTitle = vi.fn().mockResolvedValue(undefined);
    render(<TaskHeader {...defaultProps} onUpdateTitle={onUpdateTitle} />);

    fireEvent.doubleClick(screen.getByText("Test Task"));

    const input = screen.getByRole("textbox", { name: /task title/i });
    fireEvent.change(input, { target: { value: "Line 1\nLine 2" } });

    await act(async () => {
      fireEvent.submit(input.closest("form") as HTMLFormElement);
    });

    expect(onUpdateTitle).toHaveBeenCalledWith(1, "Line 1\nLine 2");
  });
});
