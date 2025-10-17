import request from "supertest";
import type { Application } from "express";
import type Database from "better-sqlite3";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Status } from "../../database/types";

let app: Application;
let db: Database.Database;
let taskQueries: typeof import("../../database/taskRepository").taskQueries;
let subtaskQueries: typeof import("../../database/subtaskRepository").subtaskQueries;

const insertTask = (title: string, status: Status = "next") => {
  const { id } = taskQueries.create({ title, status });
  return Number(id);
};

const insertSubtask = (taskId: number, title: string) => {
  return subtaskQueries.create(taskId, title);
};

beforeAll(async () => {
  process.env.DATABASE_PATH = ":memory:";

  const dbModule = await import("../../database/db");
  db = dbModule.default;

  const taskRepoModule = await import("../../database/taskRepository");
  taskQueries = taskRepoModule.taskQueries;
  const subtaskRepoModule = await import("../../database/subtaskRepository");
  subtaskQueries = subtaskRepoModule.subtaskQueries;

  const appModule = await import("../../app");
  app = appModule.default;
});

beforeEach(() => {
  db.exec("DELETE FROM subtasks;");
  db.exec("DELETE FROM tasks;");
});

afterAll(() => {
  db.close();
});

describe("Tasks routes", () => {
  it("returns only active tasks by default", async () => {
    const activeId = insertTask("Active task");
    const deletedId = insertTask("Deleted task");
    db.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      deletedId
    );

    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids).toContain(activeId);
    expect(ids).not.toContain(deletedId);
  });

  it("returns soft-deleted tasks when includeDeleted=true", async () => {
    const activeId = insertTask("Another active task");
    const deletedId = insertTask("Soft deleted task");
    db.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      deletedId
    );

    const response = await request(app)
      .get("/tasks")
      .query({ includeDeleted: "true" });

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids).toContain(activeId);
    expect(ids).toContain(deletedId);
  });

  it("soft deletes a task via DELETE /tasks/:id", async () => {
    const taskId = insertTask("Task to delete");

    const response = await request(app).delete(`/tasks/${taskId}`);

    expect(response.status).toBe(204);
    const record = db
      .prepare("SELECT deleted_at, priority, sort_index FROM tasks WHERE id = ?")
      .get(taskId) as
      | { deleted_at: string | null; priority: number; sort_index: number | null }
      | undefined;
    expect(record?.deleted_at).not.toBeNull();
    expect(record?.priority).toBe(5);
    expect(record?.sort_index).toBeNull();
  });

  it("restores a soft-deleted task via PATCH /tasks/:id/restore", async () => {
    const taskId = insertTask("Task to restore");
    await request(app).delete(`/tasks/${taskId}`);

    const response = await request(app).patch(`/tasks/${taskId}/restore`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId });
    expect(response.body.deletedAt).toBeNull();

    const record = db
      .prepare("SELECT deleted_at, sort_index FROM tasks WHERE id = ?")
      .get(taskId) as { deleted_at: string | null; sort_index: number | null } | undefined;

    expect(record?.deleted_at).toBeNull();
    expect(record?.sort_index).not.toBeNull();
  });

  it("updates a task priority via PATCH /tasks/:id/priority", async () => {
    const taskId = insertTask("Task to prioritize");

    const response = await request(app)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, priority: 1 });

    const record = db
      .prepare("SELECT priority FROM tasks WHERE id = ?")
      .get(taskId) as { priority: number } | undefined;
    expect(record?.priority).toBe(1);
  });

  it("updates a task status via PATCH /tasks/:id/status", async () => {
    const taskId = insertTask("Task to move", "next");
    const otherTaskId = insertTask("Existing task in ongoing", "ongoing");
    db.prepare("UPDATE tasks SET sort_index = ? WHERE id = ?").run(20, otherTaskId);

    const response = await request(app)
      .patch(`/tasks/${taskId}/status`)
      .send({ status: "ongoing" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, status: "ongoing" });

    const updatedRecord = db
      .prepare("SELECT status, sort_index FROM tasks WHERE id = ?")
      .get(taskId) as { status: string; sort_index: number | null } | undefined;

    expect(updatedRecord?.status).toBe("ongoing");
    expect(updatedRecord?.sort_index).not.toBeNull();
    expect(updatedRecord?.sort_index).toBeLessThan(20);
  });

  it("clears sort index when moving a task to finished", async () => {
    const taskId = insertTask("Task headed to done", "ongoing");
    db.prepare("UPDATE tasks SET sort_index = ? WHERE id = ?").run(40, taskId);

    const response = await request(app)
      .patch(`/tasks/${taskId}/status`)
      .send({ status: "finished" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, status: "finished" });

    const updatedRecord = db
      .prepare("SELECT status, sort_index FROM tasks WHERE id = ?")
      .get(taskId) as { status: string; sort_index: number | null } | undefined;

    expect(updatedRecord?.status).toBe("finished");
    expect(updatedRecord?.sort_index).toBeNull();
  });

  it("rejects invalid status updates", async () => {
    const taskId = insertTask("Task with invalid status request");

    const response = await request(app)
      .patch(`/tasks/${taskId}/status`)
      .send({ status: "not-a-status" });

    expect(response.status).toBe(400);
  });

  it("returns 404 when updating status for a missing task", async () => {
    const response = await request(app)
      .patch("/tasks/9999/status")
      .send({ status: "next" });

    expect(response.status).toBe(404);
  });

  it("rejects invalid priority updates", async () => {
    const taskId = insertTask("Task with invalid priority request");

    const response = await request(app)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 42 });

    expect(response.status).toBe(400);
  });

  it("updates a task title via PUT /tasks/:id", async () => {
    const taskId = insertTask("Original title");

    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: "  Updated title  " });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, title: "Updated title" });

    const record = db
      .prepare("SELECT title FROM tasks WHERE id = ?")
      .get(taskId) as { title: string } | undefined;
    expect(record?.title).toBe("Updated title");
  });

  it("rejects empty titles on update", async () => {
    const taskId = insertTask("Needs validation");

    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: "   " });

    expect(response.status).toBe(400);
  });

  it("returns 404 when updating a missing task", async () => {
    const response = await request(app)
      .put("/tasks/9999")
      .send({ title: "Doesn't matter" });

    expect(response.status).toBe(404);
  });

  it("orders tasks by ascending priority", async () => {
    const highPriorityId = insertTask("High priority");
    const lowerPriorityId = insertTask("Lower priority");

    db.prepare("UPDATE tasks SET priority = ? WHERE id = ?").run(
      2,
      highPriorityId
    );
    db.prepare("UPDATE tasks SET priority = ? WHERE id = ?").run(
      4,
      lowerPriorityId
    );

    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids.indexOf(highPriorityId)).toBeLessThan(
      ids.indexOf(lowerPriorityId)
    );
  });

  it("supports the expanded set of task statuses", async () => {
    const taskId = insertTask("Task with custom status");

    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run("dates", taskId);

    const response = await request(app)
      .get("/tasks")
      .query({ includeDeleted: "true" });

    expect(response.status).toBe(200);
    const task = response.body.find((item: any) => item.id === taskId);
    expect(task).toBeTruthy();
    expect(task.status).toBe("dates");
  });

  it("creates a task with the provided status", async () => {
    const response = await request(app)
      .post("/tasks")
      .send({ title: "Status-aware task", status: "ongoing" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "ongoing",
      sortIndex: expect.any(Number),
    });

    const record = db
      .prepare("SELECT status, sort_index FROM tasks WHERE id = ?")
      .get(response.body.id) as
      | { status: string; sort_index: number | null }
      | undefined;
    expect(record?.status).toBe("ongoing");
    expect(record?.sort_index).not.toBeNull();
  });

  it("reorders tasks within a status", async () => {
    const first = insertTask("First task");
    const second = insertTask("Second task");
    const third = insertTask("Third task");

    const reorderResponse = await request(app)
      .patch("/tasks/reorder")
      .send({ status: "next", orderedTaskIds: [second, third, first] });

    expect(reorderResponse.status).toBe(204);

    const response = await request(app).get("/tasks");
    expect(response.status).toBe(200);

    const orderedIds = response.body
      .filter((task: any) => task.status === "next" && !task.deletedAt)
      .map((task: any) => task.id);

    expect(orderedIds).toEqual([second, third, first]);
  });

  it("rejects reorder requests for finished status", async () => {
    const finishedTask = insertTask("Finished task", "finished");

    const response = await request(app)
      .patch("/tasks/reorder")
      .send({ status: "finished", orderedTaskIds: [finishedTask] });

    expect(response.status).toBe(400);
  });

  it("rejects reorder requests when a task does not belong to the status", async () => {
    const nextTask = insertTask("Next task");
    const ongoingTask = insertTask("Ongoing task", "ongoing");

    const response = await request(app)
      .patch("/tasks/reorder")
      .send({ status: "next", orderedTaskIds: [nextTask, ongoingTask] });

    expect(response.status).toBe(400);
  });

  it("creates a subtask via POST /tasks/:taskId/subtasks", async () => {
    const taskId = insertTask("Task with subtasks");

    const response = await request(app)
      .post(`/tasks/${taskId}/subtasks`)
      .send({ title: "Write tests" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Write tests",
      deletedAt: null,
      taskId,
    });
    expect(typeof response.body.id).toBe("number");

    const record = db
      .prepare(
        "SELECT task_id, title, deleted_at, sort_index FROM subtasks WHERE id = ?"
      )
      .get(response.body.id) as
      | {
          task_id: number;
          title: string;
          deleted_at: string | null;
          sort_index: number | null;
        }
      | undefined;

    expect(record?.task_id).toBe(taskId);
    expect(record?.title).toBe("Write tests");
    expect(record?.deleted_at).toBeNull();
    expect(record?.sort_index).not.toBeNull();
  });

  it("includes subtasks when fetching tasks", async () => {
    const taskId = insertTask("Task with subtasks");
    const subtask = insertSubtask(taskId, "Refine copy");

    const response = await request(app)
      .get("/tasks")
      .query({ includeDeleted: "true" });

    expect(response.status).toBe(200);
    const task = response.body.find((item: any) => item.id === taskId);
    expect(task).toBeTruthy();
    expect(task.subtasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: subtask.id,
          title: "Refine copy",
          deletedAt: null,
        }),
      ])
    );
  });

  it("updates a subtask title via PUT /tasks/:taskId/subtasks/:subtaskId", async () => {
    const taskId = insertTask("Task with subtasks");
    const subtask = insertSubtask(taskId, "Draft outline");

    const response = await request(app)
      .put(`/tasks/${taskId}/subtasks/${subtask.id}`)
      .send({ title: "Draft outline v2" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: subtask.id,
      title: "Draft outline v2",
      deletedAt: null,
      taskId,
    });

    const record = db
      .prepare("SELECT title FROM subtasks WHERE id = ?")
      .get(subtask.id) as { title: string } | undefined;
    expect(record?.title).toBe("Draft outline v2");
  });

  it("soft deletes a subtask via DELETE /tasks/:taskId/subtasks/:subtaskId", async () => {
    const taskId = insertTask("Task with subtasks");
    const subtask = insertSubtask(taskId, "Archive assets");

    const response = await request(app).delete(
      `/tasks/${taskId}/subtasks/${subtask.id}`
    );

    expect(response.status).toBe(204);

    const record = db
      .prepare(
        "SELECT deleted_at, sort_index FROM subtasks WHERE id = ?"
      )
      .get(subtask.id) as
      | { deleted_at: string | null; sort_index: number | null }
      | undefined;

    expect(record?.deleted_at).not.toBeNull();
    expect(record?.sort_index).toBeNull();
  });

  it("restores a soft-deleted subtask via PATCH /tasks/:taskId/subtasks/:subtaskId/restore", async () => {
    const taskId = insertTask("Task with subtasks");
    const subtask = insertSubtask(taskId, "Review PR");
    await request(app).delete(`/tasks/${taskId}/subtasks/${subtask.id}`);

    const response = await request(app).patch(
      `/tasks/${taskId}/subtasks/${subtask.id}/restore`
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: subtask.id,
      title: "Review PR",
      deletedAt: null,
      taskId,
    });

    const record = db
      .prepare(
        "SELECT deleted_at, sort_index FROM subtasks WHERE id = ?"
      )
      .get(subtask.id) as
      | { deleted_at: string | null; sort_index: number | null }
      | undefined;

    expect(record?.deleted_at).toBeNull();
    expect(record?.sort_index).not.toBeNull();
  });
});
