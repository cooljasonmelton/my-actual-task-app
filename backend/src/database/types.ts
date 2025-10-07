import type { Status, Task } from "../../../shared/types/task";

export type { Status, Task };

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
