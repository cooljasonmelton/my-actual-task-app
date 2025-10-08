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
      <TaskHeader {...defaultProps} isSoftDeleted isSoftDeletedToday={false} />
    );

    expect(
      screen.queryByRole("button", { name: /delete task/i })
    ).not.toBeInTheDocument();
  });

  it("renders a filled star when priority is 1", () => {
    render(<TaskHeader {...defaultProps} priority={1} />);
    const starButton = screen.getByRole("button", { name: /unstar task/i });
    expect(starButton).toHaveClass("filled-star");
  });

  it("calls onTogglePriority when the star is clicked", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...defaultProps} onTogglePriority={onTogglePriority} />
    );

    fireEvent.click(screen.getByRole("button", { name: /star task/i }));
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

    fireEvent.click(screen.getByRole("button", { name: /star task/i }));
    expect(onTogglePriority).not.toHaveBeenCalled();
  });

  it("supports toggling priority with the keyboard", () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader {...defaultProps} onTogglePriority={onTogglePriority} />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: /star task/i }), {
      key: "Enter",
    });

    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it("disables the star control for soft deleted tasks", () => {
    render(<TaskHeader {...defaultProps} isSoftDeleted />);

    expect(screen.getByRole("button", { name: /star task/i })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
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
});
