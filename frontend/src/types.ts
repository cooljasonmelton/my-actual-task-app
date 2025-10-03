export type Status = "next" | "ongoing" | "backburner" | "finished";
type Priority = 1 | 2 | 3 | 4 | 5;

type Tag = {
  id: number;
  name: string;
  color: string; // maybe later - not for MVP
};

type Subtask = {
  id: number;
  title: string;
  deletedAt: Date | null;
  order: number;
};

export type TaskType = {
  id: number;
  title: string;
  description: string; // rich text
  priority: Priority;
  createdAt: Date;
  deletedAt: Date | null;
  status: Status;
  tags: Tag[];
  subtasks: Subtask[];
};

export type StatusSectionTabItem = {
  cta: string;
  value: Status;
};
