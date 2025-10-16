# My Actual Task App

My Actual Task App is my actual task map, a full-stack productivity dashboard I’m building to keep my day organized. It combines a modern React frontend with a lightweight Express + SQLite backend so I can iterate quickly while keeping everything in one repo. The app highlights tasks I care about (priority stars, flexible status buckets, drag-and-drop reordering), lets me soft delete without losing data, and has convienence features like keyboard accessibility and a toggle to keep my browser awake.

## ✨ Highlights

- **Priority-Driven Workflow** – Toggle the star to mark a task as urgent. The UI sorts by priority and reflects the change instantly while the backend keeps everything in sync.
- **Rich Status Buckets** – Tasks flow between `next`, `dates`, `ongoing`, `get`, `backburner`, and `finished`, with live counts surfaced in the dashboard header.
- **Soft Delete Safety Net** – Deleted tasks move to an archival state and drop to low priority instead of disappearing outright.
- **Drag & Drop Reordering** – Grab a task to rearrange it within its current status column; changes persist instantly for priority-driven sorting.
- **Live Loading Feedback** – Animated spinner plus typewriter status copy shows when tasks are reloading, keeping the UI lively without breaking the existing styling.
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

#### ℹ️ Useful Scripts

```bash
# Use app locally with personal database
npm run use:all

# Run app locally with dev database
npm run dev:all

# Run frontend and backend tests
npm run dev:all
```

## 🧭 Project Structure

- `frontend/` – React application, task container logic, drag-and-drop utilities, dashboard header, design-system components, Vitest tests.
- `backend/` – Express API, SQLite integration, migrations, route tests, scripts for backups/sync.
- `shared/` – Source of truth for TypeScript types shared across both sides.
- `package.json` (root) – Convenience scripts to orchestrate both apps simultaneously.

## 🔭 Roadmap & Wishlist

### short term

- Rich-text task descriptions
- Tag management and sorting
- Double click task title to edit
- Restore soft-deleted tasks, permantely delete soft-deleted tasks
- Subtasks for breaking big tasks into steps
- Drag-and-drop reassignment between sections (drop onto tab to move status).
- Sort (asc/desc) and filter by tag, created date, priority
- Multi-done checkboxes: task requires multiple iterations, create multiple checkboxes tallying each complete iteration e.g. answer 3 emails: [ x ] [ x ][ ]
- Screen saver that auto plays and keeps computer awake after x seconds

### long term

- Search bar for tasks
- Analytics around productivity trends
- AI ADHD helpers to help give suggestions on tasks, brainstorm, keep focused, etc
- Animnations for creating task, completing task, or completing X number of tasks (rewards)
- Scratch pad for some quick notes
- Quick tasks list or quick view similar to momentum extension todo list?
- Stale tasks - if date is greater than X, style task to indicate stale
- First app open of day, prompt user to review tasks in 'next' and setup days goals (cookies or storage)
- Settings page allowing to alter some of the features, maybe colors, fonts, degrees of certain things etc

---

<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

# JUNKYARD / NOTES

TODO: say something like this in main readme (above)?

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

## TODO

- TODO: FE: update test coverage to cover all logic
- TODO: BE: update test coverage to cover all logic
- TODO: FE: slightly change styling for priority tasks
- TODO: BE: Production: Fix CORS allowing all sites before ever pushing to production
- TODO: FE: error handling and messaging on create task form
- TODO: FE: better empty task section placeholder

### FRONTEND NOTES

- colors: https://coolors.co/111827-1f2937-ff2d95-39ff14-ffef00-00bfff-f5f5f5-a3a3a3-000000

# TODO FILTERING

- For MVP, filter tasks on FE
- Later, implement adaptative filtering:

  - When a user has > 2000 tasks, pull tasks from BE instead of FE
    - get task count and check > 2000
      - if <2000, use frontend filtering
      - if >2000, fetch get `/api/tasks?status=${status}`

- Tasks

  - Rich Text Description (optional)
  - Display Subtasks (optional)
  - Display Tags (optional)
  - Placeholder screen when no tasks

- Subtasks

  - Display
  - Order
  - Reorder subtasks drag and drop

- Tags

  - Display
  - Create when adding to task: name, color (later)

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
