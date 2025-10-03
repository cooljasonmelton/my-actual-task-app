import { render, screen, fireEvent } from '@testing-library/react';
import TaskHeader from '../TaskHeader';

describe('TaskHeader', () => {
  const defaultProps = {
    taskId: 1,
    title: 'Test Task',
    isExpanded: false,
    toggleExpanded: vi.fn(),
    onDelete: vi.fn(),
    isSoftDeleted: false,
    isSoftDeletedToday: false,
  };

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
});
