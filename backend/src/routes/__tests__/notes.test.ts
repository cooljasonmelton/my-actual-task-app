import request from "supertest";
import type { Application } from "express";
import type Database from "better-sqlite3";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";

let app: Application;
let db: Database.Database;

beforeAll(async () => {
  process.env.DATABASE_PATH = ":memory:";

  const dbModule = await import("../../database/db");
  db = dbModule.default;

  const appModule = await import("../../app");
  app = appModule.default;
});

beforeEach(() => {
  db.exec("DELETE FROM notes;");
  db.exec("DELETE FROM users;");
});

afterAll(() => {
  db.close();
});

describe("Notes routes", () => {
  it("creates a default note on first load", async () => {
    const response = await request(app).get("/notes");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      content: "",
    });
    expect(typeof response.body.id).toBe("number");
    expect(typeof response.body.userId).toBe("number");
    expect(typeof response.body.updatedAt).toBe("string");

    const storedNote = db
      .prepare("SELECT content FROM notes LIMIT 1")
      .get() as { content: string } | undefined;
    expect(storedNote?.content).toBe("");
  });

  it("updates note content via PUT /notes", async () => {
    const updateResponse = await request(app)
      .put("/notes")
      .send({ content: "<p>Hello Notes</p>" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.content).toBe("<p>Hello Notes</p>");

    const fetchResponse = await request(app).get("/notes");
    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body.content).toBe("<p>Hello Notes</p>");
    expect(typeof fetchResponse.body.updatedAt).toBe("string");
    expect(Date.parse(fetchResponse.body.updatedAt)).not.toBeNaN();
  });

  it("rejects non-string content payloads", async () => {
    const response = await request(app)
      .put("/notes")
      .send({ content: 123 });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
