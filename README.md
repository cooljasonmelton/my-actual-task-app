# my-actual-task-app

## TODO

### FRONTEND

- React

#### features

- Search tasks (filter by search terms)
- Filter by status
- Sort by

  - date created or reverse (newest first or oldest first)
  - priority
  - ? alphabetical

- Tasks
  - Title
  - Rich Text Description (optional)
  - Display Subtasks (optional)
  - Display Tags (optional)

### BACKEND

- Node.js + Express + SQLite with better-sqlite3
-

#### models

```typescript
type Tag = {
  id: string;
  name: string;
  color: string; // maybe later - not for MVP
};

type Subtask = {
  id: string;
  title: string;
  deletedAt: Date;
  order: number; // is this right? Track order or default by id or order of tasks saved to array under Task?
};

type Task = {
  id: string;
  title: string;
  description: string; // rich text
  priority; 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
  deletedAt: Date;
  status: "next" | "ongoing" | "backburner" | "finished";
  tags: Tag[];
  subtasks: Subtasks[];
};
```
