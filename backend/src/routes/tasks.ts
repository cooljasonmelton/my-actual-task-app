import { Router, Request, Response } from "express";
import { taskQueries } from "../database/db";
import { CreateTaskRequest, UpdateTaskRequest } from "../database/types";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();

// GET all tasks
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const tasks = taskQueries.getAll();
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
    const { title }: CreateTaskRequest = req.body;

    if (!title) {
      const error: ApiError = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    try {
      const { id } = taskQueries.create({ title });
      res.status(201).json({ id, title });
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

    const { changes } = taskQueries.update(id, { title });

    if (changes === 0) {
      const error: ApiError = new Error("title not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ id, title });
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
