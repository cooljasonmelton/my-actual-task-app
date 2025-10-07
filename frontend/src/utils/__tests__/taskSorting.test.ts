import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TASK_SORT_OPTION,
  getNextPriority,
  sortTasks,
} from '../taskSorting';
import type { TaskType } from '../../types';

const createTask = (overrides: Partial<TaskType>): TaskType => ({
  id: overrides.id ?? 0,
  title: overrides.title ?? 'Task',
  description: overrides.description ?? '',
  priority: overrides.priority ?? 3,
  sortIndex: overrides.sortIndex ?? 10,
  createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
  deletedAt: overrides.deletedAt ?? null,
  status: overrides.status ?? 'next',
  tags: overrides.tags ?? [],
  subtasks: overrides.subtasks ?? [],
});

describe('taskSorting utilities', () => {
  it('uses priority sorting by default', () => {
    expect(DEFAULT_TASK_SORT_OPTION).toBe('priority');
  });

  it('sorts tasks by ascending priority and then sortIndex', () => {
    const tasks: TaskType[] = [
      createTask({ id: 1, priority: 4, sortIndex: 30 }),
      createTask({ id: 2, priority: 2, sortIndex: 10, createdAt: new Date('2024-02-01T00:00:00Z') }),
      createTask({ id: 3, priority: 2, sortIndex: 20, createdAt: new Date('2024-01-15T00:00:00Z') }),
    ];

    const sorted = sortTasks(tasks, 'priority');

    expect(sorted.map((task) => task.id)).toEqual([2, 3, 1]);
  });

  it('sorts tasks by createdAt when requested', () => {
    const tasks: TaskType[] = [
      createTask({ id: 1, createdAt: new Date('2024-01-01T00:00:00Z') }),
      createTask({ id: 2, createdAt: new Date('2024-03-01T00:00:00Z') }),
      createTask({ id: 3, createdAt: new Date('2024-02-01T00:00:00Z') }),
    ];

    const sorted = sortTasks(tasks, 'createdAt');

    expect(sorted.map((task) => task.id)).toEqual([2, 3, 1]);
  });

  it('toggles a task priority between starred and default values', () => {
    expect(getNextPriority(1)).toBe(5);
    expect(getNextPriority(3)).toBe(1);
  });
});
