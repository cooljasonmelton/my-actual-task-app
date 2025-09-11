interface Tag {
  id: number;
  name: string;
  color: string; // maybe later - not for MVP
}

interface Subtask {
  id: number;
  title: string;
  deletedAt: Date;
  order: number;
}

export interface Task {
  id: number;
  title: string;
  description: string; // rich text
  priority: 1 | 2 | 3 | 4 | 5;
  createdAt: Date;
  deletedAt: Date | null;
  status: "next" | "ongoing" | "backburner" | "finished";
  tags: Tag[];
  subtasks: Subtask[];
}

export interface CreateTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string; // rich text
  priority?: 1 | 2 | 3 | 4 | 5;
  status?: "next" | "ongoing" | "backburner" | "finished";
}
