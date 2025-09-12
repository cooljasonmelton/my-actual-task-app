import type { TaskType } from "../types";

export const mockTasks: TaskType[] = [
  {
    id: "t1",
    title: "Finish frontend setup",
    description:
      "<p>Set up <strong>Vite + React + Tailwind</strong> for the project</p>",
    priority: 3,
    createdAt: new Date("2025-09-01T09:00:00Z"),
    deletedAt: null,
    status: "next",
    tags: [
      { id: "tag1", name: "development", color: "#3b82f6" },
      { id: "tag2", name: "frontend", color: "#10b981" },
    ],
    subtasks: [
      { id: "s1", title: "Install dependencies", deletedAt: null, order: 1 },
      { id: "s2", title: "Set up Tailwind config", deletedAt: null, order: 2 },
    ],
  },
  {
    id: "t2",
    title: "Design database schema",
    description:
      "<p>Tasks, <em>subtasks</em>, and tags with relationships.</p>",
    priority: 4,
    createdAt: new Date("2025-09-01T12:00:00Z"),
    deletedAt: null,
    status: "ongoing",
    tags: [{ id: "tag1", name: "development", color: "#3b82f6" }],
    subtasks: [
      { id: "s3", title: "ER diagram", deletedAt: null, order: 1 },
      {
        id: "s4",
        title: "Decide on rich text storage",
        deletedAt: null,
        order: 2,
      },
    ],
  },
  {
    id: "t3",
    title: "Write first API endpoint",
    description:
      "<p>Return <code>/api/tasks</code> with joined tags + subtasks.</p>",
    priority: 2,
    createdAt: new Date("2025-09-02T10:30:00Z"),
    deletedAt: null,
    status: "next",
    tags: [
      { id: "tag3", name: "backend", color: "#f59e0b" },
      { id: "tag4", name: "api", color: "#8b5cf6" },
    ],
    subtasks: [],
  },
  {
    id: "t4",
    title: "Test rich text editor",
    description:
      "<p>Experiment with <u>React Quill</u> and see if it’s good enough for MVP.</p>",
    priority: 1,
    createdAt: new Date("2025-09-02T14:00:00Z"),
    deletedAt: null,
    status: "backburner",
    tags: [{ id: "tag2", name: "frontend", color: "#10b981" }],
    subtasks: [
      { id: "s5", title: "Try bold/italic/links", deletedAt: null, order: 1 },
    ],
  },
  {
    id: "t5",
    title: "Write mock seed script",
    description:
      "<p>Create some <strong>fake tasks</strong> to test UI components.</p>",
    priority: 5,
    createdAt: new Date("2025-09-03T08:45:00Z"),
    deletedAt: null,
    status: "finished",
    tags: [
      { id: "tag1", name: "development", color: "#3b82f6" },
      { id: "tag5", name: "testing", color: "#ef4444" },
    ],
    subtasks: [
      { id: "s6", title: "Define types", deletedAt: null, order: 1 },
      { id: "s7", title: "Create JSON file", deletedAt: null, order: 2 },
    ],
  },
];
