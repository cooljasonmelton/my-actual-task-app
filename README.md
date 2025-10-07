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
};
```

## OTHER FEATURE IDEAS

- scratch pad for some quick notes
- quick todo list or quick view similar to momentum extension todo list
- first open of day, prompt user to review todos in 'next'
  - store 'last opened' date in cookie or local storage
  - compare date on mount, if new date, open modal of current todos with option to delete each
  - comfirm button overwrites date in storage to new date
