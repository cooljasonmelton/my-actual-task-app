import request from 'supertest';
import type { Application } from 'express';
import type Database from 'better-sqlite3';
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';

let app: Application;
let db: Database.Database;
let statements: typeof import('../../database/db').statements;

const insertTask = (title: string) => {
  const result = statements.insertTask.run(title);
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
      .prepare('SELECT deleted_at FROM tasks WHERE id = ?')
      .get(taskId) as { deleted_at: string | null } | undefined;
    expect(record?.deleted_at).not.toBeNull();
  });
});
