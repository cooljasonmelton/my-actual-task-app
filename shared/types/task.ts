export type Status =
  | "next"
  | "dates"
  | "ongoing"
  | "get"
  | "backburner"
  | "finished";
export type Priority = 1 | 2 | 3 | 4 | 5;

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Subtask {
  id: number;
  title: string;
  deletedAt: Date | null;
  order: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  sortIndex: number | null;
  createdAt: Date;
  deletedAt: Date | null;
  status: Status;
  tags: Tag[];
  subtasks: Subtask[];
}
