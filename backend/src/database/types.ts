import type { Status, Task } from "../../../shared/types/task";
import type { Note as SharedNote } from "../../../shared/types/note";

export type { Status, Task };
export type Note = SharedNote;

export interface CreateTaskRequest {
  title: string;
  status?: Status;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: Task["priority"];
  status?: Status;
}
