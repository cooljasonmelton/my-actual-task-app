// TODO: refactor for smaller file size
import { Router, Request, Response } from "express";
import { taskQueries } from "../database/taskRepository";
import { subtaskQueries } from "../database/subtaskRepository";
import { CreateTaskRequest, UpdateTaskRequest } from "../database/types";
import type { Priority, Status } from "../../../shared/types/task";
import { asyncHandler, ApiError } from "../middleware/errorHandler";


// TODO: refactor for one source of truth for FE and BE, prefer easily editable
const VALID_STATUSES: Status[] = [
  "next",
  "dates",
  "ongoing",
  "get",
  "watch",
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

// PATCH update sort_index
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

// PATCH update priorty 
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

// PATCH update status
router.patch(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const { status } = req.body as Pick<UpdateTaskRequest, "status">;

    if (Number.isNaN(id)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    if (!status || !isValidStatus(status)) {
      const error: ApiError = new Error("A valid status is required");
      error.statusCode = 400;
      throw error;
    }

    const updatedTask = taskQueries.updateStatus(id, status);

    if (!updatedTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(updatedTask);
  })
);

// POST create subtask
router.post(
  "/:taskId/subtasks",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const { title } = req.body as { title?: string };

    if (Number.isNaN(taskId)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      const error: ApiError = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    const parentTask = taskQueries.getById(taskId);
    if (!parentTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const createdSubtask = subtaskQueries.create(taskId, trimmedTitle);
    res.status(201).json({ ...createdSubtask, taskId });
  })
);

router.patch(
  "/:taskId/subtasks/reorder",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const { orderedSubtaskIds } = req.body as {
      orderedSubtaskIds?: unknown;
    };

    if (Number.isNaN(taskId)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(orderedSubtaskIds) || orderedSubtaskIds.length === 0) {
      const error: ApiError = new Error(
        "orderedSubtaskIds must be a non-empty array"
      );
      error.statusCode = 400;
      throw error;
    }

    const subtaskIds = orderedSubtaskIds.map((id) =>
      Number.parseInt(String(id), 10)
    );

    if (subtaskIds.some((id) => Number.isNaN(id))) {
      const error: ApiError = new Error(
        "orderedSubtaskIds must contain only integers"
      );
      error.statusCode = 400;
      throw error;
    }

    const parentTask = taskQueries.getById(taskId);
    if (!parentTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    if (subtaskIds.length === 0) {
      const error: ApiError = new Error(
        "orderedSubtaskIds must contain at least one subtask id"
      );
      error.statusCode = 400;
      throw error;
    }

    const activeSubtaskIds = parentTask.subtasks
      .filter((subtask) => !subtask.deletedAt)
      .map((subtask) => subtask.id);

    if (
      subtaskIds.length !== activeSubtaskIds.length ||
      subtaskIds.some((id) => !activeSubtaskIds.includes(id))
    ) {
      const error: ApiError = new Error(
        "orderedSubtaskIds must include every active subtask exactly once"
      );
      error.statusCode = 400;
      throw error;
    }

    subtaskQueries.updateSortOrder(taskId, subtaskIds);

    res.status(204).send();
  })
);

// PUT update subtask title
router.put(
  "/:taskId/subtasks/:subtaskId",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const subtaskId = Number.parseInt(req.params.subtaskId, 10);
    const { title } = req.body as { title?: string };

    if (Number.isNaN(taskId) || Number.isNaN(subtaskId)) {
      const error: ApiError = new Error("Invalid subtask ID");
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = title?.trim();
    if (!trimmedTitle) {
      const error: ApiError = new Error("Title is required");
      error.statusCode = 400;
      throw error;
    }

    const parentTask = taskQueries.getById(taskId);
    if (!parentTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const existingSubtask = subtaskQueries.getById(subtaskId);
    if (!existingSubtask || existingSubtask.taskId !== taskId) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    if (existingSubtask.deletedAt) {
      const error: ApiError = new Error("Cannot edit a deleted subtask");
      error.statusCode = 400;
      throw error;
    }

    const updatedSubtask = subtaskQueries.updateTitle(
      subtaskId,
      trimmedTitle
    );

    if (!updatedSubtask) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ ...updatedSubtask, taskId });
  })
);

// DELETE soft delete subtask
router.delete(
  "/:taskId/subtasks/:subtaskId",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const subtaskId = Number.parseInt(req.params.subtaskId, 10);

    if (Number.isNaN(taskId) || Number.isNaN(subtaskId)) {
      const error: ApiError = new Error("Invalid subtask ID");
      error.statusCode = 400;
      throw error;
    }

    const parentTask = taskQueries.getById(taskId);
    if (!parentTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const existingSubtask = subtaskQueries.getById(subtaskId);
    if (!existingSubtask || existingSubtask.taskId !== taskId) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    const deletedSubtask = subtaskQueries.softDelete(subtaskId);
    if (!deletedSubtask) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(204).send();
  })
);

// PATCH restore subtask
router.patch(
  "/:taskId/subtasks/:subtaskId/restore",
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const subtaskId = Number.parseInt(req.params.subtaskId, 10);

    if (Number.isNaN(taskId) || Number.isNaN(subtaskId)) {
      const error: ApiError = new Error("Invalid subtask ID");
      error.statusCode = 400;
      throw error;
    }

    const parentTask = taskQueries.getById(taskId);
    if (!parentTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    const existingSubtask = subtaskQueries.getById(subtaskId);
    if (!existingSubtask || existingSubtask.taskId !== taskId) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    if (!existingSubtask.deletedAt) {
      const error: ApiError = new Error("Subtask is not deleted");
      error.statusCode = 400;
      throw error;
    }

    const restoredSubtask = subtaskQueries.restore(subtaskId);

    if (!restoredSubtask) {
      const error: ApiError = new Error("Subtask not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ ...restoredSubtask, taskId });
  })
);

// PATCH restore soft deleted task
router.patch(
  "/:id/restore",
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      const error: ApiError = new Error("Invalid task ID");
      error.statusCode = 400;
      throw error;
    }

    const restoredTask = taskQueries.restore(id);

    if (!restoredTask) {
      const error: ApiError = new Error("Task not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(restoredTask);
  })
);

// DELETE task
// TODO: update to capture soft and hard delete
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
