import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import TaskContent from "../TaskContent";
import type { Subtask } from "../../../../types";

const baseSubtasks: Subtask[] = [
  {
    id: 1,
    title: "Draft outline",
    deletedAt: null,
    sortIndex: 0,
  },
  {
    id: 2,
    title: "Archive assets",
    deletedAt: new Date(),
    sortIndex: null,
  },
];

const createProps = (
  overrides: Partial<ComponentProps<typeof TaskContent>> = {}
) => ({
  taskId: 99,
  subtasks: baseSubtasks,
  isSoftDeleted: false,
  onCreateSubtask: vi.fn().mockResolvedValue(undefined),
  onUpdateSubtaskTitle: vi.fn().mockResolvedValue(undefined),
  onDeleteSubtask: vi.fn().mockResolvedValue(undefined),
  onRestoreSubtask: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("TaskContent", () => {
  it("renders subtasks and the creation form", () => {
    render(<TaskContent {...createProps()} />);

    expect(screen.getByPlaceholderText(/add a subtask/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add subtask/i })).toBeEnabled();
    expect(screen.getByText("Draft outline")).toBeInTheDocument();
    expect(screen.getByText("Archive assets")).toBeInTheDocument();
  });

  it("creates a new subtask when the form is submitted", async () => {
    const props = createProps();
    render(<TaskContent {...props} />);

    fireEvent.change(screen.getByPlaceholderText(/add a subtask/i), {
      target: { value: "New subtask" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add subtask/i }));

    await waitFor(() =>
      expect(props.onCreateSubtask).toHaveBeenCalledWith(99, "New subtask")
    );
    expect(screen.getByPlaceholderText(/add a subtask/i)).toHaveValue("");
  });

  it("disables the creation form when the task is soft deleted", () => {
    render(<TaskContent {...createProps({ isSoftDeleted: true })} />);

    expect(screen.getByPlaceholderText(/add a subtask/i)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /add subtask/i })
    ).toBeDisabled();
  });

  it("updates a subtask title when saved", async () => {
    const props = createProps();
    render(<TaskContent {...props} />);

    const listItems = screen.getAllByRole("listitem");
    const firstItem = listItems[0];
    fireEvent.click(within(firstItem).getByRole("button", { name: /edit/i }));

    const editableItem = screen.getAllByRole("listitem")[0];
    const input = within(editableItem).getByLabelText(/subtask title/i);
    fireEvent.change(input, { target: { value: "Draft outline v2" } });
    fireEvent.click(within(editableItem).getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(props.onUpdateSubtaskTitle).toHaveBeenCalledWith(
        99,
        1,
        "Draft outline v2"
      )
    );
  });

  it("soft deletes a subtask when delete is clicked", async () => {
    const props = createProps();
    render(<TaskContent {...props} />);

    const listItems = screen.getAllByRole("listitem");
    const firstItem = listItems[0];
    fireEvent.click(
      within(firstItem).getByRole("button", { name: /delete task/i })
    );

    await waitFor(() =>
      expect(props.onDeleteSubtask).toHaveBeenCalledWith(99, 1)
    );
  });

  it("restores a subtask when restore is clicked", async () => {
    const props = createProps();
    render(<TaskContent {...props} />);

    const listItems = screen.getAllByRole("listitem");
    const deletedItem = listItems[1];
    fireEvent.click(
      within(deletedItem).getByRole("button", { name: /restore/i })
    );

    await waitFor(() =>
      expect(props.onRestoreSubtask).toHaveBeenCalledWith(99, 2)
    );
  });

});
