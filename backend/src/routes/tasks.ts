// TODO: refactor for smaller file size
import { Router, Request, Response } from "express";
import { taskQueries } from "../database/db";
import { CreateTaskRequest, UpdateTaskRequest } from "../database/types";
import type { Priority, Status } from "../../../shared/types/task";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const VALID_STATUSES: Status[] = [
  "next",
  "dates",
  "ongoing",
  "get",
  "backburner",
  "finished",
];

const isValidStatus = (value: unknown): value is Status =>
  typeof value === "string" && VALID_STATUSES.includes(value as Status);

const router = Router();

// GET all tasks
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const includeDeleted = req.query.includeDeleted === "true";
    const tasks = taskQueries.getAll(includeDeleted);
    res.json(tasks);
  })
);

// GET soft-deleted tasks
router.get(
  "/deleted",
  asyncHandler(async (req: Request, res: Response) => {
    const tasks = taskQueries.getDeleted();
    res.json(tasks);
  })
);

// GET task by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    const task = taskQueries.getById(id);

    if (!task) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(task);
  })
);

// POST new task
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { title, status }: CreateTaskRequest = req.body;

    if (!title) {
      const error: ApiError = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    const normalizedStatus: Status = isValidStatus(status) ? status : "next";

    try {
      const { id } = taskQueries.create({ title, status: normalizedStatus });
      const createdTask = taskQueries.getById(id);
      res
        .status(201)
        .json(createdTask ?? { id, title, status: normalizedStatus });
    } catch (dbError: any) {
      const error: ApiError = new Error(
        "Failed to create title: " + dbError.message
      );
      error.statusCode = 400;
      throw error;
    }
  })
);

// PUT update title
// TODO: update to allow all fields can be updated
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { title }: UpdateTaskRequest = req.body;

    if (isNaN(id)) {
      const error: ApiError = new Error("Invalid title ID");
      error.statusCode = 400;
      throw error;
    }

    if (!title) {
      const error: ApiError = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      const error: ApiError = new Error("Title cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const { changes } = taskQueries.updateTitle(id, trimmedTitle);

    if (changes === 0) {
      const error: ApiError = new Error("title not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedTask = taskQueries.getById(id);

    if (!updatedTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(updatedTask);
  })
);

router.patch(
  "/reorder",
  asyncHandler(async (req: Request, res: Response) => {
    const { status, orderedTaskIds } = req.body as {
      status?: Status;
      orderedTaskIds?: unknown;
    };

    if (!status || !isValidStatus(status)) {
      const error: ApiError = new Error("A valid status is required");
      error.statusCode = 400;
      throw error;
    }

    if (status === "finished") {
      const error: ApiError = new Error(
        "Reordering is not supported for finished tasks"
      );
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(orderedTaskIds) || orderedTaskIds.length === 0) {
      const error: ApiError = new Error(
        "orderedTaskIds must be a non-empty array"
      );
      error.statusCode = 400;
      throw error;
    }

    const taskIds = orderedTaskIds.map((id) => Number.parseInt(String(id), 10));
    if (taskIds.some((id) => Number.isNaN(id))) {
      const error: ApiError = new Error(
        "orderedTaskIds must contain only integers"
      );
      error.statusCode = 400;
      throw error;
    }

    const { updated } = taskQueries.updateSortOrder(status, taskIds);

    if (updated !== taskIds.length) {
      const error: ApiError = new Error(
        "One or more tasks could not be reordered"
      );
      error.statusCode = 400;
      throw error;
    }

    res.status(204).send();
  })
);

router.patch(
  "/:id/priority",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const { priority } = req.body as Pick<UpdateTaskRequest, "priority">;

    if (Number.isNaN(id)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    if (priority === undefined || priority === null) {
      const error: ApiError = new Error("Priority is required");
      error.statusCode = 400;
      throw error;
    }

    const parsedPriority = Number(priority);
    const isValidPriority =
      Number.isInteger(parsedPriority) &&
      parsedPriority >= 1 &&
      parsedPriority <= 5;

    if (!isValidPriority) {
      const error: ApiError = new Error(
        "Priority must be an integer between 1 and 5"
      );
      error.statusCode = 400;
      throw error;
    }

    const normalizedPriority = parsedPriority as Priority;

    const { changes } = taskQueries.updatePriority(id, normalizedPriority);

    if (changes === 0) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedTask = taskQueries.getById(id);

    if (!updatedTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(updatedTask);
  })
);

// DELETE task
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    const { changes } = taskQueries.delete(id);

    if (changes === 0) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(204).send();
  })
);

export default router;
