import { Router, Request, Response } from "express";
import { noteQueries } from "../database/noteRepository";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();

const serializeNote = (note: ReturnType<typeof noteQueries.getDefaultNote>) => ({
  id: note.id,
  userId: note.userId,
  content: note.content,
  updatedAt: note.updatedAt.toISOString(),
});

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const note = noteQueries.getDefaultNote();
    res.json(serializeNote(note));
  })
);

router.put(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { content } = req.body ?? {};

    if (typeof content !== "string") {
      const error: ApiError = new Error("Content must be a string");
      error.statusCode = 400;
      throw error;
    }

    const updatedNote = noteQueries.updateDefaultNote(content);
    res.json(serializeNote(updatedNote));
  })
);

export default router;
