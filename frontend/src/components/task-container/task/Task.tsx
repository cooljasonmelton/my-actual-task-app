import { useId, useState } from "react";
import TaskHeader from "./TaskHeader";
import TaskContent from "./TaskContent";
import Modal from "../../design-system-components/modal/Modal";
import ConfirmationModalContent from "./ConfirmationModalContent";
import "./Task.css";
import type { TaskProps } from "../types";

const Task = ({
  task,
  onDelete,
  onRestore,
  onTogglePriority,
  onUpdateTitle,
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
}: TaskProps) => {
  // TODO: add animation to expansion
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const isDraggable = draggable && !isTitleEditing;
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
          toggleExpanded={() => setIsExpanded(!isExpanded)}
          onDelete={onDelete}
          onTogglePriority={onTogglePriority}
          onUpdateTitle={onUpdateTitle}
          isSoftDeleted={isSoftDeleted}
          isSoftDeletedToday={isSoftDeletedToday}
          isPriorityUpdating={isPriorityUpdating}
          onTitleEditingChange={setIsTitleEditing}
          onRestoreRequest={() => setIsRestoreModalOpen(true)}
        />
        {isExpanded && <TaskContent />}
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
          onCancel={handleDismissRestoreModal}
          onConfirm={handleConfirmRestore}
          isConfirming={isRestoring}
        />
      </Modal>
    </>
  );
};

export default Task;
