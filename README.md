# my-actual-task-app

## TODO

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
