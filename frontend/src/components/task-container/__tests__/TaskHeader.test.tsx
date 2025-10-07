import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach } from 'vitest';
import TaskHeader from '../TaskHeader';

describe('TaskHeader', () => {
  const defaultProps = {
    taskId: 1,
    title: 'Test Task',
    priority: 5,
    isExpanded: false,
    toggleExpanded: vi.fn(),
    onDelete: vi.fn(),
    onTogglePriority: vi.fn().mockResolvedValue(undefined),
    isSoftDeleted: false,
    isSoftDeletedToday: false,
    isPriorityUpdating: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the task title', () => {
    render(<TaskHeader {...defaultProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls toggleExpanded when chevron is clicked', () => {
    render(<TaskHeader {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /expand task details/i }));
    expect(defaultProps.toggleExpanded).toHaveBeenCalled();
  });

  it('hides the delete button when task is already soft deleted', () => {
    render(
      <TaskHeader
        {...defaultProps}
        isSoftDeleted
        isSoftDeletedToday={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: /delete task/i })
    ).not.toBeInTheDocument();
  });

  it('renders a filled star when priority is 1', () => {
    render(<TaskHeader {...defaultProps} priority={1} />);
    const starButton = screen.getByRole('button', { name: /unstar task/i });
    expect(starButton).toHaveClass('filled-star');
  });

  it('calls onTogglePriority when the star is clicked', () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader
        {...defaultProps}
        onTogglePriority={onTogglePriority}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /star task/i }));
    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it('does not toggle priority when the update is in progress', () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader
        {...defaultProps}
        onTogglePriority={onTogglePriority}
        isPriorityUpdating
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /star task/i }));
    expect(onTogglePriority).not.toHaveBeenCalled();
  });

  it('supports toggling priority with the keyboard', () => {
    const onTogglePriority = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskHeader
        {...defaultProps}
        onTogglePriority={onTogglePriority}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: /star task/i }), {
      key: 'Enter',
    });

    expect(onTogglePriority).toHaveBeenCalledWith(1, 5);
  });

  it('disables the star control for soft deleted tasks', () => {
    render(
      <TaskHeader
        {...defaultProps}
        isSoftDeleted
      />
    );

    expect(screen.getByRole('button', { name: /star task/i })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
