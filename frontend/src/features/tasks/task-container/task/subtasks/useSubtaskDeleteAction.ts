import { useCallback, useState } from "react";

type UseSubtaskDeleteActionOptions = {
  taskId: number;
  subtaskId: number;
  onDeleteSubtask: (taskId: number, subtaskId: number) => Promise<void>;
  isTaskSoftDeleted: boolean;
};

const useSubtaskDeleteAction = ({
  taskId,
  subtaskId,
  onDeleteSubtask,
  isTaskSoftDeleted,
}: UseSubtaskDeleteActionOptions) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (isTaskSoftDeleted || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onDeleteSubtask(taskId, subtaskId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete subtask";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [isTaskSoftDeleted, isDeleting, onDeleteSubtask, subtaskId, taskId]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDeleting,
    error,
    handleDelete,
    resetError,
  };
};

export default useSubtaskDeleteAction;
