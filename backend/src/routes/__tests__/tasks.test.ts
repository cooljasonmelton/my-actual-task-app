import request from "supertest";
import type { Application } from "express";
import type Database from "better-sqlite3";
import type { Server } from "http";
import type { AddressInfo } from "net";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import type { Status } from "../../database/types";

let app: Application;
let db: Database.Database;
let taskQueries: typeof import("../../database/db").taskQueries;
let server: Server;
let baseUrl: string;

const insertTask = (title: string, status: Status = "next") => {
  const { id } = taskQueries.create({ title, status });
  return Number(id);
};

beforeAll(async () => {
  process.env.DATABASE_PATH = ":memory:";

  const dbModule = await import("../../database/db");
  db = dbModule.default;
  taskQueries = dbModule.taskQueries;

  const appModule = await import("../../app");
  app = appModule.default;

  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo | null;
  if (!address || typeof address === "string") {
    throw new Error("Failed to determine server address for tests");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

beforeEach(() => {
  db.exec("DELETE FROM tasks;");
});

afterAll(() => {
  db.close();
  server?.close();
});

describe("Tasks routes", () => {
  it("returns only active tasks by default", async () => {
    const activeId = insertTask("Active task");
    const deletedId = insertTask("Deleted task");
    db.prepare("UPDATE tasks SET deleted_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      deletedId
    );

    const response = await request(baseUrl).get("/tasks");

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

    const response = await request(baseUrl)
      .get("/tasks")
      .query({ includeDeleted: "true" });

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids).toContain(activeId);
    expect(ids).toContain(deletedId);
  });

  it("soft deletes a task via DELETE /tasks/:id", async () => {
    const taskId = insertTask("Task to delete");

    const response = await request(baseUrl).delete(`/tasks/${taskId}`);

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

  it("updates a task priority via PATCH /tasks/:id/priority", async () => {
    const taskId = insertTask("Task to prioritize");

    const response = await request(baseUrl)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: taskId, priority: 1 });

    const record = db
      .prepare("SELECT priority FROM tasks WHERE id = ?")
      .get(taskId) as { priority: number } | undefined;
    expect(record?.priority).toBe(1);
  });

  it("rejects invalid priority updates", async () => {
    const taskId = insertTask("Task with invalid priority request");

    const response = await request(baseUrl)
      .patch(`/tasks/${taskId}/priority`)
      .send({ priority: 42 });

    expect(response.status).toBe(400);
  });

  it("updates a task title via PUT /tasks/:id", async () => {
    const taskId = insertTask("Original title");

    const response = await request(baseUrl)
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

    const response = await request(baseUrl)
      .put(`/tasks/${taskId}`)
      .send({ title: "   " });

    expect(response.status).toBe(400);
  });

  it("returns 404 when updating a missing task", async () => {
    const response = await request(baseUrl)
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

    const response = await request(baseUrl).get("/tasks");

    expect(response.status).toBe(200);
    const ids = response.body.map((task: any) => task.id);
    expect(ids.indexOf(highPriorityId)).toBeLessThan(
      ids.indexOf(lowerPriorityId)
    );
  });

  it("supports the expanded set of task statuses", async () => {
    const taskId = insertTask("Task with custom status");

    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run("dates", taskId);

    const response = await request(baseUrl)
      .get("/tasks")
      .query({ includeDeleted: "true" });

    expect(response.status).toBe(200);
    const task = response.body.find((item: any) => item.id === taskId);
    expect(task).toBeTruthy();
    expect(task.status).toBe("dates");
  });

  it("creates a task with the provided status", async () => {
    const response = await request(baseUrl)
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

    const reorderResponse = await request(baseUrl)
      .patch("/tasks/reorder")
      .send({ status: "next", orderedTaskIds: [second, third, first] });

    expect(reorderResponse.status).toBe(204);

    const response = await request(baseUrl).get("/tasks");
    expect(response.status).toBe(200);

    const orderedIds = response.body
      .filter((task: any) => task.status === "next" && !task.deletedAt)
      .map((task: any) => task.id);

    expect(orderedIds).toEqual([second, third, first]);
  });

  it("rejects reorder requests for finished status", async () => {
    const finishedTask = insertTask("Finished task", "finished");

    const response = await request(baseUrl)
      .patch("/tasks/reorder")
      .send({ status: "finished", orderedTaskIds: [finishedTask] });

    expect(response.status).toBe(400);
  });

  it("rejects reorder requests when a task does not belong to the status", async () => {
    const nextTask = insertTask("Next task");
    const ongoingTask = insertTask("Ongoing task", "ongoing");

    const response = await request(baseUrl)
      .patch("/tasks/reorder")
      .send({ status: "next", orderedTaskIds: [nextTask, ongoingTask] });

    expect(response.status).toBe(400);
  });
});
