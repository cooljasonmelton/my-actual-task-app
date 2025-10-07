# My Actual Task App

My Actual Task App is a full-stack productivity dashboard I’m building to keep my day organised. It combines a modern React frontend with a lightweight Express + SQLite backend so I can iterate quickly while keeping everything in one repo. The app highlights the tasks I care about (priority stars, flexible status buckets), lets me soft delete without losing data, and even keeps my browser awake when I’m in focus mode.

## ✨ Highlights

- **Priority-Driven Workflow** – Toggle the star to mark a task as urgent. The UI sorts by priority and reflects the change instantly while the backend keeps everything in sync.
- **Rich Status Buckets** – Tasks flow between `next`, `dates`, `ongoing`, `get`, `backburner`, and `finished`, with live counts surfaced in the dashboard header.
- **Soft Delete Safety Net** – Deleted tasks move to an archival state and drop to low priority instead of disappearing outright.
- **Environment-Aware Data** – Separate personal vs. dev SQLite databases, one-command syncing, and automated backups so I can experiment without losing my actual todo list.
- **Quality of Life Utilities** – Wake-lock toggle, keyboard accessibility, ref-focused forms, and automated tests (Vitest) on both sides of the stack.

## 🛠️ Tech Stack

| Layer    | Technologies                                                              |
| -------- | ------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, lucide-react, custom design system components |
| Backend  | Node.js, Express, better-sqlite3, TypeScript                              |
| Tooling  | Vitest, Testing Library, ts-node, nodemon                                 |
| Scripts  | AppleScript helpers to launch FE/BE together, DB backup & sync utilities  |

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/my-actual-task-app.git
cd my-actual-task-app
npm install
```

### 2. Configure Environments

```bash
cp backend/.env.personal.example backend/.env.personal
cp backend/.env.development.example backend/.env.development
```

- Adjust `DATABASE_PATH` or other env vars if you want custom locations.
- Personal and development profiles resolve to different SQLite files by default.

### 3. Run the App

```bash
# Personal profile (uses your real daily tasks)
npm run use:all

# Development profile (safe sandbox to experiment)
npm run dev:all
```

The scripts open two Terminal tabs: one for the Vite dev server and one for the Express backend with the correct `APP_ENV` wired in.

### 4. Utilities & Scripts

```bash
# Run full test suite
npm run test:all

# Backend-only / Frontend-only tests
npm run backend:test
npm run test --prefix frontend

# Create timestamped DB backups
npm run db:backup:personal --prefix backend
npm run db:backup:dev --prefix backend

# Sync personal tasks into the dev database
npm run db:sync --prefix backend
```

## 🧭 Project Structure

- `frontend/` – React application, task container logic, dashboard header, design-system components, Vitest tests.
- `backend/` – Express API, SQLite integration, migrations, route tests, scripts for backups/sync.
- `shared/` – Source of truth for TypeScript types shared across both sides.
- `package.json` (root) – Convenience scripts to orchestrate both apps simultaneously.

## 🔭 Roadmap & Wishlist

- Rich-text task descriptions and tag management.
- Drag-and-drop reordering with drop targets in the status header.
- Background job to auto-flip soft-deleted tasks into the `finished` bucket at day’s end.
- More analytics around productivity trends (streaks, bursts, etc.).

---

<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

# JUNKYARD / NOTES

# my-actual-task-app

## USING APP

run app for personal use

```
npm run use:all
```

start all with dev db

```
npm run dev:all
```

## TODO

PRODUCTION NOTE:

- BE: Fix CORS before every pushing to production

### FRONTEND

- React
- colors: https://coolors.co/111827-1f2937-ff2d95-39ff14-ffef00-00bfff-f5f5f5-a3a3a3-000000

- TODO: FE: figure out rich text for description
- TODO: BE: figure out how to have a BE job that sets 'status' of all tasks with 'deletedAt' to 'finished' overnight so finished tasks exist on todo list and can be un-deleted from same status list until end of day
- TODO: FE: drag and drop - to change order of tasks OR drop on section button to update status of task to move it to that container
- TODO: FE: animation on submit new task, complete task
- TODO: FE: move all text to conts at top of file

#### features

- Nav

  - Name / Logo /
    - ? Redirects to home or refreshes dashboard call?
  - Keep Awake button - feature clicking keeps browser from going to sleep

- Header

  - X Create task form input and button

    - Hook up logic for save new task
    - error handling for form

  - Filter buttons

    - Filter / Sort by:

      - Search tasks (filter by search terms)
      - Filter by status
      - Date created or reverse (newest first or oldest first)
      - Priority
      - ? alphabetical

    - Number of tasks in each filter like "Next [2]"

<!--  -->

# TODO FILTERING

- For MVP, filter tasks on FE
- Later, implement adaptative filtering:
  - When a user has > 2000 tasks, pull tasks from BE instead of FE
    - get task count and check > 2000
      - if <2000, use frontend filtering
      - if >2000, fetch get `/api/tasks?status=${status}`

<!--  -->

- Tasks

  - Title, Priority Star, Hide/show rest
  - Rich Text Description (optional)
  - Display Subtasks (optional)
  - Display Tags (optional)
  - Reorder tasks drag and drop
  - Placeholder screen when no tasks

- Subtasks

  - Display
  - Order
  - Reorder subtasks drag and drop

- Tags

  - Display
  - Create when adding to task: name, color (later)

-

### BACKEND

- Node.js + Express + SQLite with better-sqlite3
-

#### Environment profiles & databases

- Environment variables live under `backend/`. Copy the sample files to create real configs:
  - `cp backend/.env.development.example backend/.env.development`
  - `cp backend/.env.personal.example backend/.env.personal`
- Set `APP_ENV` to choose which file to load. Example commands:
  - `npm run dev:dev --prefix backend` (uses `APP_ENV=development`)
  - `npm run dev:personal --prefix backend` (uses `APP_ENV=personal`)
  - `npm run db:backup:dev --prefix backend` / `npm run db:backup:personal --prefix backend`
- Use the root scripts to launch both apps:
  - `npm run use:all` → personal profile (`APP_ENV=personal`).
  - `npm run dev:all` → development profile (`APP_ENV=development`).
- Each environment can point at its own `DATABASE_PATH`. If you don’t set one, the defaults are:
  - personal → `backend/data/tasks.personal.sqlite`
  - development → `backend/data/tasks.dev.sqlite`
  - anything else → `backend/database.db`
- Sync the personal DB into the dev DB anytime with `npm run db:sync --prefix backend`. Pass `--from`/`--to` (or `--from-path`/`--to-path`) if you need custom sources.
- Tests always run against an in-memory database; they no longer mutate the files from your personal profile.

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
  deletedAt: Date | null;
  status: "next" | "ongoing" | "backburner" | "finished";
  tags: Tag[];
  subtasks: Subtasks[];
  sortIndex: number // ?
};
```

## OTHER FEATURE IDEAS

- scratch pad for some quick notes
- quick todo list or quick view similar to momentum extension todo list
- first open of day, prompt user to review todos in 'next'
  - store 'last opened' date in cookie or local storage
  - compare date on mount, if new date, open modal of current todos with option to delete each
  - comfirm button overwrites date in storage to new date
