import { useId, useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import Modal from "@/components/design-system-components/modal/Modal";
import ConfirmationModalContent from "./ConfirmationModalContent";
import type { TaskProps } from "../types";
import "./Task.css";

const Task = ({
  task,
  onDelete,
  onRestore,
  onTogglePriority,
  onUpdateTitle,
  onCreateSubtask,
  onUpdateSubtaskTitle,
  onDeleteSubtask,
  onRestoreSubtask,
  isExpanded,
  onToggleExpanded,
  isSoftDeleted,
  isSoftDeletedToday,
  isPriorityUpdating,
  draggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  draggingSubtask,
  dragOverSubtaskId,
  onSubtaskDragStart,
  onSubtaskDragEnter,
  onSubtaskDragOver,
  onSubtaskDragLeave,
  onSubtaskDrop,
  onSubtaskDragEnd,
  onSubtaskListDragOver,
  onSubtaskListDrop,
  onCheckboxSoftDelete,
}: TaskProps) => {
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const isDraggable = draggable && !isTitleEditing && !isExpanded;
  const taskCardClassName = `card task${
    isSoftDeleted ? " task--soft-deleted" : ""
  }${isDraggable ? " task--draggable" : ""}${
    isDragging ? " task--dragging" : ""
  }${isDragOver ? " task--drag-over" : ""}`;

  const handleConfirmRestore = async () => {
    if (isRestoring) {
      return;
    }

    setIsRestoring(true);
    try {
      await onRestore(task.id);
      setIsRestoreModalOpen(false);
    } catch (error) {
      console.error("Failed to restore task", error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDismissRestoreModal = () => {
    if (isRestoring) {
      return;
    }
    setIsRestoreModalOpen(false);
  };

  return (
    <>
      <div
        className={taskCardClassName}
        draggable={isDraggable}
        onDragStart={
          isDraggable ? (event) => onDragStart?.(event, task) : undefined
        }
        onDragEnter={
          isDraggable ? (event) => onDragEnter?.(event, task) : undefined
        }
        onDragOver={
          isDraggable ? (event) => onDragOver?.(event, task) : undefined
        }
        onDragLeave={
          isDraggable ? (event) => onDragLeave?.(event, task) : undefined
        }
        onDragEnd={
          isDraggable ? (event) => onDragEnd?.(event, task) : undefined
        }
        onDrop={isDraggable ? (event) => onDrop?.(event, task) : undefined}
      >
        <TaskHeader
          taskId={task.id}
          title={task.title}
          priority={task.priority}
          isExpanded={isExpanded}
          toggleExpanded={() => onToggleExpanded(task.id)}
          onDelete={onDelete}
          onTogglePriority={onTogglePriority}
          onUpdateTitle={onUpdateTitle}
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          isPriorityUpdating={isPriorityUpdating}
          onTitleEditingChange={setIsTitleEditing}
          onRestoreRequest={() => setIsRestoreModalOpen(true)}
          hasSubtasks={task.subtasks.length > 0}
          onCheckboxSoftDelete={onCheckboxSoftDelete}
        />
        {/* TODO: add animation to expansion */}
        {isExpanded && (
          <TaskContent
            taskId={task.id}
            subtasks={task.subtasks}
            isSoftDeleted={isSoftDeleted}
            onCreateSubtask={onCreateSubtask}
            onUpdateSubtaskTitle={onUpdateSubtaskTitle}
            onDeleteSubtask={onDeleteSubtask}
            onRestoreSubtask={onRestoreSubtask}
            draggingSubtask={draggingSubtask}
            dragOverSubtaskId={dragOverSubtaskId}
            onSubtaskDragStart={onSubtaskDragStart}
            onSubtaskDragEnter={onSubtaskDragEnter}
            onSubtaskDragOver={onSubtaskDragOver}
            onSubtaskDragLeave={onSubtaskDragLeave}
            onSubtaskDrop={onSubtaskDrop}
            onSubtaskDragEnd={onSubtaskDragEnd}
            onSubtaskListDragOver={onSubtaskListDragOver}
            onSubtaskListDrop={onSubtaskListDrop}
          />
        )}
      </div>
      <Modal
        isOpen={isRestoreModalOpen}
        onDismiss={handleDismissRestoreModal}
        isDismissDisabled={isRestoring}
        labelledBy={modalTitleId}
        describedBy={modalDescriptionId}
      >
        <ConfirmationModalContent
          titleId={modalTitleId}
          title="Restore task?"
          confirmLabel="Restore"
          cancelLabel="Cancel"
          confirmLoadingLabel="Restoring..."
          onCancel={handleDismissRestoreModal}
          onConfirm={handleConfirmRestore}
          isConfirming={isRestoring}
        />
      </Modal>
    </>
  );
};

export default Task;
