import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Task from "../task/Task";
import type { TaskProps } from "../types";

const baseTask: TaskProps["task"] = {
  id: 42,
  title: "Archived Task",
  description: "",
  priority: 5,
  sortIndex: null,
  createdAt: new Date(),
  deletedAt: new Date(),
  status: "next" as const,
  tags: [],
  subtasks: [],
};

const createTaskProps = (overrides: Partial<TaskProps> = {}): TaskProps => ({
  task: baseTask,
  onDelete: vi.fn().mockResolvedValue(undefined),
  onRestore: vi.fn().mockResolvedValue(undefined),
  onTogglePriority: vi.fn().mockResolvedValue(undefined),
  onUpdateTitle: vi.fn().mockResolvedValue(undefined),
  onCreateSubtask: vi.fn().mockResolvedValue(undefined),
  onUpdateSubtaskTitle: vi.fn().mockResolvedValue(undefined),
  onDeleteSubtask: vi.fn().mockResolvedValue(undefined),
  onRestoreSubtask: vi.fn().mockResolvedValue(undefined),
  isExpanded: false,
  onToggleExpanded: vi.fn(),
  isSoftDeleted: true,
  isSoftDeletedToday: false,
  isPriorityUpdating: false,
  draggable: false,
  isDragging: false,
  isDragOver: false,
  ...overrides,
});

describe("Task component", () => {
  it("opens the restore confirmation modal for soft-deleted tasks", () => {
    render(<Task {...createTaskProps()} />);

    fireEvent.click(screen.getByRole("button", { name: /restore task/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/restore task\?/i)).toBeInTheDocument();
  });

  it("restores a task when confirmed", async () => {
    const onRestore = vi.fn().mockResolvedValue(undefined);
    render(<Task {...createTaskProps({ onRestore })} />);

    fireEvent.click(screen.getByRole("button", { name: /restore task/i }));
    fireEvent.click(screen.getByRole("button", { name: /restore$/i }));

    await waitFor(() => expect(onRestore).toHaveBeenCalledWith(42));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("closes the modal when cancelled without restoring", async () => {
    const onRestore = vi.fn().mockResolvedValue(undefined);
    render(<Task {...createTaskProps({ onRestore })} />);

    fireEvent.click(screen.getByRole("button", { name: /restore task/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onRestore).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });
});
