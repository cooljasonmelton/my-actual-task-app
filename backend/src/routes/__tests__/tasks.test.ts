import request from 'supertest';
import type { Application } from 'express';
import type Database from 'better-sqlite3';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { Status } from '../../database/types';

let app: Application;
let db: Database.Database;
let statements: typeof import('../../database/db').statements;

const insertTask = (title: string, status: Status = 'next') => {
  const result = statements.insertTask.run(title, status);
  return Number(result.lastInsertRowid);
};

beforeAll(async () => {
  process.env.DATABASE_PATH = ':memory:';

  const dbModule = await import('../../database/db');
  db = dbModule.default;
  statements = dbModule.statements;

  const appModule = await import('../../app');
  app = appModule.default;
});

beforeEach(() => {
  db.exec('DELETE FROM tasks;');
});

afterAll(() => {
  db.close();
});

describe('Tasks routes', () => {
  it('returns only active tasks by default', async () => {
    const activeId = insertTask('Active task');
    const deletedId = insertTask('Deleted task');
    db.prepare('UPDATE tasks SET deleted_at = ? WHERE id = ?')
      .run(new Date().toISOString(), deletedId);

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids).toContain(activeId);
    expect(ids).not.toContain(deletedId);
  });

  it('returns soft-deleted tasks when includeDeleted=true', async () => {
    const activeId = insertTask('Another active task');
    const deletedId = insertTask('Soft deleted task');
    db.prepare('UPDATE tasks SET deleted_at = ? WHERE id = ?')
      .run(new Date().toISOString(), deletedId);

    const response = await request(app)
      .get('/tasks')
      .query({ includeDeleted: 'true' });

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids).toContain(activeId);
    expect(ids).toContain(deletedId);
  });

  it('soft deletes a task via DELETE /tasks/:id', async () => {
    const taskId = insertTask('Task to delete');

    const response = await request(app).delete(`/tasks/${taskId}`);

    expect(response.status).toBe(204);
    const record = db
      .prepare('SELECT deleted_at, priority FROM tasks WHERE id = ?')
      .get(taskId) as { deleted_at: string | null; priority: number } | undefined;
    expect(record?.deleted_at).not.toBeNull();
    expect(record?.priority).toBe(5);
  });

  it('updates a task priority via PATCH /tasks/:id/priority', async () => {
    const taskId = insertTask('Task to prioritize');

    const response = await request(app)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, priority: 1 });

    const record = db
      .prepare('SELECT priority FROM tasks WHERE id = ?')
      .get(taskId) as { priority: number } | undefined;
    expect(record?.priority).toBe(1);
  });

  it('rejects invalid priority updates', async () => {
    const taskId = insertTask('Task with invalid priority request');

    const response = await request(app)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 42 });

    expect(response.status).toBe(400);
  });

  it('orders tasks by ascending priority', async () => {
    const highPriorityId = insertTask('High priority');
    const lowerPriorityId = insertTask('Lower priority');

    db.prepare('UPDATE tasks SET priority = ? WHERE id = ?')
      .run(2, highPriorityId);
    db.prepare('UPDATE tasks SET priority = ? WHERE id = ?')
      .run(4, lowerPriorityId);

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids.indexOf(highPriorityId)).toBeLessThan(ids.indexOf(lowerPriorityId));
  });

  it('supports the expanded set of task statuses', async () => {
    const taskId = insertTask('Task with custom status');

    db.prepare('UPDATE tasks SET status = ? WHERE id = ?')
      .run('dates', taskId);

    const response = await request(app)
      .get('/tasks')
      .query({ includeDeleted: 'true' });

    expect(response.status).toBe(200);
    const task = response.body.find((item: any) => item.id === taskId);
    expect(task).toBeTruthy();
    expect(task.status).toBe('dates');
  });
});
  it('creates a task with the provided status', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Status-aware task', status: 'ongoing' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ status: 'ongoing' });

    const record = db
      .prepare('SELECT status FROM tasks WHERE id = ?')
      .get(response.body.id) as { status: string } | undefined;
    expect(record?.status).toBe('ongoing');
  });
