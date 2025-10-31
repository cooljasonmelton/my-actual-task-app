import type {
  Status as SharedStatus,
  Priority as SharedPriority,
  Tag as SharedTag,
  Subtask as SharedSubtask,
  Task as SharedTask,
} from "../../shared/types/task";
import type { Note as SharedNote } from "../../shared/types/note";

export type Status = SharedStatus;
export type Priority = SharedPriority;
export type Tag = SharedTag;
export type Subtask = SharedSubtask;
export type TaskType = SharedTask;
export type Note = SharedNote;

export type StatusSectionTabItem = {
  cta: string;
  value: Status;
};
