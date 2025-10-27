import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const openEditor = () => {
  fireEvent.doubleClick(screen.getByText("Test Task"));
};

describe("TaskHeader title editing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the inline editor on double click", () => {
    render(<TaskHeader {...createProps()} />);
    openEditor();

    expect(screen.getByRole("textbox", { name: /task title/i })).toHaveValue(
      "Test Task"
    );
  });

  it("submits the edited title", async () => {
    const onUpdateTitle = vi.fn().mockResolvedValue(undefined);
    render(<TaskHeader {...createProps({ onUpdateTitle })} />);

    openEditor();

    const input = screen.getByRole("textbox", { name: /task title/i });
    fireEvent.change(input, { target: { value: "Updated Title" } });

    await act(async () => {
      fireEvent.submit(input.closest("form") as HTMLFormElement);
    });

    expect(onUpdateTitle).toHaveBeenCalledWith(1, "Updated Title");
  });

  it("notifies when the title editing state changes", async () => {
    const onTitleEditingChange = vi.fn();
    render(<TaskHeader {...createProps({ onTitleEditingChange })} />);

    await waitFor(() =>
      expect(onTitleEditingChange).toHaveBeenCalledWith(false)
    );

    onTitleEditingChange.mockClear();

    openEditor();

    await waitFor(() =>
      expect(onTitleEditingChange).toHaveBeenCalledWith(true)
    );
  });

  it("uses a textarea when editing the title to support multiple lines", () => {
    render(<TaskHeader {...createProps()} />);

    openEditor();
    const input = screen.getByRole("textbox", { name: /task title/i });

    expect(input.tagName).toBe("TEXTAREA");
  });

  it("cancels title editing when focus leaves the form", async () => {
    render(<TaskHeader {...createProps()} />);

    openEditor();

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
    render(<TaskHeader {...createProps({ onUpdateTitle })} />);

    openEditor();

    const input = screen.getByRole("textbox", { name: /task title/i });
    fireEvent.change(input, { target: { value: "Line 1\nLine 2" } });

    await act(async () => {
      fireEvent.submit(input.closest("form") as HTMLFormElement);
    });

    expect(onUpdateTitle).toHaveBeenCalledWith(1, "Line 1\nLine 2");
  });
});
